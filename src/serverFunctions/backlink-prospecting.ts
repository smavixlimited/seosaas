import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import {
  BacklinkProspectingService,
  type OutreachAngleCategory,
} from "@/services/backlink-prospecting.service";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";

const getProspectsInputSchema = z.object({
  projectId: z.string().min(1),
  refresh: z.boolean().optional(),
  countryCode: z.string().optional(),
});

const generatePitchInputSchema = z.object({
  projectId: z.string().min(1),
  prospectId: z.string().optional(),
  prospectDomain: z.string().min(1),
  prospectName: z.string().optional(),
  angle: z
    .enum([
      "resource_inclusion",
      "competitor_alternative",
      "expert_quote",
      "broken_link",
      "guest_post",
    ])
    .optional(),
  customNotes: z.string().optional(),
});

const updateProspectInputSchema = z.object({
  projectId: z.string().min(1),
  prospectId: z.string().min(1),
  status: z
    .enum(["suggested", "contacted", "responded", "won", "dismissed"])
    .optional(),
  contactEmail: z.string().optional(),
  notes: z.string().optional(),
});

const deleteProspectInputSchema = z.object({
  projectId: z.string().min(1),
  prospectId: z.string().min(1),
});

/**
 * Fetch or auto-discover top high-authority backlink prospects for the project.
 */
export const getBacklinkProspects = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(getProspectsInputSchema)
  .handler(async ({ data }) => {
    return BacklinkProspectingService.getOrDiscoverProspects(data.projectId, {
      refresh: data.refresh,
      countryCode: data.countryCode,
    });
  });

/**
 * Generate high-converting AI pitch & outreach sequence.
 */
export const generateOutreachPitch = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(generatePitchInputSchema)
  .handler(async ({ data, context }) => {
    // Feature gating / credit enforcement
    await PlanEntitlementService.assertFeatureAccess(
      context.userId,
      "competitor_analysis",
    );

    return BacklinkProspectingService.generateOutreachPitch(data.projectId, {
      prospectId: data.prospectId,
      prospectDomain: data.prospectDomain,
      prospectName: data.prospectName,
      angle: data.angle as OutreachAngleCategory | undefined,
      customNotes: data.customNotes,
    });
  });

/**
 * Update prospect status, contact email or outreach notes.
 */
export const updateProspectStatus = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateProspectInputSchema)
  .handler(async ({ data }) => {
    return BacklinkProspectingService.updateProspectStatus(
      data.projectId,
      data.prospectId,
      {
        status: data.status,
        contactEmail: data.contactEmail,
        notes: data.notes,
      },
    );
  });

/**
 * Delete a backlink prospect.
 */
export const deleteProspect = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(deleteProspectInputSchema)
  .handler(async ({ data }) => {
    return BacklinkProspectingService.deleteProspect(
      data.projectId,
      data.prospectId,
    );
  });
