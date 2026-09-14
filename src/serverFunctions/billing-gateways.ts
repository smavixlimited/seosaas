import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getActivePublicPlans,
  initializePaystackCheckout,
  getGatewayConfig,
} from "@/services/billing.service";
import { submitManualPaymentReceipt } from "@/services/admin.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getPublicPlansServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getActivePublicPlans();
  },
);

export const getPublicGatewaysServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { SystemSettingsService } = await import(
    "@/services/system-settings.service"
  );
  let sysPayments: any = null;
  try {
    sysPayments = await SystemSettingsService.getPaymentGatewaysApis();
  } catch {}

  const paystack = await getGatewayConfig("paystack");
  const flutterwave = await getGatewayConfig("flutterwave");
  const lemonsqueezy = await getGatewayConfig("lemonsqueezy");
  const manual = await getGatewayConfig("manual");

  const paystackSecret =
    sysPayments?.paystackSecretKey ||
    paystack?.secretKey ||
    process.env.PAYSTACK_SECRET_KEY;
  const paystackEnabled = Boolean(
    (sysPayments?.paystackEnabled ?? paystack?.isEnabled ?? true) &&
      paystackSecret &&
      paystackSecret.trim().length > 0,
  );

  const flutterwaveSecret =
    sysPayments?.flutterwaveSecretKey ||
    flutterwave?.secretKey ||
    process.env.FLUTTERWAVE_SECRET_KEY;
  const flutterwaveEnabled = Boolean(
    (sysPayments?.flutterwaveEnabled ?? flutterwave?.isEnabled ?? false) &&
      flutterwaveSecret &&
      flutterwaveSecret.trim().length > 0,
  );

  const lemonsqueezyKey =
    sysPayments?.lemonsqueezyApiKey ||
    lemonsqueezy?.secretKey ||
    process.env.LEMONSQUEEZY_API_KEY;
  const lemonsqueezyEnabled = Boolean(
    (sysPayments?.lemonsqueezyEnabled ?? lemonsqueezy?.isEnabled ?? false) &&
      lemonsqueezyKey &&
      lemonsqueezyKey.trim().length > 0,
  );

  const manualEnabled = Boolean(
    sysPayments?.manualPaymentEnabled ?? manual?.isEnabled ?? true,
  );

  let manualInstructions = manual?.manualInstructions;
  if (
    sysPayments?.manualPaymentBankName ||
    sysPayments?.manualPaymentAccountNumber
  ) {
    manualInstructions = `Bank: ${sysPayments.manualPaymentBankName || "Bank"}\nAccount Name: ${sysPayments.manualPaymentAccountName || "Skorvia Ltd"}\nAccount Number: ${sysPayments.manualPaymentAccountNumber || ""}\n${sysPayments.manualPaymentInstructions || ""}`;
  }

  return {
    paystackEnabled,
    paystackPublicKey:
      sysPayments?.paystackPublicKey || paystack?.publicKey || null,
    flutterwaveEnabled,
    lemonsqueezyEnabled,
    manualEnabled,
    manualInstructions:
      manualInstructions ||
      "Bank: Access Bank PLC\nAccount Name: Skorvia Ltd\nAccount Number: 0123456789",
  };
});

const paystackCheckoutSchema = z.object({
  planId: z.string(),
  amountNgn: z.number(),
  organizationId: z.string().optional(),
  couponCode: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export const initializePaystackCheckoutServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => paystackCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    return initializePaystackCheckout({
      email: context.userEmail,
      userId: context.userId,
      planId: data.planId,
      amountNgn: data.amountNgn,
      organizationId: data.organizationId || context.organizationId,
      couponCode: data.couponCode,
      callbackUrl: data.callbackUrl,
    });
  });

const flutterwaveCheckoutSchema = z.object({
  planId: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  organizationId: z.string().optional(),
  couponCode: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export const initializeFlutterwaveCheckoutServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => flutterwaveCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { initializeFlutterwaveCheckout } = await import("@/services/billing.service");
    return initializeFlutterwaveCheckout({
      email: context.userEmail,
      userId: context.userId,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
      organizationId: data.organizationId || context.organizationId,
      couponCode: data.couponCode,
      callbackUrl: data.callbackUrl,
    });
  });

const lemonsqueezyCheckoutSchema = z.object({
  planId: z.string(),
  organizationId: z.string().optional(),
  couponCode: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export const initializeLemonSqueezyCheckoutServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => lemonsqueezyCheckoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { initializeLemonSqueezyCheckout } = await import("@/services/billing.service");
    return initializeLemonSqueezyCheckout({
      email: context.userEmail,
      userId: context.userId,
      planId: data.planId,
      organizationId: data.organizationId || context.organizationId,
      couponCode: data.couponCode,
      callbackUrl: data.callbackUrl,
    });
  });

const manualPaymentSchema = z.object({
  planId: z.string(),
  amount: z.number(),
  currency: z.string(),
  transactionReference: z.string(),
  receiptUrl: z.string().optional().nullable(),
  userNotes: z.string().optional().nullable(),
});

export const submitManualPaymentServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => manualPaymentSchema.parse(d))
  .handler(async ({ data, context }) => {
    return submitManualPaymentReceipt({
      userId: context.userId,
      userEmail: context.userEmail,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
      transactionReference: data.transactionReference,
      receiptUrl: data.receiptUrl,
      userNotes: data.userNotes,
    });
  });
