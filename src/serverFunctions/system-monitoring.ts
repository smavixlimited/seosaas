import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { SystemMonitoringService } from "@/services/system-monitoring.service";
import { AppError } from "@/server/lib/errors";

const filterWebhooksSchema = z.object({
  provider: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

const webhookActionSchema = z.object({
  id: z.string().min(1),
});

/**
 * Superadmin server function to fetch live dependency latencies and runtime KPIs.
 */
export const getLiveSystemMonitoringServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    const probes = await SystemMonitoringService.runLiveDependencyProbes();
    const kpis = SystemMonitoringService.getSystemKpis();

    return {
      probes,
      kpis,
    };
  });

/**
 * Superadmin server function to retrieve webhook error logs.
 */
export const getWebhookErrorLogsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(filterWebhooksSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SystemMonitoringService.getWebhookErrorLogs(data);
  });

/**
 * Superadmin server function to retry a failed webhook.
 */
export const retryWebhookDeliveryServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(webhookActionSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SystemMonitoringService.retryWebhook(data.id, context.userId, context.userEmail);
  });

/**
 * Superadmin server function to mark a webhook error as resolved.
 */
export const resolveWebhookErrorServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(webhookActionSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SystemMonitoringService.resolveWebhook(data.id, context.userId, context.userEmail);
  });
