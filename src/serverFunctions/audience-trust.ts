import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "./middleware";
import { AudienceTrustService } from "@/services/audience-trust.service";

const audienceTrustQuerySchema = z
  .object({
    projectId: z.string().optional(),
    industry: z.string().optional(),
    campaignGoal: z.string().optional(),
    adPlatform: z.string().optional(),
  })
  .optional();

export const getAudienceTrustAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(audienceTrustQuerySchema)
  .handler(async ({ context, data }) => {
    return AudienceTrustService.getTrustAudit(context.projectId, {
      industry: data?.industry,
      campaignGoal: data?.campaignGoal,
      adPlatform: data?.adPlatform,
    });
  });

export const runAudienceTrustAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(audienceTrustQuerySchema)
  .handler(async ({ context, data }) => {
    return AudienceTrustService.runTrustAudit(context.projectId, {
      industry: data?.industry,
      campaignGoal: data?.campaignGoal,
      adPlatform: data?.adPlatform,
    });
  });
