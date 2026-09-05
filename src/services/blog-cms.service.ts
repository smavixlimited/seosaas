import { SecurityAuditService } from "@/services/security-audit.service";

export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  coverImageUrl?: string | null;
  authorName: string;
  authorRole?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeywords?: string | null;
  canonicalUrl?: string | null;
  status: "published" | "draft" | "scheduled";
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
}

export interface BlogFilterOptions {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const SEED_BLOGS: BlogPostRecord[] = [
  {
    id: "blog-1-aeo-guide",
    title: "The 2026 Guide to AI Engine Optimization (AEO) and ChatGPT Search",
    slug: "guide-to-ai-engine-optimization-aeo",
    description:
      "How to optimize your brand for Perplexity, ChatGPT Search, and Google Gemini citations with schema markup and semantic authority.",
    category: "AI Visibility",
    coverImageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    authorName: "Skorvia SEO Intelligence Team",
    authorRole: "Senior AI Visibility Strategist",
    metaTitle: "The Complete 2026 AEO Guide — Rank in AI Search Engines",
    metaDescription:
      "Master AI Engine Optimization (AEO). Learn how Perplexity, Gemini, and ChatGPT index and cite websites.",
    focusKeywords:
      "AEO, AI Engine Optimization, ChatGPT Search, Perplexity SEO",
    canonicalUrl:
      "https://skorvia.com/blogs/guide-to-ai-engine-optimization-aeo",
    status: "published",
    readingTimeMinutes: 7,
    publishedAt: "2026-05-15T09:00:00.000Z",
    updatedAt: "2026-05-15T09:00:00.000Z",
    content: `# The 2026 Guide to AI Engine Optimization (AEO)

As search behavior shifts from traditional 10-blue-links toward conversational answer engines like **Perplexity AI**, **ChatGPT Search**, and **Google Gemini**, SEOs must adapt.

## What is AI Engine Optimization (AEO)?

AEO is the practice of structuring content, brand authority, and knowledge graph signals so large language models (LLMs) accurately cite and recommend your business in synthesized answers.

### 3 Core Pillars of High AI Visibility:

1. **Entity-First Information Architecture:** Use robust JSON-LD Schema markup (\`Organization\`, \`Article\`, \`FAQPage\`).
2. **Direct Answer Paragraphs:** Answer user queries in concise, 40-word standalone definitions at the top of headers.
3. **Multi-Platform Brand Consistency:** LLMs cross-reference Reddit, Wikipedia, LinkedIn, and high-DR industry publications.

> "If an LLM cannot verify your claim across at least three distinct web sources, it will hallucinate a competitor instead."

## How Skorvia Tracks AEO Visibility

With Skorvia's built-in **AI Search Visibility Tracker**, you can simulate real-time prompts across Claude 3.5, GPT-4o, and Gemini to monitor brand sentiment and citation share of voice.`,
  },
  {
    id: "blog-2-programmatic-seo",
    title: "Scaling Programmatic SEO to 100,000 Organic Visits per Month",
    slug: "scaling-programmatic-seo-100k-traffic",
    description:
      "A step-by-step blueprint for building database-driven landing pages that dominate long-tail search queries.",
    category: "Technical SEO",
    coverImageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    authorName: "Rasheed Tech",
    authorRole: "Founder & Lead Architect",
    metaTitle: "Programmatic SEO Architecture: 0 to 100K Monthly Traffic",
    metaDescription:
      "Learn the exact database schema, indexation strategies, and internal linking models for programmatic SEO.",
    focusKeywords:
      "Programmatic SEO, Long-tail Keywords, Database SEO, IndexNow",
    canonicalUrl:
      "https://skorvia.com/blogs/scaling-programmatic-seo-100k-traffic",
    status: "published",
    readingTimeMinutes: 5,
    publishedAt: "2026-06-01T10:30:00.000Z",
    updatedAt: "2026-06-01T10:30:00.000Z",
    content: `# Scaling Programmatic SEO to 100,000 Organic Visits

Programmatic SEO (pSEO) is the art of generating high-intent, templated landing pages driven by structured data.

## Why Programmatic SEO Works

Traditional content marketing requires hours of drafting per article. Programmatic SEO enables you to create hundreds of targeted comparisons, integration guides, and local landing pages in minutes.

### Steps to Launch:
- **Keyword Pattern Discovery:** Identify high-volume template modifiers like *"[Tool A] vs [Tool B]"* or *"[Feature] in [City]"*.
- **Data Normalization:** Clean and normalize your datasets in SQLite or PostgreSQL.
- **IndexNow Protocol Submission:** Batch push all generated URLs directly to Bing and Yandex using Skorvia's Instant Indexing engine.`,
  },
];

export const BlogCmsService = {
  /**
   * Calculates estimated reading time based on word count.
   */
  calculateReadingTime(content: string): number {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  },

  /**
   * Generates a clean URL slug from title.
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Retrieves all blog posts for public or admin use.
   */
  async getBlogPosts(options: BlogFilterOptions = {}): Promise<{
    posts: BlogPostRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let posts: BlogPostRecord[] = [];

    try {
      const { db } = await import("@/db");
      const { blogPosts } = await import("@/db/schema");
      const { desc } = await import("drizzle-orm");

      const rows = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.publishedAt));

      if (rows.length === 0) {
        posts = [...SEED_BLOGS];
      } else {
        posts = rows.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          description: r.description,
          content: r.content,
          category: r.category,
          coverImageUrl: r.coverImageUrl,
          authorName: r.authorName,
          authorRole: r.authorRole,
          metaTitle: r.metaTitle,
          metaDescription: r.metaDescription,
          focusKeywords: r.focusKeywords,
          canonicalUrl: r.canonicalUrl,
          status: r.status as "published" | "draft" | "scheduled",
          readingTimeMinutes: r.readingTimeMinutes,
          publishedAt: r.publishedAt
            ? String(r.publishedAt)
            : new Date().toISOString(),
          updatedAt: r.updatedAt
            ? String(r.updatedAt)
            : new Date().toISOString(),
        }));
      }
    } catch {
      posts = [...SEED_BLOGS];
    }

    // Filter by search
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    // Filter by category
    if (options.category && options.category !== "all") {
      posts = posts.filter(
        (p) => p.category.toLowerCase() === options.category?.toLowerCase(),
      );
    }

    // Filter by status
    if (options.status && options.status !== "all") {
      posts = posts.filter((p) => p.status === options.status);
    }

    const total = posts.length;
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(options.limit || 20, 100);
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = posts.slice((page - 1) * limit, page * limit);

    return {
      posts: paginated,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Retrieves a single post by slug.
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    try {
      const { db } = await import("@/db");
      const { blogPosts } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      if (row) {
        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          content: row.content,
          category: row.category,
          coverImageUrl: row.coverImageUrl,
          authorName: row.authorName,
          authorRole: row.authorRole,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          focusKeywords: row.focusKeywords,
          canonicalUrl: row.canonicalUrl,
          status: row.status as "published" | "draft" | "scheduled",
          readingTimeMinutes: row.readingTimeMinutes,
          publishedAt: row.publishedAt
            ? String(row.publishedAt)
            : new Date().toISOString(),
          updatedAt: row.updatedAt
            ? String(row.updatedAt)
            : new Date().toISOString(),
        };
      }
    } catch {}

    const fallback = SEED_BLOGS.find((p) => p.slug === slug);
    return fallback ?? null;
  },

  /**
   * Upserts a blog post (Create or Edit) and logs an audit trail event.
   */
  async upsertBlogPost(
    post: Partial<BlogPostRecord> & {
      title: string;
      content: string;
      description: string;
    },
    adminId: string,
    adminEmail: string,
  ): Promise<BlogPostRecord> {
    const slug = post.slug || this.generateSlug(post.title);
    const id =
      post.id || `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const readingTime = this.calculateReadingTime(post.content);
    const now = new Date().toISOString();

    const record: BlogPostRecord = {
      id,
      title: post.title,
      slug,
      description: post.description,
      content: post.content,
      category: post.category || "SEO Guides",
      coverImageUrl: post.coverImageUrl || null,
      authorName: post.authorName || "Skorvia SEO Editorial",
      authorRole: post.authorRole || "Senior SEO Strategist",
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.description,
      focusKeywords: post.focusKeywords || null,
      canonicalUrl: post.canonicalUrl || `https://skorvia.com/blogs/${slug}`,
      status: post.status || "published",
      readingTimeMinutes: readingTime,
      publishedAt: post.publishedAt || now,
      updatedAt: now,
    };

    try {
      const { db } = await import("@/db");
      const { blogPosts } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (existing) {
        await db
          .update(blogPosts)
          .set({
            title: record.title,
            slug: record.slug,
            description: record.description,
            content: record.content,
            category: record.category,
            coverImageUrl: record.coverImageUrl,
            authorName: record.authorName,
            authorRole: record.authorRole,
            metaTitle: record.metaTitle,
            metaDescription: record.metaDescription,
            focusKeywords: record.focusKeywords,
            canonicalUrl: record.canonicalUrl,
            status: record.status,
            readingTimeMinutes: record.readingTimeMinutes,
            updatedAt: now,
          })
          .where(eq(blogPosts.id, id));
      } else {
        await db.insert(blogPosts).values({
          id: record.id,
          title: record.title,
          slug: record.slug,
          description: record.description,
          content: record.content,
          category: record.category,
          coverImageUrl: record.coverImageUrl,
          authorName: record.authorName,
          authorRole: record.authorRole,
          metaTitle: record.metaTitle,
          metaDescription: record.metaDescription,
          focusKeywords: record.focusKeywords,
          canonicalUrl: record.canonicalUrl,
          status: record.status,
          readingTimeMinutes: record.readingTimeMinutes,
          publishedAt: record.publishedAt,
          updatedAt: now,
        });
      }

      // Record immutable audit log
      await SecurityAuditService.recordAuditLog({
        adminId,
        adminEmail,
        action: existing ? "BLOG_POST_UPDATED" : "BLOG_POST_CREATED",
        targetId: record.id,
        targetType: "blog_post",
        metadata: {
          title: record.title,
          slug: record.slug,
          status: record.status,
        },
      });
    } catch (err) {
      console.warn("Failed to persist blog post to DB:", err);
    }

    return record;
  },

  /**
   * Deletes a blog post and records an audit log.
   */
  async deleteBlogPost(
    id: string,
    adminId: string,
    adminEmail: string,
  ): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { blogPosts } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db.delete(blogPosts).where(eq(blogPosts.id, id));

      await SecurityAuditService.recordAuditLog({
        adminId,
        adminEmail,
        action: "BLOG_POST_DELETED",
        targetId: id,
        targetType: "blog_post",
        metadata: { postId: id },
      });
    } catch (err) {
      console.warn("Failed to delete blog post in DB:", err);
    }

    return true;
  },
};
