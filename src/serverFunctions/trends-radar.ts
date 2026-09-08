import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { TrendsRadarService } from "@/services/trends-radar.service";

const trendsRadarQuerySchema = z.object({
  projectId: z.string().optional(),
  customTopic: z.string().optional(),
});

export const getTrendingRadar = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(trendsRadarQuerySchema)
  .handler(async ({ data, context }) => {
    return TrendsRadarService.getTrendingRadar(
      context.projectId,
      data?.customTopic,
    );
  });
