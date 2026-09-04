import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { saasCoupons, couponRedemptions, manualPayments } from "@/db/schema";
import crypto from "crypto";

export type CustomerEligibilityType = "all" | "new_customers_only" | "existing_customers_only";

export interface SaasCouponDto {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  currency: string | null;
  applicablePlans: string[] | null;
  customerEligibility: CustomerEligibilityType;
  maxRedemptions: number | null; // Total global cap across all customers
  timesRedeemed: number;
  maxRedemptionsPerUser: number; // Usage limit per individual customer
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  errorCode?:
    | "INVALID_CODE"
    | "INACTIVE"
    | "EXPIRED"
    | "MAX_REACHED"
    | "ALREADY_USED"
    | "NOT_APPLICABLE_PLAN"
    | "CURRENCY_MISMATCH"
    | "NEW_CUSTOMERS_ONLY"
    | "EXISTING_CUSTOMERS_ONLY";
  coupon?: {
    id: string;
    code: string;
    description: string | null;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
    customerEligibility: CustomerEligibilityType;
    maxRedemptions: number | null;
    timesRedeemed: number;
    maxRedemptionsPerUser: number;
  };
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  currency?: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  currency?: string;
  applicablePlans?: string[];
  customerEligibility?: CustomerEligibilityType;
  maxRedemptions?: number | null; // Global total redemption cap
  maxRedemptionsPerUser?: number; // Per customer usage limit
  expiresAt?: string | null;
  isActive?: boolean;
}

