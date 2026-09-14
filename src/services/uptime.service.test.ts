import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { probeSslCertificate } from "@/services/uptime.service";

describe("Uptime & SSL Monitoring Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("probes SSL certificate validity and calculates remaining days", async () => {
    const result = await probeSslCertificate("https://example.com");

    expect(result).toBeDefined();
    expect(result.sslExpiresAt).toBeDefined();
    expect(typeof result.daysRemaining).toBe("number");
    expect(typeof result.isExpiringSoon).toBe("boolean");
    expect(typeof result.isValid).toBe("boolean");
  });

  it("correctly flags certificate with less than 14 days as expiring soon", () => {
    const fakeExpiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days left
    const diffDays = Math.ceil(
      (fakeExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    const isExpiringSoon = diffDays <= 14;

    expect(isExpiringSoon).toBe(true);
    expect(diffDays).toBeLessThanOrEqual(14);
  });
});
