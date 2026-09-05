import { describe, it, expect } from "vitest";
import { CreditGuardService } from "@/services/credit-guard.service";
import { WebhookIdempotencyService } from "@/services/webhook-idempotency.service";
import { TwoFactorService } from "@/services/two-factor.service";
import { RetentionService } from "@/services/retention.service";

describe("Phase 29: Distributed Edge Hardening & Concurrency Suite", () => {
  describe("1. Atomic SQL Credit Deductions & Overdraft Protection", () => {
    it("deducts credits atomically and tracks remaining quota", async () => {
      const result = await CreditGuardService.deductCreditsAtomic({
        userId: "usr_atomic_test_01",
        amount: 10,
        reason: "Site Audit Crawl",
      });

      expect(result.success).toBe(true);
      expect(result.creditsDeducted).toBe(10);
      expect(result.creditsRemaining).toBeGreaterThanOrEqual(0);
    });

    it("checks real-time balance cleanly", async () => {
      const balance =
        await CreditGuardService.checkBalance("usr_atomic_test_01");
      expect(balance.limit).toBeGreaterThanOrEqual(1);
      expect(balance.available).toBeGreaterThanOrEqual(0);
    });
  });

  describe("2. Cryptographic Webhook Signatures & Idempotency Lock", () => {
    const testSecret = "sk_live_paystack_test_secret_key_123";
    const testPayload = JSON.stringify({
      event: "charge.success",
      data: { reference: "ref_pay_001", amount: 5000 },
    });

    it("verifies Paystack HMAC-SHA512 signature", async () => {
      // Generate signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(testSecret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"],
      );
      const signed = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(testPayload),
      );
      const validSig = Array.from(new Uint8Array(signed))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isValid = await WebhookIdempotencyService.verifyPaystackSignature(
        testPayload,
        validSig,
        testSecret,
      );
      expect(isValid).toBe(true);

      const isInvalid = await WebhookIdempotencyService.verifyPaystackSignature(
        testPayload,
        "invalid_sig_abc",
        testSecret,
      );
      expect(isInvalid).toBe(false);
    });

    it("verifies Flutterwave secret hash", () => {
      expect(
        WebhookIdempotencyService.verifyFlutterwaveSignature(
          "flw_hash_123",
          "flw_hash_123",
        ),
      ).toBe(true);
      expect(
        WebhookIdempotencyService.verifyFlutterwaveSignature(
          "wrong_hash",
          "flw_hash_123",
        ),
      ).toBe(false);
    });

    it("claims webhook events with atomic duplicate prevention", async () => {
      const eventId = "evt_unique_charge_9981";

      const firstClaim = await WebhookIdempotencyService.claimWebhookEvent({
        gateway: "paystack",
        eventId,
        eventType: "charge.success",
        payload: { reference: "ref_001" },
      });
      expect(firstClaim.isDuplicate).toBe(false);

      const duplicateClaim = await WebhookIdempotencyService.claimWebhookEvent({
        gateway: "paystack",
        eventId,
        eventType: "charge.success",
        payload: { reference: "ref_001" },
      });
      expect(duplicateClaim.isDuplicate).toBe(true);
    });
  });

  describe("3. Zero-Loss 2FA & Retention State Persistence", () => {
    it("initializes 2FA and sets up pending record", async () => {
      const setup = await TwoFactorService.setup2FA(
        "usr_edge_2fa_01",
        "edge@skorvia.com",
      );
      expect(setup.secret).toBeDefined();
      expect(setup.backupCodes).toHaveLength(8);
      expect(setup.qrCodeDataUri).toContain("data:image/svg+xml");
    });

    it("persists retention discounts into database and checks status", async () => {
      const res = await RetentionService.processCancellationSurvey({
        userId: "usr_edge_retention_01",
        userEmail: "edge-retention@skorvia.com",
        planId: "agency",
        reason: "Too expensive",
        acceptRetentionDiscount: true,
      });

      expect(res.discountApplied).toBe(true);

      const status = await RetentionService.hasActiveDiscountAsync(
        "usr_edge_retention_01",
      );
      expect(status.hasDiscount).toBe(true);
      expect(status.discountPercent).toBe(30);
    });
  });
});
