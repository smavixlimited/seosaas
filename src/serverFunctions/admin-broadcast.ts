import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { AdminBroadcastService, BroadcastAudienceTarget, BroadcastChannel } from "@/services/admin-broadcast.service";
import { AppError } from "@/server/lib/errors";

const audienceEnum = z.enum([
  "all",
  "free_only",
  "paid_only",
  "starter_plan",
  "pro_plan",
  "agency_plan",
  "single_user",
]);

const channelEnum = z.enum(["in_app", "email"]);

const previewBroadcastSchema = z.object({
  targetAudience: audienceEnum,
  targetUserId: z.string().optional(),
  targetCountry: z.string().optional(),
  titleTemplate: z.string().min(1),
  messageTemplate: z.string().min(1),
});

const sendBroadcastSchema = z.object({
  targetAudience: audienceEnum,
  targetUserId: z.string().optional(),
  targetCountry: z.string().optional(),
  channels: z.array(channelEnum).min(1),
  titleTemplate: z.string().min(1).max(200),
  messageTemplate: z.string().min(1).max(5000),
  category: z.enum(["system", "announcement", "special_offer", "warning", "update"]),
  priority: z.enum(["info", "warning", "success", "critical"]),
  actionUrl: z.string().optional(),
  details: z.string().optional(),
});

export const previewAdminBroadcastServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(previewBroadcastSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return AdminBroadcastService.previewBroadcast(data);
  });

export const sendAdminBroadcastServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(sendBroadcastSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return AdminBroadcastService.dispatchBroadcast({
      ...data,
      adminId: context.userId,
    });
  });
