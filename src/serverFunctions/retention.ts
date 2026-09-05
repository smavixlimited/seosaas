import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { RetentionService } from "@/services/retention.service";

const cancellationSchema = z.object({
  planId: z.string().min(1),
  reason: z.string().min(1),
  feedback: z.string().optional(),
  acceptRetentionDiscount: z.boolean().optional(),
});

/**
 * Returns real-time user credit usage meter and depletion state for the topbar.
 */
export const getUserCreditUsageServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return RetentionService.getUserCreditUsage(context.userId);
  });

/**
 * Submits cancellation exit survey and handles 30% retention discount opt-in.
 */
export const submitCancellationSurveyServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator(cancellationSchema)
  .handler(async ({ data, context }) => {
    return RetentionService.processCancellationSurvey({
      userId: context.userId,
      userEmail: context.userEmail,
      planId: data.planId,
      reason: data.reason,
      feedback: data.feedback,
      acceptRetentionDiscount: data.acceptRetentionDiscount,
    });
  });

/**
 * Checks if user has an active retention discount.
 */
export const getRetentionDiscountStatusServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return RetentionService.hasActiveDiscount(context.userId);
  });
