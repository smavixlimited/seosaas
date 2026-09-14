import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "./middleware";
import {
  CompetitorAdsService,
  AdPlatform,
} from "@/services/competitor-ads.service";
import { RoadmapService } from "@/services/roadmap.service";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";

const adPlatformSchema = z.enum([
  "meta",
  "google",
  "tiktok",
  "linkedin",
  "all",
]);

export const getCompetitorAdsServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      competitorDomain: z.string().min(1),
      platform: adPlatformSchema.optional(),
      forceRefresh: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_ads",
    );
    return CompetitorAdsService.getCompetitorAds({
      projectId: data.projectId,
      competitorDomain: data.competitorDomain,
      platform: data.platform as AdPlatform | "all" | undefined,
      forceRefresh: data.forceRefresh,
    });
  });

export const exportAdAngleToRoadmapServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      competitorDomain: z.string().min(1),
      platform: z.string().min(1),
      suggestedHook: z.string().min(1),
      counterPlaySummary: z.string().min(1),
      recommendedCta: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const task = await RoadmapService.createCustomTask(data.projectId, {
      title: `Deploy Ad Counter-Play: ${data.suggestedHook.slice(0, 60)}...`,
      description: `Target Platform: ${data.platform.toUpperCase()}\n\nStrategy: ${data.counterPlaySummary}\n\nCall To Action: ${data.recommendedCta || "Get Started"}\n\nCompetitor Target: ${data.competitorDomain}`,
      category: "content_gap",
      priority: "high",
      estimatedMinutes: 30,
      targetUrl: `https://${data.competitorDomain}`,
    });

    return { success: true, task };
  });
