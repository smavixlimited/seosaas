import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { AiContentEngineService } from "@/services/ai-content-engine.service";
import { ContentPublishingService } from "@/services/content-publishing.service";

describe("AiContentEngineService", () => {
  it("discovers high-intent content topics with outlines and metrics", async () => {
    const topics =
      await AiContentEngineService.discoverContentTopics("test-proj-123");

    expect(topics).toBeDefined();
    expect(topics.length).toBeGreaterThanOrEqual(3);
    topics.forEach((topic) => {
      expect(topic.id).toBeDefined();
      expect(topic.targetKeyword).toBeDefined();
      expect(topic.suggestedTitle).toBeDefined();
      expect(topic.intent).toBeDefined();
      expect(topic.estimatedSearchVolume).toBeGreaterThan(0);
      expect(topic.suggestedOutline.length).toBeGreaterThan(0);
    });
  });

  it("generates a comprehensive long-form article with JSON-LD schema", async () => {
    const article = await AiContentEngineService.generateArticle(
      "test-proj-123",
      {
        targetKeyword: "b2b saas onboarding",
        customTitle: "How to Build High-Converting B2B SaaS Onboarding in 2026",
      },
    );

    expect(article).toBeDefined();
    expect(article.title).toContain("B2B SaaS Onboarding");
    expect(article.slug).toBeDefined();
    expect(article.targetKeyword).toBe("b2b saas onboarding");
    expect(article.contentMarkdown).toContain("# ");
    expect(article.wordCount).toBeGreaterThan(100);
    expect(article.seoScore).toBeGreaterThanOrEqual(90);
    expect(article.schemaJson).toBeDefined();
    expect(article.schemaJson["@type"]).toBe("Article");
  });
});

describe("ContentPublishingService", () => {
  it("validates missing API credentials cleanly on test connection", async () => {
    const result = await ContentPublishingService.testConnection(
      "test-proj-123",
      "wordpress",
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.message).toContain("No API URL configured");
  });
});
