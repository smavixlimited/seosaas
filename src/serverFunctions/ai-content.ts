import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { AiContentEngineService } from "@/services/ai-content-engine.service";
import { ContentPublishingService } from "@/services/content-publishing.service";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";

const projectIdInputSchema = z.object({
  projectId: z.string().min(1),
});

const generateArticleInputSchema = z.object({
  projectId: z.string().min(1),
  targetKeyword: z.string().min(1),
  customTitle: z.string().optional(),
  targetWordCount: z.number().optional(),
  tone: z.string().optional(),
  customBrief: z.string().optional(),
  platform: z.enum(["wordpress", "shopify", "webhook", "manual"]).optional(),
});

const listArticlesInputSchema = z.object({
  projectId: z.string().min(1),
  status: z.string().optional(),
});

const updateArticleInputSchema = z.object({
  projectId: z.string().min(1),
  articleId: z.string().min(1),
  title: z.string().optional(),
  slug: z.string().optional(),
  metaDescription: z.string().optional(),
  contentMarkdown: z.string().optional(),
  status: z.enum(["draft", "queued", "published", "failed"]).optional(),
  publishedUrl: z.string().optional(),
});

const deleteArticleInputSchema = z.object({
  projectId: z.string().min(1),
  articleId: z.string().min(1),
});

const saveIntegrationInputSchema = z.object({
  projectId: z.string().min(1),
  platform: z.enum(["wordpress", "shopify", "webhook"]),
  isEnabled: z.boolean(),
  apiUrl: z.string().optional(),
  credentials: z.record(z.string(), z.string()),
  autoPublishMode: z.enum(["require_approval", "autopilot"]).optional(),
  publishFrequency: z
    .enum(["daily", "weekly", "biweekly", "manual"])
    .optional(),
});

const testIntegrationInputSchema = z.object({
  projectId: z.string().min(1),
  platform: z.enum(["wordpress", "shopify", "webhook"]),
});

const publishArticleInputSchema = z.object({
  projectId: z.string().min(1),
  articleId: z.string().min(1),
  platform: z.enum(["wordpress", "shopify", "webhook"]).optional(),
});

/**
 * Discover high-intent unranked content topics from competitor gaps & brand profile.
 */
export const discoverContentTopics = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(projectIdInputSchema)
  .handler(async ({ data }) => {
    return AiContentEngineService.discoverContentTopics(data.projectId);
  });

/**
 * Generate 1,800+ word deep SEO article with JSON-LD schema.
 */
export const generateArticle = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(generateArticleInputSchema)
  .handler(async ({ data, context }) => {
    // Feature gating / credit enforcement
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_analysis",
    );
    await PlanEntitlementService.assertSufficientCredits(context.userId, 2);

    return AiContentEngineService.generateArticle(data.projectId, {
      targetKeyword: data.targetKeyword,
      customTitle: data.customTitle,
      targetWordCount: data.targetWordCount,
      tone: data.tone,
      customBrief: data.customBrief,
      platform: data.platform,
    });
  });

/**
 * List all project articles.
 */
export const listArticles = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(listArticlesInputSchema)
  .handler(async ({ data }) => {
    return AiContentEngineService.listArticles(data.projectId, data.status);
  });

/**
 * Update an article.
 */
export const updateArticle = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateArticleInputSchema)
  .handler(async ({ data }) => {
    return AiContentEngineService.updateArticle(
      data.projectId,
      data.articleId,
      {
        title: data.title,
        slug: data.slug,
        metaDescription: data.metaDescription,
        contentMarkdown: data.contentMarkdown,
        status: data.status,
        publishedUrl: data.publishedUrl,
      },
    );
  });

/**
 * Delete an article.
 */
export const deleteArticle = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(deleteArticleInputSchema)
  .handler(async ({ data }) => {
    return AiContentEngineService.deleteArticle(data.projectId, data.articleId);
  });

/**
 * Get publishing integrations.
 */
export const getPublishingIntegrations = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(projectIdInputSchema)
  .handler(async ({ data }) => {
    return ContentPublishingService.getIntegrations(data.projectId);
  });

/**
 * Save publishing integration.
 */
export const savePublishingIntegration = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(saveIntegrationInputSchema)
  .handler(async ({ data, context }) => {
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_analysis",
    );

    return ContentPublishingService.saveIntegration(data.projectId, {
      platform: data.platform,
      isEnabled: data.isEnabled,
      apiUrl: data.apiUrl,
      credentials: data.credentials,
      autoPublishMode: data.autoPublishMode,
      publishFrequency: data.publishFrequency,
    });
  });

/**
 * Test publishing integration connection.
 */
export const testPublishingConnection = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(testIntegrationInputSchema)
  .handler(async ({ data }) => {
    return ContentPublishingService.testConnection(
      data.projectId,
      data.platform,
    );
  });

/**
 * Publish article to WordPress, Shopify, or Webhook destination.
 */
export const publishArticle = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(publishArticleInputSchema)
  .handler(async ({ data, context }) => {
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_analysis",
    );

    return ContentPublishingService.publishArticle(
      data.projectId,
      data.articleId,
      data.platform,
    );
  });
