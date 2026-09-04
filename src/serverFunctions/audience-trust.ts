import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "./middleware";
import { AudienceTrustService } from "@/services/audience-trust.service";

export const getAudienceTrustAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(z.object({}).optional())
  .handler(async ({ context }) => {
    return AudienceTrustService.getTrustAudit(context.projectId);
  });

export const runAudienceTrustAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(z.object({}).optional())
  .handler(async ({ context }) => {
    return AudienceTrustService.runTrustAudit(context.projectId);
  });
