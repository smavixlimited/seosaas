import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getUserUptimeMonitors,
  addUptimeMonitor,
  deleteUptimeMonitor,
  probeUptimeMonitor,
} from "@/services/uptime.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getUptimeMonitorsServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return getUserUptimeMonitors(context.userId);
  });

const addMonitorSchema = z.object({
  url: z.string().min(3),
  projectId: z.string().optional().nullable(),
});

export const addUptimeMonitorServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => addMonitorSchema.parse(d))
  .handler(async ({ data, context }) => {
    return addUptimeMonitor(context.userId, data);
  });

const monitorIdSchema = z.object({
  monitorId: z.string(),
});

export const deleteUptimeMonitorServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => monitorIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    return deleteUptimeMonitor(context.userId, data.monitorId);
  });

export const probeUptimeMonitorServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => monitorIdSchema.parse(d))
  .handler(async ({ data }) => {
    return probeUptimeMonitor(data.monitorId);
  });
