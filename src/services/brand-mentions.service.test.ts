import { describe, it, expect } from "vitest";
import { BrandMentionsService } from "@/services/brand-mentions.service";

describe("BrandMentionsService (Unlinked Mentions & AEO Listening Hub)", () => {
  it("fetches brand mentions and returns empty array gracefully when no mentions found", async () => {
    const mentions = await BrandMentionsService.getBrandMentions(
      "test-proj-888",
      "Test Brand",
      "https://test-nonexistent-brand-123456789.com",
    );

    expect(mentions).toBeDefined();
    expect(Array.isArray(mentions)).toBe(true);
  });

  it("calculates accurate listening metrics", async () => {
    const metrics = await BrandMentionsService.getListeningMetrics(
      "test-proj-888",
      "Test Brand",
      "testbrand.com",
    );

    expect(metrics).toBeDefined();
    expect(metrics.unlinkedMentionsCount).toBeGreaterThanOrEqual(0);
    expect(metrics.estimatedLinkValueUsd).toBeGreaterThanOrEqual(0);
    expect(metrics.averageAeoSentimentScore).toBeGreaterThanOrEqual(0);
    expect(metrics.averageAeoSentimentScore).toBeLessThanOrEqual(100);
  });

  it("generates an AEO sentiment report across multiple AI search models", async () => {
    const aeoReport = await BrandMentionsService.refreshAeoSentimentScan(
      "test-proj-888",
      "Skorvia",
      "skorvia.com",
    );

    expect(aeoReport).toBeDefined();
    expect(aeoReport.length).toBe(4);

    const engines = aeoReport.map((a) => a.aiEngine);
    expect(engines).toContain("perplexity");
    expect(engines).toContain("chatgpt");
    expect(engines).toContain("claude");
    expect(engines).toContain("google_aio");

    aeoReport.forEach((item) => {
      expect(item.sentimentScore).toBeGreaterThan(0);
      expect(item.keyStrengthsHighlighted.length).toBeGreaterThan(0);
      expect(["present", "missing", "ambiguous"]).toContain(
        item.entityCitationStatus,
      );
    });
  });
});

