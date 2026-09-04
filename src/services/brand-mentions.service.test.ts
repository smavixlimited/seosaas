import { describe, it, expect } from "vitest";
import { BrandMentionsService } from "@/services/brand-mentions.service";

describe("BrandMentionsService (Unlinked Mentions & AEO Listening Hub)", () => {
  it("seeds initial realistic brand mentions with domain authorities and sentiment", async () => {
    const mentions = await BrandMentionsService.seedInitialMentions(
      "test-proj-888",
      "Skorvia SaaS",
      "https://skorvia.com"
    );

    expect(mentions).toBeDefined();
    expect(mentions.length).toBeGreaterThanOrEqual(5);

    const unlinked = mentions.filter((m) => m.mentionType === "unlinked");
    expect(unlinked.length).toBeGreaterThan(0);

    mentions.forEach((m) => {
      expect(m.id).toBeDefined();
      expect(m.sourceDomain).toBeDefined();
      expect(m.sourceUrl).toBeDefined();
      expect(m.domainAuthority).toBeGreaterThan(0);
      expect(["positive", "neutral", "critical"]).toContain(m.sentiment);
    });
  });

  it("calculates accurate listening metrics and backlink recovery value", async () => {
    const metrics = await BrandMentionsService.getListeningMetrics(
      "test-proj-888",
      "Skorvia SaaS",
      "skorvia.com"
    );

    expect(metrics).toBeDefined();
    expect(metrics.unlinkedMentionsCount).toBeGreaterThan(0);
    expect(metrics.estimatedLinkValueUsd).toBeGreaterThan(0);
    expect(metrics.averageAeoSentimentScore).toBeGreaterThanOrEqual(0);
    expect(metrics.averageAeoSentimentScore).toBeLessThanOrEqual(100);
  });

  it("generates an AEO sentiment report across multiple AI search models", async () => {
    const aeoReport = await BrandMentionsService.refreshAeoSentimentScan(
      "test-proj-888",
      "Skorvia",
      "skorvia.com"
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
      expect(["present", "missing", "ambiguous"]).toContain(item.entityCitationStatus);
    });
  });
});
