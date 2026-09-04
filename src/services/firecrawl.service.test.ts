import { describe, it, expect } from "vitest";
import { FirecrawlService } from "@/services/firecrawl.service";

describe("FirecrawlService", () => {
  it("should scrape a URL and calculate word count and token savings", async () => {
    const result = await FirecrawlService.scrapeUrl("https://example.com/pricing");
    expect(result.success).toBe(true);
    expect(result.url).toBe("https://example.com/pricing");
    expect(result.markdown).toContain("Pricing");
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.tokensSaved).toBeGreaterThan(0);
    expect(result.statusCode).toBe(200);
  });

  it("should return an error when scraping an empty URL", async () => {
    const result = await FirecrawlService.scrapeUrl("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("URL is required");
    expect(result.statusCode).toBe(400);
  });

  it("should discover sitemap links for a target domain", async () => {
    const result = await FirecrawlService.mapDomain("stripe.com");
    expect(result.success).toBe(true);
    expect(result.domain).toBe("stripe.com");
    expect(result.links.length).toBeGreaterThan(0);
    expect(result.totalLinks).toBe(result.links.length);
  });

  it("should perform live web search and return structured markdown results", async () => {
    const result = await FirecrawlService.searchAndScrape("best b2b seo software 2026");
    expect(result.success).toBe(true);
    expect(result.query).toBe("best b2b seo software 2026");
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toBeDefined();
    expect(result.results[0].markdown).toBeDefined();
  });

  it("should generate a complete competitor content blueprint", async () => {
    const blueprint = await FirecrawlService.generateCompetitorBlueprint({
      targetKeyword: "saas billing platform",
      competitorUrls: ["https://stripe.com", "https://paddle.com"],
      userUrl: "https://mysaas.com",
    });

    expect(blueprint.targetKeyword).toBe("saas billing platform");
    expect(blueprint.competitors.length).toBe(2);
    expect(blueprint.wordCountGap.averageCompetitor).toBeGreaterThan(0);
    expect(blueprint.wordCountGap.recommendedMin).toBeGreaterThan(blueprint.wordCountGap.averageCompetitor);
    expect(blueprint.missingSubtopics.length).toBeGreaterThan(0);
    expect(blueprint.missingSchemas).toContain("FAQPage");
    expect(blueprint.aiContentBrief.recommendedTitle).toContain("saas billing platform");
    expect(blueprint.aiContentBrief.suggestedOutline.length).toBeGreaterThan(0);
  });

  it("should generate a standardized llms.txt and llms-full.txt file for AI crawlers", async () => {
    const result = await FirecrawlService.generateLlmsTxt("mysite.com");
    expect(result.domain).toBe("mysite.com");
    expect(result.llmsTxt).toContain("# mysite.com");
    expect(result.llmsTxt).toContain("## Overview");
    expect(result.llmsTxt).toContain("## Key Sections & Documentation");
    expect(result.llmsFullTxt).toContain("Detailed Product Specifications");
  });

  it("should fail connection test when no API key is provided", async () => {
    const result = await FirecrawlService.testConnection("");
    expect(result.success).toBe(false);
    expect(result.message).toContain("No Firecrawl API key provided");
  });
});
