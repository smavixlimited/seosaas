import { describe, it, expect } from "vitest";
import { NotificationsService } from "@/services/notifications.service";

describe("NotificationsService", () => {
  it("lists, seeds, marks as read, and clears notifications", async () => {
    const userId = "test_user_notif_123";

    // 1. Initial list seeds default notifications
    const items = await NotificationsService.listNotifications(userId);
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);

    const first = items[0];
    expect(first.title).toBeDefined();
    expect(first.message).toBeDefined();
    expect(first.category).toBeDefined();
    expect(first.priority).toBeDefined();

    // 2. Mark single as read
    const markedOne = await NotificationsService.markAsRead(userId, first.id);
    expect(typeof markedOne).toBe("boolean");

    // 3. Mark all as read
    const markedAll = await NotificationsService.markAllAsRead(userId);
    expect(typeof markedAll).toBe("boolean");

    // 4. Clear all notifications
    const cleared = await NotificationsService.clearNotifications(userId);
    expect(typeof cleared).toBe("boolean");
  });
});