export const CouponsService = {
  /**
   * Validates a coupon code against a plan and user context.
   */
  async validateCoupon(params: {
    code: string;
    planId: string;
    amount: number;
    currency: string;
    userId?: string;
  }): Promise<CouponValidationResult> {
    const cleanCode = params.code.trim().toUpperCase();

    if (!cleanCode) {
      return { valid: false, error: "Please enter a coupon code.", errorCode: "INVALID_CODE" };
    }

    const [coupon] = await db
      .select()
      .from(saasCoupons)
      .where(eq(saasCoupons.code, cleanCode))
      .limit(1);

    if (!coupon) {
      return { valid: false, error: "Coupon code not found.", errorCode: "INVALID_CODE" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "This promo code is no longer active.", errorCode: "INACTIVE" };
    }

    if (coupon.expiresAt) {
      const expiryDate = new Date(coupon.expiresAt);
      if (expiryDate.getTime() < Date.now()) {
        return { valid: false, error: "This promo code has expired.", errorCode: "EXPIRED" };
      }
    }

    // 1. TOTAL CAMPAIGN REDEMPTIONS CAP CHECK (Across ALL users)
    if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return {
        valid: false,
        error: `This promo code has reached its maximum total redemptions limit (${coupon.maxRedemptions} total claims across all users) and is no longer available.`,
        errorCode: "MAX_REACHED",
      };
    }

    // 2. TARGET CUSTOMER ELIGIBILITY CHECK (New vs Existing vs All)
    const eligibility = (coupon.customerEligibility || "all") as CustomerEligibilityType;
    if (params.userId && eligibility !== "all") {
      // Check if user has previously made an approved payment or redeemed a coupon
      const [approvedPayments, pastRedemptions] = await Promise.all([
        db
          .select({ id: manualPayments.id })
          .from(manualPayments)
          .where(and(eq(manualPayments.userId, params.userId), eq(manualPayments.status, "approved")))
          .limit(1),
        db
          .select({ id: couponRedemptions.id })
          .from(couponRedemptions)
          .where(eq(couponRedemptions.userId, params.userId))
          .limit(1),
      ]);

      const isExistingPayingCustomer = approvedPayments.length > 0 || pastRedemptions.length > 0;

      if (eligibility === "new_customers_only" && isExistingPayingCustomer) {
        return {
          valid: false,
          error: "This promo code is strictly reserved for new, first-time subscribers only.",
          errorCode: "NEW_CUSTOMERS_ONLY",
        };
      }

      if (eligibility === "existing_customers_only" && !isExistingPayingCustomer) {
        return {
          valid: false,
          error: "This promo code is an exclusive loyalty reward for existing subscribers only.",
          errorCode: "EXISTING_CUSTOMERS_ONLY",
        };
      }
    }

    // 3. APPLICABLE PLANS CHECK
    if (coupon.applicablePlansJson) {
      try {
        const allowedPlans: string[] = JSON.parse(coupon.applicablePlansJson);
        if (Array.isArray(allowedPlans) && allowedPlans.length > 0) {
          if (!allowedPlans.includes(params.planId)) {
            return {
              valid: false,
              error: `This promo code is not applicable to the ${params.planId.toUpperCase()} plan.`,
              errorCode: "NOT_APPLICABLE_PLAN",
            };
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    // 4. CURRENCY CHECK FOR FIXED AMOUNT DISCOUNTS
    if (coupon.discountType === "fixed_amount" && coupon.currency) {
      if (coupon.currency.toUpperCase() !== params.currency.toUpperCase()) {
        return {
          valid: false,
          error: `This coupon is only valid for ${coupon.currency.toUpperCase()} billing.`,
          errorCode: "CURRENCY_MISMATCH",
        };
      }
    }

    // 5. PER-USER USAGE LIMIT CHECK (Single customer usage cap)
    if (params.userId && coupon.maxRedemptionsPerUser) {
      const redemptions = await db
        .select()
        .from(couponRedemptions)
        .where(
          and(
            eq(couponRedemptions.couponId, coupon.id),
            eq(couponRedemptions.userId, params.userId)
          )
        );

      if (redemptions.length >= coupon.maxRedemptionsPerUser) {
        return {
          valid: false,
          error: `You have reached the maximum allowed usage (${coupon.maxRedemptionsPerUser} time${coupon.maxRedemptionsPerUser > 1 ? "s" : ""}) for this promo code.`,
          errorCode: "ALREADY_USED",
        };
      }
    }

    // 6. CALCULATE DISCOUNT
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      const percentage = Math.min(100, Math.max(0, coupon.discountValue));
      discountAmount = Math.round((params.amount * percentage) / 100);
    } else {
      discountAmount = Math.min(params.amount, Math.max(0, coupon.discountValue));
    }

    const finalAmount = Math.max(0, params.amount - discountAmount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType as "percentage" | "fixed_amount",
        discountValue: coupon.discountValue,
        customerEligibility: eligibility,
        maxRedemptions: coupon.maxRedemptions,
        timesRedeemed: coupon.timesRedeemed,
        maxRedemptionsPerUser: coupon.maxRedemptionsPerUser,
      },
      originalAmount: params.amount,
      discountAmount,
      finalAmount,
      currency: params.currency,
    };
  },

  /**
   * Records a redemption and increments usage count.
   */
  async recordRedemption(params: {
    couponId: string;
    couponCode: string;
    userId: string;
    userEmail: string;
    planId: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    currency: string;
    paymentReference?: string;
  }): Promise<void> {
    await db.insert(couponRedemptions).values({
      id: crypto.randomUUID(),
      couponId: params.couponId,
      couponCode: params.couponCode.toUpperCase(),
      userId: params.userId,
      userEmail: params.userEmail,
      planId: params.planId,
      originalPrice: params.originalPrice,
      discountAmount: params.discountAmount,
      finalPrice: params.finalPrice,
      currency: params.currency,
      paymentReference: params.paymentReference || null,
    });

    await db
      .update(saasCoupons)
      .set({
        timesRedeemed: sql`${saasCoupons.timesRedeemed} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(saasCoupons.id, params.couponId));
  },

  /**
   * Admin: List all coupons with stats.
   */
  async listCoupons(): Promise<SaasCouponDto[]> {
    const rows = await db
      .select()
      .from(saasCoupons)
      .orderBy(desc(saasCoupons.createdAt));

    return rows.map((r: typeof saasCoupons.$inferSelect) => ({
      id: r.id,
      code: r.code,
      description: r.description,
      discountType: r.discountType as "percentage" | "fixed_amount",
      discountValue: r.discountValue,
      currency: r.currency,
      applicablePlans: r.applicablePlansJson ? JSON.parse(r.applicablePlansJson) : null,
      customerEligibility: ((r as unknown as { customerEligibility?: string }).customerEligibility || "all") as CustomerEligibilityType,
      maxRedemptions: r.maxRedemptions,
      timesRedeemed: r.timesRedeemed,
      maxRedemptionsPerUser: r.maxRedemptionsPerUser,
      expiresAt: r.expiresAt,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },

  /**
   * Admin: Create a new coupon.
   */
  async createCoupon(input: CreateCouponInput): Promise<SaasCouponDto> {
    const id = crypto.randomUUID();
    const cleanCode = input.code.trim().toUpperCase();
    const now = new Date().toISOString();
    const eligibility = input.customerEligibility || "all";

    const result = await db
      .insert(saasCoupons)
      .values({
        id,
        code: cleanCode,
        description: input.description?.trim() || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        currency: input.currency?.toUpperCase() || null,
        applicablePlansJson: input.applicablePlans ? JSON.stringify(input.applicablePlans) : null,
        customerEligibility: eligibility,
        maxRedemptions: input.maxRedemptions || null,
        timesRedeemed: 0,
        maxRedemptionsPerUser: input.maxRedemptionsPerUser ?? 1,
        expiresAt: input.expiresAt || null,
        isActive: input.isActive ?? true,
      })
      .returning();

    const created = result && result.length > 0 ? result[0] : null;

    return {
      id: created?.id || id,
      code: created?.code || cleanCode,
      description: created?.description || input.description || null,
      discountType: (created?.discountType || input.discountType) as "percentage" | "fixed_amount",
      discountValue: created?.discountValue ?? input.discountValue,
      currency: created?.currency || input.currency || null,
      applicablePlans: input.applicablePlans || null,
      customerEligibility: eligibility,
      maxRedemptions: created?.maxRedemptions ?? input.maxRedemptions ?? null,
      timesRedeemed: created?.timesRedeemed ?? 0,
      maxRedemptionsPerUser: created?.maxRedemptionsPerUser ?? input.maxRedemptionsPerUser ?? 1,
      expiresAt: created?.expiresAt || input.expiresAt || null,
      isActive: created ? Boolean(created.isActive) : (input.isActive ?? true),
      createdAt: created?.createdAt || now,
      updatedAt: created?.updatedAt || now,
    };
  },

  /**
   * Admin: Update coupon.
   */
  async updateCoupon(id: string, input: Partial<CreateCouponInput>): Promise<SaasCouponDto> {
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.code !== undefined) updatePayload.code = input.code.trim().toUpperCase();
    if (input.description !== undefined) updatePayload.description = input.description.trim() || null;
    if (input.discountType !== undefined) updatePayload.discountType = input.discountType;
    if (input.discountValue !== undefined) updatePayload.discountValue = input.discountValue;
    if (input.currency !== undefined) updatePayload.currency = input.currency ? input.currency.toUpperCase() : null;
    if (input.applicablePlans !== undefined) {
      updatePayload.applicablePlansJson = input.applicablePlans ? JSON.stringify(input.applicablePlans) : null;
    }
    if (input.customerEligibility !== undefined) updatePayload.customerEligibility = input.customerEligibility;
    if (input.maxRedemptions !== undefined) updatePayload.maxRedemptions = input.maxRedemptions || null;
    if (input.maxRedemptionsPerUser !== undefined) updatePayload.maxRedemptionsPerUser = input.maxRedemptionsPerUser;
    if (input.expiresAt !== undefined) updatePayload.expiresAt = input.expiresAt || null;
    if (input.isActive !== undefined) updatePayload.isActive = input.isActive;

    const result = await db
      .update(saasCoupons)
      .set(updatePayload)
      .where(eq(saasCoupons.id, id))
      .returning();

    const updated = result && result.length > 0 ? result[0] : null;

    if (updated) {
      return {
        id: updated.id,
        code: updated.code,
        description: updated.description,
        discountType: updated.discountType as "percentage" | "fixed_amount",
        discountValue: updated.discountValue,
        currency: updated.currency,
        applicablePlans: updated.applicablePlansJson ? JSON.parse(updated.applicablePlansJson) : null,
        customerEligibility: ((updated as unknown as { customerEligibility?: string }).customerEligibility || "all") as CustomerEligibilityType,
        maxRedemptions: updated.maxRedemptions,
        timesRedeemed: updated.timesRedeemed,
        maxRedemptionsPerUser: updated.maxRedemptionsPerUser,
        expiresAt: updated.expiresAt,
        isActive: Boolean(updated.isActive),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }

    const [fetched] = await db.select().from(saasCoupons).where(eq(saasCoupons.id, id)).limit(1);
    if (!fetched) {
      throw new Error(`Coupon with ID ${id} not found`);
    }

    return {
      id: fetched.id,
      code: fetched.code,
      description: fetched.description,
      discountType: fetched.discountType as "percentage" | "fixed_amount",
      discountValue: fetched.discountValue,
      currency: fetched.currency,
      applicablePlans: fetched.applicablePlansJson ? JSON.parse(fetched.applicablePlansJson) : null,
      customerEligibility: ((fetched as unknown as { customerEligibility?: string }).customerEligibility || "all") as CustomerEligibilityType,
      maxRedemptions: fetched.maxRedemptions,
      timesRedeemed: fetched.timesRedeemed,
      maxRedemptionsPerUser: fetched.maxRedemptionsPerUser,
      expiresAt: fetched.expiresAt,
      isActive: Boolean(fetched.isActive),
      createdAt: fetched.createdAt,
      updatedAt: fetched.updatedAt,
    };
  },

  /**
   * Admin: Delete coupon.
   */
  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    await db.delete(saasCoupons).where(eq(saasCoupons.id, id));
    return { success: true };
  },

  /**
   * Admin: Toggle active state.
   */
  async toggleCouponActive(id: string, isActive: boolean): Promise<SaasCouponDto> {
    return this.updateCoupon(id, { isActive });
  },
};
