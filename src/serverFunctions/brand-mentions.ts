import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { BrandMentionsService } from "@/services/brand-mentions.service";

const brandMentionsQuerySchema = z.object({}).optional();

const generatePitchSchema = z.object({
  mentionId: z.string().min(1),
});

const updateClaimStatusSchema = z.object({
  mentionId: z.string().min(1),
  claimStatus: z.enum(["unclaimed", "pitch_generated", "outreach_sent", "claimed", "ignored"]),
});

/**
 * Fetch all brand mentions and listening metrics for a project.
 */
export const getBrandMentionsHub = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(brandMentionsQuerySchema)
  .handler(async ({ context }) => {
    const brandName = context.project.name || "YourBrand";
    const brandUrl = context.project.domain ? `https://${context.project.domain}` : "https://yourbrand.com";

    const mentions = await BrandMentionsService.getBrandMentions(
      context.projectId,
      brandName,
      brandUrl
    );

    const metrics = await BrandMentionsService.getListeningMetrics(
      context.projectId,
      brandName,
      context.project.domain || undefined
    );

    return {
      mentions,
      metrics,
    };
  });

/**
 * 1-Click Backlink Claim Pitch Generator: Generates personalized outreach pitch.
 */
export const generateMentionPitch = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(generatePitchSchema)
  .handler(async ({ data }) => {
    return BrandMentionsService.generateClaimPitch(data.mentionId);
  });

/**
 * Update mention claim lifecycle status.
 */
export const updateMentionClaimStatus = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(updateClaimStatusSchema)
  .handler(async ({ data }) => {
    return BrandMentionsService.updateClaimStatus(data.mentionId, data.claimStatus);
  });

/**
 * Retrieves AEO sentiment and entity citation presence.
 */
export const getAeoSentiment = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(brandMentionsQuerySchema)
  .handler(async ({ context }) => {
    const brandName = context.project.name || "YourBrand";
    const domain = context.project.domain || "yourbrand.com";

    return BrandMentionsService.getAeoSentimentReport(
      context.projectId,
      brandName,
      domain
    );
  });

/**
 * Forces fresh multi-engine AI search sentiment scan.
 */
export const refreshAeoSentimentScan = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(brandMentionsQuerySchema)
  .handler(async ({ context }) => {
    const brandName = context.project.name || "YourBrand";
    const domain = context.project.domain || "yourbrand.com";

    return BrandMentionsService.refreshAeoSentimentScan(
      context.projectId,
      brandName,
      domain
    );
  });
