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
  }
);

export const getPublicGatewaysServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const paystack = await getGatewayConfig("paystack");
    const flutterwave = await getGatewayConfig("flutterwave");
    const lemonsqueezy = await getGatewayConfig("lemonsqueezy");
    const manual = await getGatewayConfig("manual");

    return {
      paystackEnabled: paystack?.isEnabled ?? true,
      paystackPublicKey: paystack?.publicKey ?? null,
      flutterwaveEnabled: flutterwave?.isEnabled ?? false,
      lemonsqueezyEnabled: lemonsqueezy?.isEnabled ?? false,
      manualEnabled: manual?.isEnabled ?? true,
      manualInstructions:
        manual?.manualInstructions ??
        "Bank: Access Bank PLC\nAccount Name: Skorvia Ltd\nAccount Number: 0123456789",
    };
  }
);

const checkoutSchema = z.object({
  planId: z.string(),
  amountNgn: z.number(),
  callbackUrl: z.string().optional(),
});

export const initializePaystackCheckoutServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => checkoutSchema.parse(d))
  .handler(async ({ data, context }) => {
    return initializePaystackCheckout({
      email: context.userEmail,
      userId: context.userId,
      planId: data.planId,
      amountNgn: data.amountNgn,
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
