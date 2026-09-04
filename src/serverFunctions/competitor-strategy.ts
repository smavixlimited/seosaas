import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { CompetitorStrategyService } from "@/services/competitor-strategy.service";

const competitorStrategyInputSchema = z.object({
  domain: z.string().min(1),
  locationCode: z.number().optional().default(2840),
});

/**
 * Server function to fetch or lazily generate a 5-pillar competitor strategy report.
 */
export const getCompetitorStrategy = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(competitorStrategyInputSchema)
  .handler(async ({ data, context }) => {
    return CompetitorStrategyService.getTeardown(
      context.projectId,
      data.domain,
      data.locationCode,
      context
    );
  });

/**
 * Server function to force regenerate a fresh 5-pillar competitor strategy report.
 */
export const regenerateCompetitorStrategy = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(competitorStrategyInputSchema)
  .handler(async ({ data, context }) => {
    return CompetitorStrategyService.generateTeardown(
      context.projectId,
      data.domain,
      data.locationCode,
      context
    );
  });
