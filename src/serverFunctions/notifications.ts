import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { NotificationsService } from "@/services/notifications.service";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

const emptySchema = z.object({}).passthrough().optional();

export const listNotificationsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(emptySchema)
  .handler(async ({ context }) => {
    return await NotificationsService.listNotifications(context.userId);
  });

export const markNotificationReadServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      notificationId: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    return await NotificationsService.markAsRead(
      context.userId,
      data.notificationId,
    );
  });

export const markAllNotificationsReadServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator(emptySchema)
  .handler(async ({ context }) => {
    return await NotificationsService.markAllAsRead(context.userId);
  });

export const clearNotificationsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(emptySchema)
  .handler(async ({ context }) => {
    return await NotificationsService.clearNotifications(context.userId);
  });
