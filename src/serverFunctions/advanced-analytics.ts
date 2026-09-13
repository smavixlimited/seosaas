import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  AdvancedAnalyticsService,
  type AnalyticsDateRange,
} from "@/services/advanced-analytics.service";

const getAnalyticsSchema = z.object({
  projectId: z.string().optional(),
  dateRange: z.enum(["7d", "30d", "90d", "180d", "365d"]).optional(),
});

/**
 * Retrieves executive growth & multi-channel SEO analytics overview
 */
export const getAdvancedAnalyticsOverview = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getAnalyticsSchema)
  .handler(async ({ data, context }) => {
    const range = (data?.dateRange || "30d") as AnalyticsDateRange;
    return AdvancedAnalyticsService.getAnalyticsOverview(
      context.projectId,
      range,
    );
  });

/**
 * Exports analytics data in CSV format
 */
export const exportAdvancedAnalyticsCsv = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getAnalyticsSchema)
  .handler(async ({ data, context }) => {
    const range = (data?.dateRange || "30d") as AnalyticsDateRange;
    const report = await AdvancedAnalyticsService.getAnalyticsOverview(
      context.projectId,
      range,
    );
    const csvContent = AdvancedAnalyticsService.exportToCsv(report);
    return {
      filename: `advanced-analytics-${report.domain}-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
      csvContent,
    };
  });
