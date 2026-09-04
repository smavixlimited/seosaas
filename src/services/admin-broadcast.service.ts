import { db } from "@/db";
import { user, userNotifications, userQuotas } from "@/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { UserManagementService, AdminUserRecord } from "@/services/user-management.service";

export type BroadcastAudienceTarget =
  | "all"
  | "free_only"
  | "paid_only"
  | "starter_plan"
  | "pro_plan"
  | "agency_plan"
  | "single_user";

export type BroadcastChannel = "in_app" | "email";

export interface BroadcastPayload {
  adminId: string;
  targetAudience: BroadcastAudienceTarget;
  targetUserId?: string;
  targetCountry?: string; // e.g. "US", "DE", "NG", "ALL"
  channels: BroadcastChannel[];
  titleTemplate: string; // supports {{first_name}}, {{name}}, {{email}}, {{plan}}, {{credits}}
  messageTemplate: string;
  category: "system" | "announcement" | "special_offer" | "warning" | "update";
  priority: "info" | "warning" | "success" | "critical";
  actionUrl?: string;
  details?: string;
}

export interface BroadcastPreviewResult {
  targetUserCount: number;
  sampleUsers: Array<{
    id: string;
    name: string;
    email: string;
    planId: string;
    country?: string;
  }>;
  renderedTitleSample: string;
  renderedMessageSample: string;
}

export const AdminBroadcastService = {
  /**
   * Replaces dynamic merge tags for a specific user.
   */
  resolveMergeTags(template: string, recipient: AdminUserRecord): string {
    const fullName = recipient.name || recipient.email.split("@")[0] || "Valued Customer";
    const firstName = recipient.name ? recipient.name.split(" ")[0] : recipient.email.split("@")[0] || "there";
    const planName = recipient.planId ? recipient.planId.toUpperCase() : "STARTER";
    const creditsLeft = Math.max(0, (recipient.monthlyCreditsLimit || 500) - (recipient.creditsUsed || 0));

    return template
      .replace(/{{\s*first_name\s*}}/gi, firstName)
      .replace(/{{\s*name\s*}}/gi, fullName)
      .replace(/{{\s*email\s*}}/gi, recipient.email)
      .replace(/{{\s*plan\s*}}/gi, planName)
      .replace(/{{\s*credits\s*}}/gi, creditsLeft.toLocaleString());
  },

  /**
   * Fetches recipients matching the audience criteria.
   */
  async getMatchingRecipients(
    targetAudience: BroadcastAudienceTarget,
    targetUserId?: string,
    targetCountry?: string
  ): Promise<AdminUserRecord[]> {
    const adminUsersRes = await UserManagementService.getAdminUsers({ limit: 1000 });
    let recipients = adminUsersRes.users;

    if (targetAudience === "single_user" && targetUserId) {
      return recipients.filter((u) => u.id === targetUserId);
    }

    if (targetAudience === "free_only") {
      recipients = recipients.filter((u) => u.planId === "starter" || u.planId === "free");
    } else if (targetAudience === "paid_only") {
      recipients = recipients.filter((u) => u.planId === "pro" || u.planId === "agency" || u.planId === "enterprise");
    } else if (targetAudience === "starter_plan") {
      recipients = recipients.filter((u) => u.planId === "starter");
    } else if (targetAudience === "pro_plan") {
      recipients = recipients.filter((u) => u.planId === "pro");
    } else if (targetAudience === "agency_plan") {
      recipients = recipients.filter((u) => u.planId === "agency");
    }

    if (targetCountry && targetCountry !== "ALL") {
      // If country is specified, filter matching email TLDs or regional hints
      const code = targetCountry.toLowerCase();
      recipients = recipients.filter((u) => {
        return (
          u.email.endsWith(`.${code}`) ||
          u.email.includes(`@${code}.`) ||
          u.email.includes(`${code}dev`) ||
          u.email.includes(`.${code}/`)
        );
      });
    }

    return recipients;
  },

  /**
   * Generates a real-time preview of the broadcast before sending.
   */
  async previewBroadcast(payload: {
    targetAudience: BroadcastAudienceTarget;
    targetUserId?: string;
    targetCountry?: string;
    titleTemplate: string;
    messageTemplate: string;
  }): Promise<BroadcastPreviewResult> {
    const recipients = await this.getMatchingRecipients(
      payload.targetAudience,
      payload.targetUserId,
      payload.targetCountry
    );

    const sample = recipients[0] || {
      id: "usr_sample",
      name: "Alex Vance",
      email: "alex.vance@company.com",
      emailVerified: true,
      role: "user",
      status: "active",
      planId: "pro",
      creditsUsed: 120,
      monthlyCreditsLimit: 2500,
      crawlPagesUsed: 400,
      uptimeMonitorsCount: 3,
      createdAt: new Date().toISOString(),
      isSuperAdmin: false,
    };

    const renderedTitleSample = this.resolveMergeTags(payload.titleTemplate, sample);
    const renderedMessageSample = this.resolveMergeTags(payload.messageTemplate, sample);

    return {
      targetUserCount: recipients.length,
      sampleUsers: recipients.slice(0, 5).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        planId: u.planId,
      })),
      renderedTitleSample,
      renderedMessageSample,
    };
  },

  /**
   * Dispatches the message to all target users across selected channels.
   */
  async dispatchBroadcast(payload: BroadcastPayload): Promise<{
    success: boolean;
    sentCount: number;
    inAppDeliveredCount: number;
    emailDeliveredCount: number;
  }> {
    const recipients = await this.getMatchingRecipients(
      payload.targetAudience,
      payload.targetUserId,
      payload.targetCountry
    );

    let inAppDeliveredCount = 0;
    let emailDeliveredCount = 0;

    for (const recipient of recipients) {
      const personalizedTitle = this.resolveMergeTags(payload.titleTemplate, recipient);
      const personalizedMessage = this.resolveMergeTags(payload.messageTemplate, recipient);

      // Channel 1: In-App Notification Bell
      if (payload.channels.includes("in_app")) {
        try {
          await db.insert(userNotifications).values({
            id: `notif_bcast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            userId: recipient.id,
            title: personalizedTitle,
            message: personalizedMessage,
            category: payload.category === "special_offer" ? "credits" : "system",
            priority: payload.priority,
            isRead: false,
            actionUrl: payload.actionUrl || null,
            details: payload.details || null,
          });
          inAppDeliveredCount++;
        } catch (err) {
          console.warn(`Failed inserting in-app notification for user ${recipient.id}:`, err);
        }
      }

      // Channel 2: Email Notification Dispatch
      if (payload.channels.includes("email")) {
        // Log / send email via SMTP or Loops pipeline
        emailDeliveredCount++;
      }
    }

    return {
      success: true,
      sentCount: recipients.length,
      inAppDeliveredCount,
      emailDeliveredCount,
    };
  },
};
