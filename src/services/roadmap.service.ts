import { generateText } from "ai";

export type RoadmapCategory =
  | "quick_win"
  | "high_impact"
  | "technical"
  | "content_gap"
  | "growth";
export type RoadmapStatus = "todo" | "in_progress" | "completed" | "dismissed";
export type VerificationType = "manual" | "ai_generated" | "live_crawled";

export interface RoadmapTaskItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  priority: "critical" | "high" | "medium" | "low";
  impactBadge: string;
  estimatedMinutes: number;
  status: RoadmapStatus;
  verificationType: VerificationType;
  verifiedAt: string | null;
  sourceType: string;
  sourceIssueId?: string | null;
  targetUrl?: string | null;
  aiPrompt?: string | null;
  aiFixCodeSnippet?: string | null;
  completedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // e.g. 75 (%)
  estimatedMinutesSaved: number;
  healthScoreBoost: number; // e.g. +14 pts
  byCategory: Record<RoadmapCategory, { total: number; completed: number }>;
}

export const RoadmapService = {
  /**
   * Retrieves all roadmap tasks for a project, seeding initial tasks if empty.
   */
  async getRoadmapTasks(
    projectId: string,
    domain?: string,
  ): Promise<RoadmapTaskItem[]> {
    let tasks: RoadmapTaskItem[] = [];

    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");
      const { eq, desc } = await import("drizzle-orm");

      const rows = await db
        .select()
        .from(roadmapTasks)
        .where(eq(roadmapTasks.projectId, projectId))
        .orderBy(desc(roadmapTasks.createdAt));

      if (rows.length > 0) {
        return rows as RoadmapTaskItem[];
      }
    } catch (err) {
      console.warn("DB read error in getRoadmapTasks:", err);
    }

    // Auto-seed initial roadmap if empty
    const cleanDomain = domain || "yourwebsite.com";
    return this.seedInitialRoadmap(projectId, cleanDomain);
  },

  /**
   * Automatically populates a rich, prioritized SEO & Growth Sprint for a project.
   */
  async seedInitialRoadmap(
    projectId: string,
    domain: string,
  ): Promise<RoadmapTaskItem[]> {
    const now = new Date().toISOString();
    const defaultTasks: Array<
      Omit<RoadmapTaskItem, "id" | "createdAt" | "updatedAt">
    > = [
      {
        projectId,
        title: "Deploy SoftwareApplication & Organization Schema Markup",
        description:
          "Add structured JSON-LD schema to the homepage and key product pages to help Google AI Overviews and Perplexity cite entity features accurately.",
        category: "high_impact",
        priority: "critical",
        impactBadge: "High Impact",
        estimatedMinutes: 5,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "audit",
        targetUrl: `https://${domain}`,
        aiPrompt: `Generate complete, valid SoftwareApplication and Organization Schema.org JSON-LD markup for https://${domain}. Include name, applicationCategory, operatingSystem, offers, and aggregateRating fields ready to drop into the <head> tag.`,
        aiFixCodeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "SoftwareApplication",\n  "name": "${domain}",\n  "applicationCategory": "BusinessApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "USD"\n  }\n}\n</script>`,
      },
      {
        projectId,
        title: "Fix Missing H1 Tag and Meta Description on Core Landing Pages",
        description:
          "Pages missing primary headings and meta descriptions suffer severe click-through and ranking penalties across SERP results.",
        category: "quick_win",
        priority: "high",
        impactBadge: "Quick Win (< 5m)",
        estimatedMinutes: 3,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "audit",
        targetUrl: `https://${domain}/features`,
        aiPrompt: `Write a high-converting, keyword-rich H1 title and a 155-character meta description for https://${domain}/features optimized for maximum SERP click-through rate.`,
        aiFixCodeSnippet: `<title>${domain} | Powerful All-In-One Search Intelligence Platform</title>\n<meta name="description" content="Supercharge your search rankings, audit site technical health, and dominate organic search with ${domain}. Start your 14-day trial today." />\n<h1>Next-Gen Search Intelligence & Automated SEO Auditing</h1>`,
      },
      {
        projectId,
        title: "Launch Competitor Comparison Battlecard Landing Page",
        description:
          "Capture high-intent buyers searching for alternative solutions by deploying an objective, feature-by-feature comparison guide.",
        category: "growth",
        priority: "high",
        impactBadge: "Growth Play",
        estimatedMinutes: 45,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "competitor",
        targetUrl: `https://${domain}/vs/competitor`,
        aiPrompt: `Draft a complete high-converting comparison page outline titled '${domain} vs Top Competitors: The 2026 Objective Guide' featuring feature matrices, transparent pricing, and switch-over reasons.`,
      },
      {
        projectId,
        title: "Optimize Largest Contentful Paint (LCP) & Image Formats",
        description:
          "Compress hero banner assets to WebP and enable lazy loading on below-the-fold images to pass Google Core Web Vitals.",
        category: "technical",
        priority: "medium",
        impactBadge: "Technical Health",
        estimatedMinutes: 15,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "audit",
        targetUrl: `https://${domain}`,
        aiPrompt: `Provide exact Nginx / Cloudflare cache header configurations and HTML picture tag code to optimize LCP hero assets and serve next-gen WebP/AVIF formats.`,
        aiFixCodeSnippet: `<!-- Next-Gen Image Tag with High Fetch Priority for LCP -->\n<link rel="preload" as="image" href="/assets/hero.webp" type="image/webp" fetchpriority="high">\n<img src="/assets/hero.webp" alt="${domain} Dashboard" width="1200" height="630" fetchpriority="high" decoding="async" />`,
      },
      {
        projectId,
        title: "Optimize Page 2 Striking-Distance Keywords (Ranks #11–#20)",
        description:
          "Target commercial queries ranking just off page 1 by adding rich FAQ sections, data tables, and actionable step-by-step guides.",
        category: "content_gap",
        priority: "high",
        impactBadge: "High Impact",
        estimatedMinutes: 20,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "competitor",
        targetUrl: `https://${domain}/blog/seo-guide`,
        aiPrompt: `Generate a 4-item FAQ Schema section with direct, authoritative answers to boost rankings for striking-distance commercial queries on ${domain}.`,
        aiFixCodeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "How does ${domain} improve search rankings?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "${domain} provides automated site audits, daily rank tracking, and AI-driven keyword opportunities to capture page 1 search visibility."\n      }\n    }\n  ]\n}\n</script>`,
      },
      {
        projectId,
        title: "Claim Unlinked Brand Mentions Across Industry Blogs",
        description:
          "Find publications and directories that mentioned your brand name without a link and send a personalized outreach pitch to secure dofollow backlinks.",
        category: "growth",
        priority: "medium",
        impactBadge: "Quick Win (< 5m)",
        estimatedMinutes: 10,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "growth",
        aiPrompt: `Write a polite, personalized 4-sentence outreach email to a blog editor requesting to turn an existing unlinked mention of ${domain} into a live hyperlink.`,
      },
      {
        projectId,
        title: "Eliminate Broken 404 Links & Setup 301 Redirect Rules",
        description:
          "Redirect broken legacy URLs to relevant live pages to recover lost link equity and prevent search crawler crawl-budget waste.",
        category: "technical",
        priority: "high",
        impactBadge: "Technical Health",
        estimatedMinutes: 10,
        status: "todo",
        verificationType: "manual",
        verifiedAt: null,
        sourceType: "audit",
        aiPrompt: `Provide Cloudflare _redirects or _headers rules and Nginx rewrite syntax to permanently redirect (301) broken legacy URLs to canonical parent pages.`,
        aiFixCodeSnippet: `# Cloudflare Pages / _redirects rule\n/old-page-url  /new-canonical-page  301\n/legacy-blog/*  /blog/:splat  301`,
      },
    ];

    const seededTasks: RoadmapTaskItem[] = [];

    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");

      for (const t of defaultTasks) {
        const id = crypto.randomUUID();
        const fullTask: RoadmapTaskItem = {
          ...t,
          id,
          createdAt: now,
          updatedAt: now,
        };

        await db.insert(roadmapTasks).values(fullTask);
        seededTasks.push(fullTask);
      }
    } catch (err) {
      console.warn("DB insert error while seeding roadmap tasks:", err);
      // Fallback in-memory task representations
      return defaultTasks.map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }));
    }

    return seededTasks;
  },

  /**
   * Updates task status with 3-way verification logging.
   */
  async updateTaskStatus(
    taskId: string,
    status: RoadmapStatus,
    userId?: string,
    verificationType: VerificationType = "manual",
  ): Promise<RoadmapTaskItem | null> {
    const now = new Date().toISOString();
    const verifiedAt = status === "completed" ? now : null;

    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(roadmapTasks)
        .where(eq(roadmapTasks.id, taskId))
        .limit(1);
      if (!existing) return null;

      await db
        .update(roadmapTasks)
        .set({
          status,
          verificationType:
            status === "completed"
              ? verificationType
              : existing.verificationType,
          verifiedAt,
          completedByUserId: status === "completed" ? userId : null,
          updatedAt: now,
        })
        .where(eq(roadmapTasks.id, taskId));

      return {
        ...existing,
        status,
        verificationType:
          status === "completed" ? verificationType : existing.verificationType,
        verifiedAt,
        completedByUserId: status === "completed" ? userId : null,
        updatedAt: now,
      } as RoadmapTaskItem;
    } catch (err) {
      console.warn("Error updating roadmap task status:", err);
      return null;
    }
  },

  /**
   * Generates an instant AI Fix (Schema JSON-LD, meta tags, redirect rules, or copy outline)
   * using OpenRouter and auto-completes the task with verificationType: "ai_generated".
   */
  async generateAiFix(
    taskId: string,
    userId?: string,
  ): Promise<{ task: RoadmapTaskItem; codeSnippet: string }> {
    let task: RoadmapTaskItem | null = null;

    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(roadmapTasks)
        .where(eq(roadmapTasks.id, taskId))
        .limit(1);
      if (existing) {
        task = existing as RoadmapTaskItem;
      }
    } catch (err) {
      console.warn("DB lookup error in generateAiFix:", err);
    }

    if (!task) {
      throw new Error(`Roadmap task ${taskId} not found`);
    }

    let codeSnippet = task.aiFixCodeSnippet || "";

    if (!codeSnippet && task.aiPrompt) {
      try {
        const { getChatAgentModel } = await import("@/server/lib/openrouter");
        const model = await getChatAgentModel();

        const response = await generateText({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a Principal Full-Stack SEO Architect. Generate the exact production-ready code snippet (Schema JSON-LD, HTML meta tags, redirect directives, or copy asset) to resolve the requested task. Return ONLY the clean code block or structured markup without preamble.",
            },
            {
              role: "user",
              content: task.aiPrompt,
            },
          ],
          temperature: 0.2,
        });

        codeSnippet = response.text.trim();
      } catch (aiErr) {
        console.warn("LLM fallback for roadmap AI fix:", aiErr);
        codeSnippet = `<!-- AI Code Fix for: ${task.title} -->\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${task.title}",\n  "description": "${task.description}"\n}\n</script>`;
      }
    }

    // Update task in DB with codeSnippet and mark completed
    const now = new Date().toISOString();
    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(roadmapTasks)
        .set({
          status: "completed",
          verificationType: "ai_generated",
          verifiedAt: now,
          aiFixCodeSnippet: codeSnippet,
          completedByUserId: userId,
          updatedAt: now,
        })
        .where(eq(roadmapTasks.id, taskId));

      task.status = "completed";
      task.verificationType = "ai_generated";
      task.verifiedAt = now;
      task.aiFixCodeSnippet = codeSnippet;
    } catch (dbErr) {
      console.warn("DB update error in generateAiFix:", dbErr);
    }

    return {
      task,
      codeSnippet,
    };
  },

  /**
   * Autonomous Live Crawl Auto-Detect: Cross-references recent audit issues with active roadmap tasks.
   * If fixed in the latest crawl, marks tasks as completed with verificationType: "live_crawled".
   */
  async syncAuditIssuesToRoadmap(
    projectId: string,
  ): Promise<{ newlyVerifiedCount: number }> {
    let newlyVerifiedCount = 0;
    const now = new Date().toISOString();

    try {
      const { db } = await import("@/db");
      const { roadmapTasks, auditIssues } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      // Find open roadmap tasks linked to audit issues
      const activeTasks = await db
        .select()
        .from(roadmapTasks)
        .where(
          and(
            eq(roadmapTasks.projectId, projectId),
            eq(roadmapTasks.status, "todo"),
          ),
        );

      for (const t of activeTasks) {
        if (t.sourceIssueId) {
          const [issue] = await db
            .select()
            .from(auditIssues)
            .where(eq(auditIssues.id, t.sourceIssueId))
            .limit(1);

          // If issue was marked fixed or no longer active in latest audit
          if (!issue) {
            await db
              .update(roadmapTasks)
              .set({
                status: "completed",
                verificationType: "live_crawled",
                verifiedAt: now,
                updatedAt: now,
              })
              .where(eq(roadmapTasks.id, t.id));

            newlyVerifiedCount++;
          }
        }
      }
    } catch (err) {
      console.warn("Error during live crawl roadmap sync:", err);
    }

    return { newlyVerifiedCount };
  },

  /**
   * Computes sprint metrics: completion rate, estimated time saved, health score boost.
   */
  async getRoadmapMetrics(
    projectId: string,
    domain?: string,
  ): Promise<RoadmapMetrics> {
    const tasks = await this.getRoadmapTasks(projectId, domain);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let estimatedMinutesSaved = 0;
    let healthScoreBoost = 0;

    const byCategory: Record<
      RoadmapCategory,
      { total: number; completed: number }
    > = {
      quick_win: { total: 0, completed: 0 },
      high_impact: { total: 0, completed: 0 },
      technical: { total: 0, completed: 0 },
      content_gap: { total: 0, completed: 0 },
      growth: { total: 0, completed: 0 },
    };

    tasks.forEach((t) => {
      const cat = (
        t.category in byCategory ? t.category : "quick_win"
      ) as RoadmapCategory;
      byCategory[cat].total++;
      if (t.status === "completed") {
        byCategory[cat].completed++;
        estimatedMinutesSaved += t.estimatedMinutes || 15;
        healthScoreBoost +=
          t.priority === "critical" ? 4 : t.priority === "high" ? 3 : 2;
      }
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      estimatedMinutesSaved,
      healthScoreBoost,
      byCategory,
    };
  },

  /**
   * Creates a custom roadmap task.
   */
  async createCustomTask(
    projectId: string,
    data: {
      title: string;
      description: string;
      category: RoadmapCategory;
      priority?: "critical" | "high" | "medium" | "low";
      estimatedMinutes?: number;
      targetUrl?: string;
      aiPrompt?: string;
    },
  ): Promise<RoadmapTaskItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const impactBadge =
      data.category === "quick_win"
        ? "Quick Win (< 5m)"
        : data.category === "high_impact"
          ? "High Impact"
          : data.category === "technical"
            ? "Technical Health"
            : data.category === "content_gap"
              ? "Content Moat"
              : "Growth Play";

    const newTask: RoadmapTaskItem = {
      id,
      projectId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || "medium",
      impactBadge,
      estimatedMinutes: data.estimatedMinutes || 15,
      status: "todo",
      verificationType: "manual",
      verifiedAt: null,
      sourceType: "custom",
      targetUrl: data.targetUrl || null,
      aiPrompt: data.aiPrompt || null,
      aiFixCodeSnippet: null,
      completedByUserId: null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { db } = await import("@/db");
      const { roadmapTasks } = await import("@/db/schema");
      await db.insert(roadmapTasks).values(newTask);
    } catch (err) {
      console.warn("Error inserting custom roadmap task:", err);
    }

    return newTask;
  },
};
