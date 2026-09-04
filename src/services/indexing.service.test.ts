import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexingService } from "@/services/indexing.service";

describe("Instant Indexing Service (IndexNow API & Sitemap Parser)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits a valid batch of URLs to IndexNow protocol", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const res = await IndexingService.submitIndexNow({
      host: "example.com",
      urlList: [
        "https://example.com/blog/seo-guide",
        "https://example.com/product/feature-1",
        "https://example.com/pricing",
      ],
    });

    expect(res.success).toBe(true);
    expect(res.submittedCount).toBe(3);
    expect(res.host).toBe("example.com");
  });

  it("rejects empty host domain", async () => {
    await expect(
      IndexingService.submitIndexNow({
        host: "",
        urlList: ["https://example.com/page"],
      })
    ).rejects.toThrow("A valid host domain is required");
  });

  it("rejects empty URL list", async () => {
    await expect(
      IndexingService.submitIndexNow({
        host: "example.com",
        urlList: [],
      })
    ).rejects.toThrow("Please provide at least one URL to index");
  });

  it("fetches and parses XML sitemap URLs", async () => {
    // Mock global fetch for XML sitemap
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
      Promise.resolve(
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>https://example.com/</loc></url>
            <url><loc>https://example.com/about</loc></url>
            <url><loc>https://example.com/features</loc></url>
          </urlset>`,
          { status: 200, headers: { "Content-Type": "application/xml" } }
        )
      )
    );

    const sitemapRes = await IndexingService.fetchSitemapUrls("https://example.com/sitemap.xml");
    expect(sitemapRes.urlCount).toBe(3);
    expect(sitemapRes.urls).toContain("https://example.com/about");
    expect(sitemapRes.urls).toContain("https://example.com/features");
  });
});
