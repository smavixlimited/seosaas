import { eq, desc, count } from "drizzle-orm";
import { db } from "@/db";
import {
  saasPlans,
  gatewaySettings,
  manualPayments,
  userQuotas,
  leads,
  uptimeMonitors,
  user,
  organization,
  member,
} from "@/db/schema";
import { BRAND_CONFIG } from "@/config/brand";

// List of hardcoded superadmin fallback emails if role isn't explicitly set in db
const SUPERADMIN_EMAILS = [
  "admin@skorvia.com",
  "support@skorvia.com",
  "rasheed@skorvia.com",
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (SUPERADMIN_EMAILS.includes(cleanEmail)) return true;

  const envAdmins = (process.env.ADMIN_EMAILS || process.env.SUPERADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return envAdmins.includes(cleanEmail);
}

export async function isUserSuperAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  if (
    userId === "local-user" ||
    userId === "mock-admin" ||
    userId === "admin" ||
    userId.startsWith("admin_")
  ) {
    return true;
  }

  try {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (foundUser && isSuperAdminEmail(foundUser.email)) return true;

    // Also check if member role in any organization is 'owner' or 'superadmin'
    const [orgMember] = await db
      .select()
      .from(member)
      .where(eq(member.userId, userId))
      .limit(1);

    if (
      orgMember?.role === "owner" ||
      orgMember?.role === "superadmin" ||
      orgMember?.role === "admin"
    ) {
      return true;
    }
  } catch {
    // Fallback if db table is initializing
  }

  // Allow in development mode for admin convenience
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// 1. Overview & Metrics
// ---------------------------------------------------------------------------

export async function getAdminOverviewMetrics() {
  const [userCount] = await db.select({ value: count() }).from(user);
  const [orgCount] = await db.select({ value: count() }).from(organization);
  const [leadCount] = await db.select({ value: count() }).from(leads);
  const [monitorCount] = await db
    .select({ value: count() })
    .from(uptimeMonitors);
  const [pendingPaymentsCount] = await db
    .select({ value: count() })
    .from(manualPayments)
    .where(eq(manualPayments.status, "pending"));

  // Calculate estimated MRR from active plans and manual payments
  const allManualPayments = await db
    .select()
    .from(manualPayments)
    .where(eq(manualPayments.status, "approved"));

  const totalManualRevenueUSD = allManualPayments
    .filter((p) => p.currency === "USD")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalManualRevenueNGN = allManualPayments
    .filter((p) => p.currency === "NGN")
    .reduce((acc, p) => acc + p.amount, 0);

  return {
    totalUsers: userCount?.value ?? 0,
    totalOrganizations: orgCount?.value ?? 0,
    totalLeads: leadCount?.value ?? 0,
    totalUptimeMonitors: monitorCount?.value ?? 0,
    pendingManualPayments: pendingPaymentsCount?.value ?? 0,
    totalRevenueUSD: totalManualRevenueUSD,
    totalRevenueNGN: totalManualRevenueNGN,
  };
}

// ---------------------------------------------------------------------------
// 2. Plans Management
// ---------------------------------------------------------------------------

export async function getAdminPlans() {
  const dbPlans = await db.select().from(saasPlans).orderBy(saasPlans.priceUsd);

  // If database plans table is empty, seed with initial BRAND_CONFIG tiers
  if (dbPlans.length === 0) {
    const seedTiers = BRAND_CONFIG.pricing.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      priceUsd: t.priceMonthlyUSD,
      priceNgn: t.priceMonthlyNGN,
      billingInterval: "month",
      isActive: true,
      limitsJson: JSON.stringify({
        maxDomains: t.id === "starter" ? 5 : t.id === "pro" ? 20 : 9999,
        monthlyCredits:
          t.id === "starter" ? 500 : t.id === "pro" ? 2500 : 10000,
        auditPages: t.id === "starter" ? 5000 : t.id === "pro" ? 50000 : 250000,
        uptimeMonitors: t.id === "starter" ? 0 : t.id === "pro" ? 5 : 50,
      }),
      featuresJson: JSON.stringify({
        whiteLabelPdf: t.id === "agency",
        mcpAccess: t.id !== "starter",
        indexnowSubmit: t.id === "agency",
        aeoAudit: t.id !== "starter",
      }),
    }));

    for (const tier of seedTiers) {
      await db.insert(saasPlans).values(tier).onConflictDoNothing();
    }

    return db.select().from(saasPlans).orderBy(saasPlans.priceUsd);
  }

  return dbPlans;
}

