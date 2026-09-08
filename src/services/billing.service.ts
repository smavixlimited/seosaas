import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  saasPlans,
  gatewaySettings,
  userQuotas,
  billingCustomerStatus,
  user,
  member,
  systemSettings,
} from "@/db/schema";
import { BRAND_CONFIG } from "@/config/brand";
import { AppError } from "@/server/lib/errors";

export async function getActivePublicPlans() {
  const plans = await db
    .select()
    .from(saasPlans)
    .where(eq(saasPlans.isActive, true));

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
        monthlyCredits:
          t.id === "starter" ? 500 : t.id === "pro" ? 2500 : 10000,
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

export async function getSystemPaymentSettings(): Promise<Record<string, unknown> | null> {
  try {
    const [row] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "api_payments"))
      .limit(1);

    if (row?.valueJson) {
      return JSON.parse(row.valueJson) as Record<string, unknown>;
    }
  } catch {
    // Ignore db error
  }
  return null;
}

export async function initializePaystackCheckout(params: {
  email: string;
  amountNgn: number;
  planId: string;
  userId: string;
  organizationId?: string;
  couponCode?: string;
  callbackUrl?: string;
}) {
  const gw = await getGatewayConfig("paystack");
  const sysPayments = await getSystemPaymentSettings();
  const secretKey =
    gw?.secretKey ||
    (sysPayments?.paystackSecretKey as string | undefined) ||
    process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Paystack payment gateway is not configured. Please contact administrator.",
    );
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amountNgn * 100), // Paystack expects amount in Kobo
        callback_url: params.callbackUrl || "https://skorvia.com/billing?status=success",
        metadata: {
          userId: params.userId,
          planId: params.planId,
          organizationId: params.organizationId || "",
          couponCode: params.couponCode || "",
        },
      }),
    },
  );

  const data = (await response.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };

  if (!data.status || !data.data) {
    throw new AppError(
      "UPSTREAM_UNAVAILABLE",
      data.message || "Paystack transaction initialization failed",
    );
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function initializeFlutterwaveCheckout(params: {
  email: string;
  amount: number;
  currency?: string;
  planId: string;
  userId: string;
  organizationId?: string;
  couponCode?: string;
  callbackUrl?: string;
}) {
  const gw = await getGatewayConfig("flutterwave");
  const sysPayments = await getSystemPaymentSettings();
  const secretKey =
    gw?.secretKey ||
    (sysPayments?.flutterwaveSecretKey as string | undefined) ||
    process.env.FLUTTERWAVE_SECRET_KEY;

  if (!secretKey) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Flutterwave payment gateway is not configured. Please contact administrator.",
    );
  }

  const txRef = `skorvia_flw_${Date.now()}_${params.userId.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`;
  const currency = params.currency?.toUpperCase() || "USD";

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: params.amount,
      currency,
      redirect_url: params.callbackUrl || "https://skorvia.com/billing?status=success",
      meta: {
        userId: params.userId,
        planId: params.planId,
        organizationId: params.organizationId || "",
        couponCode: params.couponCode || "",
      },
      customer: {
        email: params.email,
      },
      customizations: {
        title: `Skorvia ${params.planId.toUpperCase()} Plan`,
        description: `Monthly subscription for ${params.planId.toUpperCase()} tier`,
      },
    }),
  });

  const data = (await response.json()) as {
    status: string;
    message?: string;
    data?: { link: string };
  };

  if (data.status !== "success" || !data.data?.link) {
    throw new AppError(
      "UPSTREAM_UNAVAILABLE",
      data.message || "Flutterwave checkout initialization failed",
    );
  }

  return {
    authorizationUrl: data.data.link,
    reference: txRef,
  };
}

export async function initializeLemonSqueezyCheckout(params: {
  email: string;
  planId: string;
  userId: string;
  organizationId?: string;
  couponCode?: string;
  callbackUrl?: string;
}) {
  const gw = await getGatewayConfig("lemonsqueezy");
  const sysPayments = await getSystemPaymentSettings();
  const apiKey =
    gw?.secretKey ||
    (sysPayments?.lemonsqueezyApiKey as string | undefined) ||
    process.env.LEMONSQUEEZY_API_KEY;
  const storeId =
    gw?.publicKey ||
    (sysPayments?.lemonsqueezyStoreId as string | undefined) ||
    process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    throw new AppError(
      "VALIDATION_ERROR",
      "LemonSqueezy payment gateway is not configured. Please contact administrator.",
    );
  }

  const variantMap: Record<string, string> = {
    starter: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || "1",
    pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "2",
    agency: process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID || "3",
  };
  const variantId = variantMap[params.planId] || variantMap.pro;

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: params.email,
            custom: {
              user_id: params.userId,
              plan_id: params.planId,
              organization_id: params.organizationId || "",
              coupon_code: params.couponCode || "",
            },
          },
          product_options: {
            redirect_url: params.callbackUrl || "https://skorvia.com/billing?status=success",
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(storeId),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(variantId),
            },
          },
        },
      },
    }),
  });

  const data = (await response.json()) as {
    data?: {
      attributes?: {
        url?: string;
      };
    };
    errors?: Array<{ detail: string }>;
  };

  const checkoutUrl = data.data?.attributes?.url;
  if (!checkoutUrl) {
    const errorDetail = data.errors?.[0]?.detail || "LemonSqueezy checkout session creation failed";
    throw new AppError("UPSTREAM_UNAVAILABLE", errorDetail);
  }

  return {
    authorizationUrl: checkoutUrl,
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

  const credits =
    params.planId === "agency" ? 10000 : params.planId === "pro" ? 2500 : 500;
  const now = new Date().toISOString();
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Update userQuotas
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

  // 2. Resolve organizationId (auto-discover primary org if omitted)
  let targetOrgId = params.organizationId;
  if (!targetOrgId) {
    const [mem] = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, params.userId))
      .limit(1);

    targetOrgId = mem?.organizationId;
  }

  // 3. Update billingCustomerStatus for organization if targetOrgId exists
  if (targetOrgId) {
    await db
      .insert(billingCustomerStatus)
      .values({
        organizationId: targetOrgId,
        isPaying: true,
        paidPlanId: params.planId,
        paidPlanStatus: "active",
        customerJson: JSON.stringify({
          plan: params.planId,
          active: true,
          activatedAt: now,
          userId: params.userId,
        }),
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
          customerJson: JSON.stringify({
            plan: params.planId,
            active: true,
            updatedAt: now,
            userId: params.userId,
          }),
          updatedAt: now,
        },
      });
  }

  return { success: true, organizationId: targetOrgId };
}

export async function verifyWebhookHmacSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string,
  algorithm: "SHA-512" | "SHA-256" = "SHA-512",
): Promise<boolean> {
  if (!signatureHeader || !secretKey) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: { name: algorithm } },
    false,
    ["sign"],
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expectedSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig.toLowerCase() === signatureHeader.trim().toLowerCase();
}
