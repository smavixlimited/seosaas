import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CouponsService } from "@/services/coupons.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { AppError } from "@/server/lib/errors";

const validateCouponSchema = z.object({
  code: z.string(),
  planId: z.string(),
  amount: z.number(),
  currency: z.string().default("USD"),
});

export const validateCouponServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => validateCouponSchema.parse(d))
  .handler(async ({ data }) => {
    return CouponsService.validateCoupon({
      code: data.code,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
    });
  });

export const adminListCouponsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return CouponsService.listCoupons();
  });

const createCouponSchema = z.object({
  code: z.string().min(2),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().positive(),
  currency: z.string().optional(),
  applicablePlans: z.array(z.string()).optional(),
  customerEligibility: z
    .enum(["all", "new_customers_only", "existing_customers_only"])
    .default("all"),
  maxRedemptions: z.number().int().positive().optional().nullable(),
  maxRedemptionsPerUser: z.number().int().positive().default(1),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const adminCreateCouponServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(createCouponSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return CouponsService.createCoupon({
      ...data,
      maxRedemptions: data.maxRedemptions ?? undefined,
      expiresAt: data.expiresAt ?? undefined,
    });
  });

const updateCouponSchema = z.object({
  id: z.string(),
  data: createCouponSchema.partial(),
});

export const adminUpdateCouponServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateCouponSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return CouponsService.updateCoupon(data.id, {
      ...data.data,
      maxRedemptions: data.data.maxRedemptions ?? undefined,
      expiresAt: data.data.expiresAt ?? undefined,
    });
  });

const deleteCouponSchema = z.object({
  id: z.string(),
});

export const adminDeleteCouponServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(deleteCouponSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return CouponsService.deleteCoupon(data.id);
  });

const toggleCouponSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export const adminToggleCouponServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(toggleCouponSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return CouponsService.toggleCouponActive(data.id, data.isActive);
  });
