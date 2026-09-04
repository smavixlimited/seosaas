import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { generateQueryHash } from "@/services/caching-guardrails.service";
import { verifyWebhookHmacSignature } from "@/services/billing.service";
import { BRAND_CONFIG } from "@/config/brand";

describe("Skorvia SaaS End-to-End Verification Suite", () => {
  describe("Brand Configuration & Pricing Consistency", () => {
    it("verifies Skorvia brand identity", () => {
      expect(BRAND_CONFIG.name).toBe("Skorvia");
      expect(BRAND_CONFIG.colors.primary).toBe("#17199b");
      expect(BRAND_CONFIG.domain).toBe("skorvia.com");
      expect(BRAND_CONFIG.pricing.tiers.length).toBe(3);
    });

    it("verifies dual-currency pricing rules across all tiers", () => {
      for (const tier of BRAND_CONFIG.pricing.tiers) {
        expect(tier.priceMonthlyUSD).toBeGreaterThan(0);
        expect(tier.priceMonthlyNGN).toBeGreaterThan(0);
        expect(tier.priceAnnualUSD).toBeLessThan(tier.priceMonthlyUSD);
        expect(tier.priceAnnualNGN).toBeLessThan(tier.priceMonthlyNGN);
      }
    });
  });

  describe("Query Caching & Deterministic Hasher", () => {
    it("hashes normalized query parameters deterministically", async () => {
      const hash1 = await generateQueryHash("keywords.suggestions", { keyword: "seo tools", limit: 50 });
      const hash2 = await generateQueryHash("keywords.suggestions", { keyword: "seo tools", limit: 50 });
      const hash3 = await generateQueryHash("keywords.suggestions", { keyword: "seo audit", limit: 50 });

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("HMAC Webhook Signature Verification", () => {
    it("validates authentic Paystack HMAC-SHA512 signatures", async () => {
      const secret = "sk_live_test_secret_12345";
      const payload = JSON.stringify({ event: "charge.success", data: { id: 999 } });

      // Generate valid signature using Web Crypto
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: { name: "SHA-512" } },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
      const validSignature = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isValid = await verifyWebhookHmacSignature(payload, validSignature, secret, "SHA-512");
      expect(isValid).toBe(true);

      const isInvalid = await verifyWebhookHmacSignature(payload, "invalid_sig", secret, "SHA-512");
      expect(isInvalid).toBe(false);
    });

    it("validates authentic LemonSqueezy HMAC-SHA256 signatures", async () => {
      const secret = "ls_webhook_secret_key";
      const payload = JSON.stringify({ meta: { event_name: "order_created" } });

      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
      const validSignature = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isValid = await verifyWebhookHmacSignature(payload, validSignature, secret, "SHA-256");
      expect(isValid).toBe(true);
    });
  });
});
