import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "./middleware";
import {
  ViralContentService,
  ViralPlatform,
} from "@/services/viral-content.service";

const platformSchema = z
  .enum(["tiktok", "instagram", "youtube", "x", "linkedin"])
  .optional();

const viralQuerySchema = z
  .object({
    projectId: z.string().optional(),
    platform: platformSchema,
  })
  .optional();

export const getViralOpportunities = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(viralQuerySchema)
  .handler(async ({ data, context }) => {
    return ViralContentService.getOpportunities(
      context.projectId,
      data?.platform as ViralPlatform,
    );
  });

const generateViralQuerySchema = z
  .object({
    projectId: z.string().optional(),
    platform: platformSchema,
    customTopic: z.string().max(300).optional(),
  })
  .optional();

export const generateViralOpportunities = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(generateViralQuerySchema)
  .handler(async ({ data, context }) => {
    return ViralContentService.generateOpportunities(
      context.projectId,
      data?.platform as ViralPlatform,
      data?.customTopic,
    );
  });

export const updateViralOpportunityStatus = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().optional(),
      opportunityId: z.string().min(1),
      status: z.enum(["suggested", "saved", "created", "dismissed"]),
    }),
  )
  .handler(async ({ data, context }) => {
    return ViralContentService.updateStatus(
      context.projectId,
      data.opportunityId,
      data.status,
    );
  });
