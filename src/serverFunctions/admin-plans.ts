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
  monthlyCredits: z.number().int().nonnegative(),
  auditPages: z.number().int().nonnegative(),
  uptimeMonitors: z.number().int().nonnegative(),
});

const planFeaturesSchema = z.object({
  // 1. Core SEO
  keyword_research: z.boolean().default(true),
  rank_tracker: z.boolean().default(true),
  backlink_analysis: z.boolean().default(true),
  site_audit: z.boolean().default(true),
  // 2. Local SEO
  gbp_integration: z.boolean().default(false),
  map_rank_tracker: z.boolean().default(false),
  review_management: z.boolean().default(false),
  listing_management: z.boolean().default(false),
  // 3. AI & Content
  ai_visibility: z.boolean().default(false),
  ai_content_studio: z.boolean().default(false),
  ai_seo_fixer: z.boolean().default(false),
  indexnow_submitter: z.boolean().default(false),
  // 4. Infrastructure & Agency
  uptime_ssl_monitoring: z.boolean().default(false),
  my_reports_builder: z.boolean().default(false),
  white_label_pdf: z.boolean().default(false),
  team_management: z.boolean().default(false),
  mcp_api_access: z.boolean().default(false),
  priority_support: z.boolean().default(false),
  // Backward compatibility aliases
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
