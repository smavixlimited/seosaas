import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getUserUptimeMonitors,
  addUptimeMonitor,
  updateMonitorReminderSettings,
  deleteUptimeMonitor,
  probeUptimeMonitor,
  checkAndSendMonitoringReminders,
} from "@/services/uptime.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getUptimeMonitorsServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return getUserUptimeMonitors(context.userId);
  });

const frequencyEnum = z.enum(["all", "weekly", "ssl_expiry", "domain_expiry", "both", "none"]);

const addMonitorSchema = z.object({
  url: z.string().min(3),
  projectId: z.string().optional().nullable(),
  reminderFrequency: frequencyEnum.optional(),
  reminderEmail: z.string().email().optional().nullable().or(z.literal("")),
});

export const addUptimeMonitorServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => addMonitorSchema.parse(d))
  .handler(async ({ data, context }) => {
    return addUptimeMonitor(context.userId, data);
  });

const updateReminderSchema = z.object({
  monitorId: z.string(),
  reminderFrequency: frequencyEnum,
  reminderEmail: z.string().email().optional().nullable().or(z.literal("")),
});

export const updateMonitorReminderServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => updateReminderSchema.parse(d))
  .handler(async ({ data, context }) => {
    return updateMonitorReminderSettings(context.userId, data.monitorId, {
      reminderFrequency: data.reminderFrequency,
      reminderEmail: data.reminderEmail,
    });
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

export const triggerMonitoringCheckServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async () => {
    return checkAndSendMonitoringReminders();
  });

export const triggerSslExpiryCheckServerFn = triggerMonitoringCheckServerFn;

