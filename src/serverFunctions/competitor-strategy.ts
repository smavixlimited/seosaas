import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { CompetitorStrategyService } from "@/services/competitor-strategy.service";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";

const competitorStrategyInputSchema = z.object({
  projectId: z.string().optional(),
  domain: z.string().min(1),
  locationCode: z.number().optional().default(2840),
});

async function resolveEffectiveProjectId(
  explicitProjectId: string | undefined,
  organizationId: string,
): Promise<string> {
  if (explicitProjectId && explicitProjectId.trim().length > 0) {
    return explicitProjectId.trim();
  }
  try {
    const { db } = await import("@/db");
    const { projects } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const [p] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.organizationId, organizationId))
      .limit(1);
    if (p?.id) return p.id;
  } catch (err) {
    console.warn(
      "Failed to find fallback project for competitor strategy:",
      err,
    );
  }
  return "default";
}

/**
 * Server function to fetch or lazily generate a 5-pillar competitor strategy report.
 */
export const getCompetitorStrategy = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(competitorStrategyInputSchema)
  .handler(async ({ data, context }) => {
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_analysis",
    );
    const effectiveProjectId = await resolveEffectiveProjectId(
      data.projectId,
      context.organizationId,
    );
    return CompetitorStrategyService.getTeardown(
      effectiveProjectId,
      data.domain,
      data.locationCode,
      context,
    );
  });

/**
 * Server function to force regenerate a fresh 5-pillar competitor strategy report.
 */
export const regenerateCompetitorStrategy = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(competitorStrategyInputSchema)
  .handler(async ({ data, context }) => {
    const effectiveProjectId = await resolveEffectiveProjectId(
      data.projectId,
      context.organizationId,
    );
    return CompetitorStrategyService.generateTeardown(
      effectiveProjectId,
      data.domain,
      data.locationCode,
      context,
    );
  });
