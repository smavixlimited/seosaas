import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { ConversionAdReadinessService } from "@/services/conversion-ad-readiness.service";

const conversionQuerySchema = z.object({
  targetUrl: z.string().optional(),
});

const runAuditSchema = z.object({
  targetUrl: z.string().min(1),
});

/**
 * Retrieves Conversion & Ad Readiness Scorecard for a project.
 */
export const getConversionReadiness = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(conversionQuerySchema)
  .handler(async ({ data, context }) => {
    const domain = context.project.domain || "yourdomain.com";
    const targetUrl =
      data?.targetUrl ||
      (domain.startsWith("http") ? domain : `https://${domain}`);

    return ConversionAdReadinessService.getConversionAudit(
      context.projectId,
      targetUrl,
      domain,
    );
  });

/**
 * Runs a fresh Conversion & Ad Readiness Audit.
 */
export const runConversionReadinessAudit = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(runAuditSchema)
  .handler(async ({ data, context }) => {
    const domain = context.project.domain || "yourdomain.com";

    return ConversionAdReadinessService.runConversionAudit(
      context.projectId,
      data.targetUrl,
      domain,
    );
  });