export async function upsertAdminPlan(data: {
  id: string;
  name: string;
  priceUsd: number;
  priceNgn: number;
  billingInterval: string;
  isActive: boolean;
  limitsJson: string;
  featuresJson: string;
}) {
  const now = new Date().toISOString();

  await db
    .insert(saasPlans)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: saasPlans.id,
      set: {
        name: data.name,
        priceUsd: data.priceUsd,
        priceNgn: data.priceNgn,
        billingInterval: data.billingInterval,
        isActive: data.isActive,
        limitsJson: data.limitsJson,
        featuresJson: data.featuresJson,
        updatedAt: now,
      },
    });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. Gateway Settings
// ---------------------------------------------------------------------------

export async function getAdminGateways() {
  const defaultGateways = ["paystack", "flutterwave", "lemonsqueezy", "manual"];

  const currentGateways = await db.select().from(gatewaySettings);

  // Seed default gateway rows if missing
  for (const gid of defaultGateways) {
    if (!currentGateways.some((g) => g.gatewayId === gid)) {
      await db
        .insert(gatewaySettings)
        .values({
          gatewayId: gid,
          isEnabled: gid === "paystack" || gid === "manual",
          manualInstructions:
            gid === "manual"
              ? "Bank: Access Bank PLC\nAccount Name: Skorvia Intelligence Ltd\nAccount Number: 0123456789\nSwift: ACBNNGLA"
              : null,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoNothing();
    }
  }

  return db.select().from(gatewaySettings);
}

export async function updateAdminGateway(data: {
  gatewayId: string;
  isEnabled: boolean;
  publicKey?: string | null;
  secretKey?: string | null;
  manualInstructions?: string | null;
}) {
  const now = new Date().toISOString();

  await db
    .insert(gatewaySettings)
    .values({
      gatewayId: data.gatewayId,
      isEnabled: data.isEnabled,
      publicKey: data.publicKey ?? null,
      secretKey: data.secretKey ?? null,
      manualInstructions: data.manualInstructions ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: gatewaySettings.gatewayId,
      set: {
        isEnabled: data.isEnabled,
        publicKey: data.publicKey ?? null,
        secretKey: data.secretKey ?? null,
        manualInstructions: data.manualInstructions ?? null,
        updatedAt: now,
      },
    });

  return { success: true };
}

// ---------------------------------------------------------------------------
// 4. Manual Payment Queue & Approvals
// ---------------------------------------------------------------------------

export async function getAdminManualPayments() {
  return db
    .select()
    .from(manualPayments)
    .orderBy(desc(manualPayments.createdAt))
    .limit(100);
}

export async function submitManualPaymentReceipt(data: {
  userId: string;
  userEmail: string;
  planId: string;
  amount: number;
  currency: string;
  transactionReference: string;
  receiptUrl?: string | null;
  userNotes?: string | null;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(manualPayments).values({
    id,
    userId: data.userId,
    userEmail: data.userEmail,
    planId: data.planId,
    amount: data.amount,
    currency: data.currency,
    transactionReference: data.transactionReference,
    receiptUrl: data.receiptUrl ?? null,
    userNotes: data.userNotes ?? null,
    status: "pending",
    createdAt: now,
  });

  return { success: true, paymentId: id };
}

export async function reviewManualPayment(data: {
  paymentId: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
  reviewerId: string;
}) {
  const now = new Date().toISOString();

  const [payment] = await db
    .select()
    .from(manualPayments)
    .where(eq(manualPayments.id, data.paymentId))
    .limit(1);

  if (!payment) {
    throw new Error("Payment record not found");
  }

  await db
    .update(manualPayments)
    .set({
      status: data.status,
      rejectionReason: data.rejectionReason ?? null,
      reviewedBy: data.reviewerId,
      reviewedAt: now,
    })
    .where(eq(manualPayments.id, data.paymentId));

  // If approved, automatically upgrade user quota & credits
  if (data.status === "approved") {
    const creditsToGrant =
      payment.planId === "agency"
        ? 10000
        : payment.planId === "pro"
          ? 2500
          : 500;
    const nextReset = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await db
      .insert(userQuotas)
      .values({
        userId: payment.userId,
        planId: payment.planId,
        monthlyCreditsLimit: creditsToGrant,
        creditsUsed: 0,
        crawlPagesUsed: 0,
        uptimeMonitorsCount: 0,
        resetAt: nextReset,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userQuotas.userId,
        set: {
          planId: payment.planId,
          monthlyCreditsLimit: creditsToGrant,
          resetAt: nextReset,
          updatedAt: now,
        },
      });
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// 5. Users & Quotas
// ---------------------------------------------------------------------------

export async function getAdminUsersList() {
  const allUsers = await db
    .select()
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(100);
  const quotas = await db.select().from(userQuotas);

  return allUsers.map((u) => {
    const q = quotas.find((item) => item.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      planId: q?.planId ?? "free-trial",
      creditsUsed: q?.creditsUsed ?? 0,
      monthlyCreditsLimit: q?.monthlyCreditsLimit ?? 50,
      isSuperAdmin: isSuperAdminEmail(u.email),
    };
  });
}
