import { describe, it, expect, beforeEach } from "vitest";
import { BlogCmsService } from "@/services/blog-cms.service";

describe("BlogCmsService (Blog CMS & SEO Publishing Engine)", () => {
  beforeEach(() => {
    // Reset state if needed
  });

  describe("Utility Helpers", () => {
    it("generates clean URL slugs from article titles", () => {
      const slug = BlogCmsService.generateSlug(
        "10 Proven Ways to Rank #1 on Perplexity & Google!",
      );
      expect(slug).toBe("10-proven-ways-to-rank-1-on-perplexity-google");
    });

    it("calculates estimated reading time based on word count", () => {
      const shortText = "Word ".repeat(100);
      expect(BlogCmsService.calculateReadingTime(shortText)).toBe(1);

      const longText = "Word ".repeat(600);
      expect(BlogCmsService.calculateReadingTime(longText)).toBe(3);
    });
  });

  describe("Post Retrieval & Filters", () => {
    it("retrieves published posts with default seed fallback", async () => {
      const result = await BlogCmsService.getBlogPosts({ status: "published" });
      expect(result.posts.length).toBeGreaterThan(0);
      expect(result.posts[0].slug).toBeDefined();
      expect(result.posts[0].readingTimeMinutes).toBeGreaterThan(0);
    });

    it("retrieves a post by slug", async () => {
      const post = await BlogCmsService.getBlogPostBySlug(
        "guide-to-ai-engine-optimization-aeo",
      );
      expect(post).toBeDefined();
      expect(post?.title).toContain("AI Engine Optimization");
      expect(post?.category).toBe("AI Visibility");
    });
  });

  describe("Post CRUD Operations", () => {
    it("creates and updates a blog post", async () => {
      const created = await BlogCmsService.upsertBlogPost(
        {
          title: "Next-Gen SaaS SEO Trends for 2027",
          description:
            "An in-depth forecast of AI search trends and semantic ranking models.",
          content:
            "## The Future of Search\n\nAI Overviews and conversational agents will continue to transform search...",
          category: "Technical SEO",
          status: "published",
        },
        "usr_superadmin_01",
        "admin@skorvia.com",
      );

      expect(created.id).toBeDefined();
      expect(created.slug).toBe("next-gen-saas-seo-trends-for-2027");
      expect(created.readingTimeMinutes).toBe(1);
      expect(created.canonicalUrl).toContain(
        "/blogs/next-gen-saas-seo-trends-for-2027",
      );

      const deleted = await BlogCmsService.deleteBlogPost(
        created.id,
        "usr_superadmin_01",
        "admin@skorvia.com",
      );
      expect(deleted).toBe(true);
    });
  });
});
