import { createFileRoute } from "@tanstack/react-router";
import {
  activateUserSubscription,
  getGatewayConfig,
  verifyWebhookHmacSignature,
} from "@/services/billing.service";

async function handleWebhook(request: Request, gateway: string): Promise<Response> {
  try {
    const rawBody = await request.text();
    let event: Record<string, unknown> = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    if (gateway === "paystack") {
      const gw = await getGatewayConfig("paystack");
      const secretKey = gw?.secretKey || process.env.PAYSTACK_SECRET_KEY;
      const signature = request.headers.get("x-paystack-signature");

      if (secretKey && signature) {
        const isValid = await verifyWebhookHmacSignature(rawBody, signature, secretKey, "SHA-512");
        if (!isValid) {
          return new Response("Invalid webhook signature", { status: 401 });
        }
      }

      const eventType = event.event as string | undefined;
      if (eventType === "charge.success") {
        const data = event.data as Record<string, unknown> | undefined;
        const metadata = data?.metadata as Record<string, unknown> | undefined;
        const userId = metadata?.userId as string | undefined;
        const planId = (metadata?.planId as string | undefined) || "pro";

        if (userId) {
          await activateUserSubscription({
            userId,
            planId,
          });
        }
      }
    } else if (gateway === "lemonsqueezy") {
      const gw = await getGatewayConfig("lemonsqueezy");
      const secretKey = gw?.secretKey || process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
      const signature = request.headers.get("x-signature");

      if (secretKey && signature) {
        const isValid = await verifyWebhookHmacSignature(rawBody, signature, secretKey, "SHA-256");
        if (!isValid) {
          return new Response("Invalid webhook signature", { status: 401 });
        }
      }

      const eventName = event.meta ? (event.meta as Record<string, unknown>).event_name : event.event;
      if (eventName === "subscription_created" || eventName === "order_created") {
        const data = event.data as Record<string, unknown> | undefined;
        const attributes = data?.attributes as Record<string, unknown> | undefined;
        const customData = attributes?.custom_data as Record<string, unknown> | undefined;
        const userId = customData?.user_id as string | undefined;
        const planId = (customData?.plan_id as string | undefined) || "pro";

        if (userId) {
          await activateUserSubscription({
            userId,
            planId,
          });
        }
      }
    }

    return Response.json({ status: "success", received: true });
  } catch (err) {
    return Response.json(
      { status: "error", message: (err as Error).message },
      { status: 500 }
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
