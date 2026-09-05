import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { WeeklyDigestService } from "@/services/weekly-digest.service";

/**
 * Dispatches a test/on-demand weekly performance digest to the current user's email.
 */
export const triggerWeeklyDigestServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return WeeklyDigestService.sendDigestToUser(
      context.userId,
      context.userEmail,
    );
  });

/**
 * Retrieves the preview data and metrics that will appear in the next weekly digest.
 */
export const getWeeklyDigestPreviewServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return WeeklyDigestService.computeUserDigestMetrics(
      context.userId,
      context.userEmail,
    );
  });
