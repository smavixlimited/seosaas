import { createFileRoute } from "@tanstack/react-router";
import {
  activateUserSubscription,
  getGatewayConfig,
  getSystemPaymentSettings,
} from "@/services/billing.service";
import { WebhookIdempotencyService } from "@/services/webhook-idempotency.service";

async function handleWebhook(
  request: Request,
  gateway: string,
): Promise<Response> {
  try {
    const rawBody = await request.text();
    let event: Record<string, unknown> = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const sysPayments = await getSystemPaymentSettings();

    // 1. PAYSTACK WEBHOOK
    if (gateway === "paystack") {
      const gw = await getGatewayConfig("paystack");
      const secretKey =
        gw?.secretKey ||
        (sysPayments?.paystackSecretKey as string | undefined) ||
        process.env.PAYSTACK_SECRET_KEY;
      const signature = request.headers.get("x-paystack-signature");

      if (secretKey && signature) {
        const isValid = await WebhookIdempotencyService.verifyPaystackSignature(
          rawBody,
          signature,
          secretKey,
        );
        if (!isValid) {
          return new Response("Invalid Paystack webhook signature", {
            status: 401,
          });
        }
      }

      const eventType = event.event as string | undefined;
      if (eventType === "charge.success") {
        const data = event.data as Record<string, unknown> | undefined;
        const reference = (data?.reference as string | undefined) || `paystack_${Date.now()}`;
        const metadata = data?.metadata as Record<string, unknown> | undefined;
        const userId = metadata?.userId as string | undefined;
        const organizationId = metadata?.organizationId as string | undefined;
        const planId = (metadata?.planId as string | undefined) || "pro";

        const claimed = await WebhookIdempotencyService.claimWebhookEvent({
          gateway: "paystack",
          eventId: reference,
          eventType: "charge.success",
          payload: event,
        });

        if (claimed && userId) {
          await activateUserSubscription({
            userId,
            planId,
            organizationId: organizationId || undefined,
          });
        }
      }
    }

    // 2. FLUTTERWAVE WEBHOOK
    else if (gateway === "flutterwave") {
      const gw = await getGatewayConfig("flutterwave");
      const secretHash =
        gw?.secretKey ||
        (sysPayments?.flutterwaveSecretKey as string | undefined) ||
        process.env.FLUTTERWAVE_SECRET_HASH ||
        process.env.FLUTTERWAVE_SECRET_KEY;
      const signature = request.headers.get("verif-hash");

      if (secretHash && signature) {
        const isValid = WebhookIdempotencyService.verifyFlutterwaveSignature(
          signature,
          secretHash,
        );
        if (!isValid) {
          return new Response("Invalid Flutterwave webhook secret hash", {
            status: 401,
          });
        }
      }

      const eventType = (event["event.type"] || event.event) as string | undefined;
      const data = (event.data || event) as Record<string, unknown> | undefined;
      const status = data?.status as string | undefined;

      if (
        (eventType === "CARD_TRANSACTION" ||
          eventType === "charge.completed" ||
          eventType === "successful") &&
        (status === "successful" || status === "success")
      ) {
        const txRef = (data?.tx_ref as string | undefined) || (data?.txRef as string | undefined) || `flw_${Date.now()}`;
        const meta = data?.meta as Record<string, unknown> | undefined;
        const userId = meta?.userId as string | undefined;
        const organizationId = meta?.organizationId as string | undefined;
        const planId = (meta?.planId as string | undefined) || "pro";

        const claimed = await WebhookIdempotencyService.claimWebhookEvent({
          gateway: "flutterwave",
          eventId: txRef,
          eventType: "charge.completed",
          payload: event,
        });

        if (claimed && userId) {
          await activateUserSubscription({
            userId,
            planId,
            organizationId: organizationId || undefined,
          });
        }
      }
    }

    // 3. LEMONSQUEEZY WEBHOOK
    else if (gateway === "lemonsqueezy") {
      const gw = await getGatewayConfig("lemonsqueezy");
      const secretKey =
        gw?.secretKey ||
        (sysPayments?.lemonsqueezyWebhookSecret as string | undefined) ||
        process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      const signature = request.headers.get("x-signature");

      if (secretKey && signature) {
        const isValid = await WebhookIdempotencyService.verifyLemonSqueezySignature(
          rawBody,
          signature,
          secretKey,
        );
        if (!isValid) {
          return new Response("Invalid LemonSqueezy webhook signature", {
            status: 401,
          });
        }
      }

      const eventName = event.meta
        ? (event.meta as Record<string, unknown>).event_name
        : event.event;

      if (
        eventName === "subscription_created" ||
        eventName === "order_created"
      ) {
        const data = event.data as Record<string, unknown> | undefined;
        const orderId = (data?.id as string | undefined) || `ls_${Date.now()}`;
        const attributes = data?.attributes as Record<string, unknown> | undefined;
        const customData = (attributes?.custom_data || (event.meta as Record<string, unknown>)?.custom_data) as
          | Record<string, unknown>
          | undefined;
        const userId = (customData?.user_id || customData?.userId) as string | undefined;
        const organizationId = (customData?.organization_id || customData?.organizationId) as string | undefined;
        const planId = ((customData?.plan_id || customData?.planId) as string | undefined) || "pro";

        const claimed = await WebhookIdempotencyService.claimWebhookEvent({
          gateway: "lemonsqueezy",
          eventId: String(orderId),
          eventType: String(eventName),
          payload: event,
        });

        if (claimed && userId) {
          await activateUserSubscription({
            userId,
            planId,
            organizationId: organizationId || undefined,
          });
        }
      }
    }

    return Response.json({ status: "success", received: true, gateway });
  } catch (err) {
    return Response.json(
      { status: "error", message: (err as Error).message },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/billing/webhook/$gateway")({
  server: {
    handlers: {
      POST: ({ request, params }) => handleWebhook(request, params.gateway),
    },
  },
});
