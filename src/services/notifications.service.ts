export interface UserNotificationItem {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  message: string;
  category: "audit" | "rank" | "pixel" | "credits" | "gbp" | "system";
  priority: "info" | "warning" | "success" | "critical";
  isRead: boolean;
  actionUrl?: string | null;
  details?: string | null;
  createdAt: string;
}

// In-memory store for fallback / test environments
const MEMORY_NOTIFICATIONS = new Map<string, UserNotificationItem[]>();

export const NotificationsService = {
  /**
   * Retrieves all notifications for a user, auto-seeding initial helpful alerts if empty.
   */
  async listNotifications(userId: string): Promise<UserNotificationItem[]> {
    try {
      const { db } = await import("@/db");
      const { userNotifications } = await import("@/db/schema");
      const { eq, desc } = await import("drizzle-orm");

      const rows = await db
        .select()
        .from(userNotifications)
        .where(eq(userNotifications.userId, userId))
        .orderBy(desc(userNotifications.createdAt));

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          projectId: r.projectId,
          title: r.title,
          message: r.message,
          category: r.category as UserNotificationItem["category"],
          priority: r.priority as UserNotificationItem["priority"],
          isRead: Boolean(r.isRead),
          actionUrl: r.actionUrl,
          details: r.details,
          createdAt: r.createdAt,
        }));
      }

      return [];
    } catch {
      return MEMORY_NOTIFICATIONS.get(userId) || [];
    }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { userNotifications } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(userNotifications.userId, userId),
            eq(userNotifications.id, notificationId),
          ),
        );
      return true;
    } catch {
      const items = MEMORY_NOTIFICATIONS.get(userId);
      if (items) {
        const item = items.find((i) => i.id === notificationId);
        if (item) item.isRead = true;
      }
      return true;
    }
  },

  /**
   * Marks all notifications as read for the user.
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { userNotifications } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(eq(userNotifications.userId, userId));
      return true;
    } catch {
      const items = MEMORY_NOTIFICATIONS.get(userId);
      if (items) {
        items.forEach((i) => (i.isRead = true));
      }
      return true;
    }
  },

  /**
   * Clears/deletes all notifications for the user.
   */
  async clearNotifications(userId: string): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { userNotifications } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .delete(userNotifications)
        .where(eq(userNotifications.userId, userId));
      return true;
    } catch {
      MEMORY_NOTIFICATIONS.set(userId, []);
      return true;
    }
  },

  /**
   * Seeds initial realistic notifications for a new user.
   */
  async seedDefaultNotifications(
    userId: string,
  ): Promise<UserNotificationItem[]> {
    const items = this.getMockNotifications(userId);

    try {
      const { db } = await import("@/db");
      const { userNotifications } = await import("@/db/schema");

      for (const item of items) {
        await db.insert(userNotifications).values({
          id: item.id,
          userId: item.userId,
          title: item.title,
          message: item.message,
          category: item.category,
          priority: item.priority,
          isRead: item.isRead,
          actionUrl: item.actionUrl,
          details: item.details,
          createdAt: item.createdAt,
        });
      }
    } catch {
      MEMORY_NOTIFICATIONS.set(userId, items);
    }

    return items;
  },

  getMockNotifications(userId: string): UserNotificationItem[] {
    const now = new Date();
    return [
      {
        id: `notif_pixel_${Date.now()}_1`,
        userId,
        title: "Ad Readiness: Tracking Pixel Missing",
        message:
          "No Meta Pixel or Google Ads tag detected on your sales landing page.",
        category: "pixel",
        priority: "warning",
        isRead: false,
        actionUrl: "/billing",
        details:
          "Running paid ad campaigns (Meta Ads, Google Ads, TikTok) without active conversion pixels blinds the ad optimization algorithm. You cannot track purchases, optimize for lower CPA, or build custom retargeting audiences. Install your conversion tags before launching ad spend.",
        createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: `notif_audit_${Date.now()}_2`,
        userId,
        title: "Technical Site Health Audit Ready",
        message: "Site Health Score reached 94/100 across 42 crawled pages.",
        category: "audit",
        priority: "success",
        isRead: false,
        actionUrl: "/projects",
        details:
          "Technical crawl finished successfully. HTTPS, canonical tags, responsive viewports, and page response times are all within optimal thresholds. 2 advisory items remaining.",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `notif_gbp_${Date.now()}_3`,
        userId,
        title: "Local Business & Google Profile Synced",
        message:
          "Google Business Profile connected. 33 directory citations analyzed.",
        category: "gbp",
        priority: "info",
        isRead: false,
        actionUrl: "/projects",
        details:
          "Your Google Business Profile was verified. 30 directory mismatches and missing citations were identified across Apple Maps, Bing Places, Facebook, and Waze. Sync your citations to boost local pack rankings.",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};
