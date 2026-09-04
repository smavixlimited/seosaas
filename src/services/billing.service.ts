import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  saasPlans,
  gatewaySettings,
  userQuotas,
  billingCustomerStatus,
  user,
} from "@/db/schema";
import { BRAND_CONFIG } from "@/config/brand";

export async function getActivePublicPlans() {
  const plans = await db.select().from(saasPlans).where(eq(saasPlans.isActive, true));

  if (plans.length === 0) {
    return BRAND_CONFIG.pricing.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      priceUsd: t.priceMonthlyUSD,
      priceNgn: t.priceMonthlyNGN,
      billingInterval: "month",
      isActive: true,
      limits: {
        maxDomains: t.id === "starter" ? 5 : t.id === "pro" ? 20 : 9999,
        monthlyCredits: t.id === "starter" ? 500 : t.id === "pro" ? 2500 : 10000,
        auditPages: t.id === "starter" ? 5000 : t.id === "pro" ? 50000 : 250000,
        uptimeMonitors: t.id === "starter" ? 0 : t.id === "pro" ? 5 : 50,
      },
      features: {
        whiteLabelPdf: t.id === "agency",
        mcpAccess: t.id !== "starter",
        indexnowSubmit: t.id === "agency",
        aeoAudit: t.id !== "starter",
      },
    }));
  }

  return plans.map((p) => {
    let limits = {};
    let features = {};
    try {
      limits = JSON.parse(p.limitsJson);
    } catch {
      // Ignore
    }
    try {
      features = JSON.parse(p.featuresJson);
    } catch {
      // Ignore
    }
    return {
      id: p.id,
      name: p.name,
      priceUsd: p.priceUsd,
      priceNgn: p.priceNgn,
      billingInterval: p.billingInterval,
      isActive: p.isActive,
      limits,
      features,
    };
  });
}

export async function getGatewayConfig(gatewayId: string) {
  const [gw] = await db
    .select()
    .from(gatewaySettings)
    .where(eq(gatewaySettings.gatewayId, gatewayId))
    .limit(1);

  return gw;
}

export async function initializePaystackCheckout(params: {
  email: string;
  amountNgn: number;
  planId: string;
  userId: string;
  callbackUrl?: string;
}) {
  const gw = await getGatewayConfig("paystack");
  const secretKey = gw?.secretKey || process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    // If not configured, return a simulated client flow
    return {
      authorizationUrl: `/billing?status=success&simulated=true&plan=${params.planId}`,
      accessCode: `sim_${Date.now()}`,
      reference: `ref_${Date.now()}`,
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountNgn * 100, // Paystack expects amount in Kobo
      callback_url: params.callbackUrl || "https://skorvia.com/billing",
      metadata: {
        userId: params.userId,
        planId: params.planId,
      },
    }),
  });

  const data = (await response.json()) as {
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  };

  if (!data.status) {
    throw new Error("Paystack transaction initialization failed");
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function activateUserSubscription(params: {
  userId: string;
  planId: string;
  organizationId?: string;
}) {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, params.userId))
    .limit(1);

  if (!existingUser) {
    return { success: false, reason: "User not found" };
  }

  const credits = params.planId === "agency" ? 10000 : params.planId === "pro" ? 2500 : 500;
  const now = new Date().toISOString();
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db
    .insert(userQuotas)
    .values({
      userId: params.userId,
      planId: params.planId,
      monthlyCreditsLimit: credits,
      creditsUsed: 0,
      crawlPagesUsed: 0,
      uptimeMonitorsCount: 0,
      resetAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userQuotas.userId,
      set: {
        planId: params.planId,
        monthlyCreditsLimit: credits,
        resetAt,
        updatedAt: now,
      },
    });

  if (params.organizationId) {
    await db
      .insert(billingCustomerStatus)
      .values({
        organizationId: params.organizationId,
        isPaying: true,
        paidPlanId: params.planId,
        paidPlanStatus: "active",
        customerJson: JSON.stringify({ plan: params.planId, active: true }),
        syncedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: billingCustomerStatus.organizationId,
        set: {
          isPaying: true,
          paidPlanId: params.planId,
          paidPlanStatus: "active",
          updatedAt: now,
        },
      });
  }

  return { success: true };
}

export async function verifyWebhookHmacSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string,
  algorithm: "SHA-512" | "SHA-256" = "SHA-512"
): Promise<boolean> {
  if (!signatureHeader || !secretKey) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: { name: algorithm } },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expectedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig.toLowerCase() === signatureHeader.trim().toLowerCase();
}
