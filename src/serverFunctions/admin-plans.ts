import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import {
  BillingPlansService,
  type AdminPlanRecord,
} from "@/services/billing-plans.service";
import { AppError } from "@/server/lib/errors";

const planLimitsSchema = z.object({
  maxDomains: z.number().int().nonnegative(),
  maxCompetitors: z.number().int().nonnegative(),
  competitorScans: z.number().int().nonnegative(),
  keywordSearches: z.number().int().nonnegative(),
  monthlyCredits: z.number().int().nonnegative(),
  auditPages: z.number().int().nonnegative(),
  uptimeMonitors: z.number().int().nonnegative(),
  teamMembers: z.number().int().nonnegative(),
});

const planFeaturesSchema = z.object({
  // 1. Overview & Strategy
  advanced_analytics: z.boolean(),
  action_roadmap: z.boolean(),
  my_reports_builder: z.boolean(),
  // 2. Brand & Reputation
  brand_analysis: z.boolean(),
  // 3. Competitor Intelligence
  competitors_directory: z.boolean(),
  competitor_ads: z.boolean(),
  competitor_analysis: z.boolean(),
  // 4. Core SEO
  keyword_research: z.boolean(),
  rank_tracker: z.boolean(),
  backlink_analysis: z.boolean(),
  site_audit: z.boolean(),
  // 5. Local SEO
  gbp_integration: z.boolean(),
  map_rank_tracker: z.boolean(),
  review_management: z.boolean(),
  listing_management: z.boolean(),
  // 6. AI & Enterprise
  ai_visibility: z.boolean(),
  ai_content_studio: z.boolean(),
  ai_seo_fixer: z.boolean(),
  indexnow_submitter: z.boolean(),
  uptime_ssl_monitoring: z.boolean(),
  white_label_pdf: z.boolean(),
  team_management: z.boolean(),
  mcp_api_access: z.boolean(),
  priority_support: z.boolean(),
  // Backward compatibility aliases
  ad_readiness: z.boolean().optional(),
  viral_detector: z.boolean().optional(),
  trends_radar: z.boolean().optional(),
  whiteLabelPdf: z.boolean().optional(),
  mcpAccess: z.boolean().optional(),
  indexnowSubmit: z.boolean().optional(),
  aeoAudit: z.boolean().optional(),
  customBranding: z.boolean().optional(),
  prioritySupport: z.boolean().optional(),
});

const upsertPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  priceUsd: z.number().nonnegative(),
  priceNgn: z.number().nonnegative(),
  billingInterval: z.string().min(1),
  isActive: z.boolean(),
  limits: planLimitsSchema,
  features: planFeaturesSchema,
});

const togglePlanStatusSchema = z.object({
  planId: z.string().min(1),
  isActive: z.boolean(),
});

export const getAdminPlansListServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BillingPlansService.getAllPlans();
  });

export const upsertAdminPlanDetailServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(upsertPlanSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BillingPlansService.upsertPlan(
      data as AdminPlanRecord,
      context.userId,
      context.userEmail,
    );
  });

export const toggleAdminPlanStatusServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(togglePlanStatusSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return BillingPlansService.togglePlanStatus(
      data.planId,
      data.isActive,
      context.userId,
      context.userEmail,
    );
  });

export const getPublicPlansServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => (data ? data : {}))
  .handler(async () => {
    return BillingPlansService.getActivePlans();
  });
