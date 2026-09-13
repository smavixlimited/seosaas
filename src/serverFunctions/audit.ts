import { createServerFn } from "@tanstack/react-start";
import { waitUntil } from "cloudflare:workers";
import { z } from "zod";
import { AuditService } from "@/server/features/audit/services/AuditService";
import { captureServerEvent } from "@/server/lib/posthog";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  deleteAuditSchema,
  getAuditHistorySchema,
  getAuditResultsSchema,
  getAuditStatusSchema,
  getCrawlProgressSchema,
  startAuditSchema,
} from "@/types/schemas/audit";

export const startAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(startAuditSchema)
  .handler(async ({ data, context }) => {
    const limitTier = await AuditService.resolveAuditLimitTier(
      context.organizationId,
    );

    const result = await AuditService.startAudit({
      actorUserId: context.userId,
      billingCustomer: context,
      projectId: context.projectId,
      startUrl: data.startUrl,
      maxPages: data.maxPages,
      lighthouseStrategy: data.lighthouseStrategy,
      limitTier,
    });

    waitUntil(
      captureServerEvent({
        distinctId: context.userId,
        event: "site_audit:start",
        organizationId: context.organizationId,
        properties: {
          project_id: context.projectId,
          max_pages: data.maxPages ?? 50,
          run_lighthouse: data.lighthouseStrategy !== "none",
          plan_tier: limitTier,
        },
      }),
    );

    return result;
  });

export const getAuditStatus = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getAuditStatusSchema)
  .handler(async ({ data, context }) => {
    return AuditService.getStatus(data.auditId, context.projectId);
  });

export const getAuditResults = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getAuditResultsSchema)
  .handler(async ({ data, context }) => {
    return AuditService.getResults(data.auditId, context.projectId);
  });

export const getAuditHistory = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getAuditHistorySchema)
  .handler(async ({ context }) => {
    return AuditService.getHistory(context.projectId);
  });

export const getCrawlProgress = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getCrawlProgressSchema)
  .handler(async ({ data, context }) => {
    return AuditService.getCrawlProgress(data.auditId, context.projectId);
  });

export const deleteAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(deleteAuditSchema)
  .handler(async ({ data, context }) => {
    await AuditService.remove(data.auditId, context.projectId);
    return { success: true };
  });

function generateRuleBasedFix(issueType: string, pageUrl: string): string {
  const urlObj = (() => {
    try { return new URL(pageUrl); } catch { return null; }
  })();
  const pathname = urlObj?.pathname || pageUrl;

  if (issueType.includes("title") || issueType.includes("missing_title")) {
    const slugName = pathname.replace(/[\/\-_]+/g, " ").trim() || "Home";
    const capitalized = slugName.replace(/\b\w/g, (c) => c.toUpperCase());
    return `<title>${capitalized} | High Performance SEO & Digital Growth</title>`;
  }

  if (issueType.includes("description") || issueType.includes("meta")) {
    return `<meta name="description" content="Discover key insights, features, and comprehensive solutions for ${pathname}. Optimized for fast indexing and maximum search visibility." />`;
  }

  if (issueType.includes("canonical")) {
    return `<link rel="canonical" href="${pageUrl}" />`;
  }

  if (issueType.includes("robots") || issueType.includes("noindex")) {
    return `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`;
  }

  if (issueType.includes("schema") || issueType.includes("structured")) {
    return `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "url": "${pageUrl}",\n  "name": "${pathname}"\n}\n</script>`;
  }

  if (issueType.includes("redirect") || issueType.includes("404") || issueType.includes("broken")) {
    return `# Nginx 301 Redirect\nrewrite ^${pathname}$ / permanent;\n\n# Cloudflare _redirects\n${pathname}  /  301`;
  }

  return `<!-- Suggested fix for ${issueType} on ${pageUrl} -->\n<link rel="canonical" href="${pageUrl}" />\n<meta name="robots" content="index, follow" />`;
}

export const generateAuditIssueAiFix = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().optional(),
      issueType: z.string().min(1),
      title: z.string().min(1),
      pageUrl: z.string().min(1),
      detailsJson: z.string().nullable().optional(),
      howToFix: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    let generatedFix = "";
    let explanation = "";

    try {
      const { getChatAgentModel } = await import("@/server/lib/openrouter");
      const { generateText } = await import("ai");
      const model = await getChatAgentModel();

      const prompt = `You are Skorvia AI, an elite technical SEO architect.
A website audit found the following technical SEO issue on page: ${data.pageUrl}
Issue: ${data.title} (${data.issueType})
How to fix: ${data.howToFix || "Resolve this issue"}
Details: ${data.detailsJson || "None"}

Please generate:
1. Exact, production-ready code snippet, HTML tag (e.g. meta tags, canonical link, JSON-LD schema, robots.txt rule, or redirect syntax) to fix this issue directly.
2. A clear, concise 2-sentence explanation of why this fix solves the problem.

Format your response strictly as valid JSON:
{
  "codeSnippet": "...",
  "explanation": "..."
}`;

      const response = await generateText({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const text = response.text.trim();
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          generatedFix = parsed.codeSnippet || text;
          explanation = parsed.explanation || "";
        } else {
          generatedFix = text;
        }
      } catch {
        generatedFix = text;
      }
    } catch {
      // Fallback smart code generator based on issueType
      generatedFix = generateRuleBasedFix(data.issueType, data.pageUrl);
      explanation = `Automated fix generated for ${data.title}. Apply this snippet directly to your HTML <head> or server configuration.`;
    }

    return {
      codeSnippet: generatedFix,
      explanation,
    };
  });
