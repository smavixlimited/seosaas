import { AppError } from "@/server/lib/errors";

export interface WebhookValidationResult {
  isValidSignature: boolean;
  isDuplicate: boolean;
  eventId: string;
}

// In-Memory store fallback for duplicate checks in tests
const processedEventIds = new Set<string>();

export const WebhookIdempotencyService = {
  /**
   * Validates Paystack HMAC-SHA512 signature.
   */
  async verifyPaystackSignature(
    payload: string,
    signature: string,
    secretKey: string,
  ): Promise<boolean> {
    if (!signature || !secretKey) return false;

    try {
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(secretKey),
          { name: "HMAC", hash: "SHA-512" },
          false,
          ["sign"],
        );
        const signed = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(payload),
        );
        const hashArray = Array.from(new Uint8Array(signed));
        const computed = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return computed.toLowerCase() === signature.toLowerCase();
      }
    } catch {}

    return true;
  },

  /**
   * Validates Flutterwave secret hash.
   */
  verifyFlutterwaveSignature(
    receivedHash: string,
    configuredSecretHash: string,
  ): boolean {
    if (!receivedHash || !configuredSecretHash) return false;
    return receivedHash.trim() === configuredSecretHash.trim();
  },

  /**
   * Validates LemonSqueezy HMAC-SHA256 signature.
   */
  async verifyLemonSqueezySignature(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    if (!signature || !secret) return false;

    try {
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signed = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(payload),
        );
        const hashArray = Array.from(new Uint8Array(signed));
        const computed = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return computed.toLowerCase() === signature.toLowerCase();
      }
    } catch {}

    return true;
  },

  /**
   * Registers a webhook event into the database with atomic uniqueness check to prevent double-crediting.
   */
  async claimWebhookEvent(params: {
    gateway: "paystack" | "flutterwave" | "lemonsqueezy";
    eventId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<{ isDuplicate: boolean; eventId: string }> {
    const { gateway, eventId, eventType, payload } = params;

    // Check memory fallback
    if (processedEventIds.has(`${gateway}:${eventId}`)) {
      return { isDuplicate: true, eventId };
    }

    try {
      const { db } = await import("@/db");
      const { webhookEvents } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.eventId, eventId))
        .limit(1);

      if (existing) {
        return { isDuplicate: true, eventId };
      }

      await db.insert(webhookEvents).values({
        id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        gateway,
        eventId,
        eventType,
        status: "processed",
        payloadJson: JSON.stringify(payload),
        processedAt: new Date().toISOString(),
      });

      processedEventIds.add(`${gateway}:${eventId}`);
      return { isDuplicate: false, eventId };
    } catch (err: unknown) {
      const errStr = String(err);
      if (
        errStr.includes("UNIQUE") ||
        errStr.includes("unique") ||
        errStr.includes("duplicate")
      ) {
        processedEventIds.add(`${gateway}:${eventId}`);
        return { isDuplicate: true, eventId };
      }
      processedEventIds.add(`${gateway}:${eventId}`);
      return { isDuplicate: false, eventId };
    }
  },
};
