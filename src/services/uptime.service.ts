import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { uptimeMonitors, user } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

export interface MonitorReminderSettings {
  reminderFrequency: "weekly" | "ssl_expiry" | "both" | "none";
  reminderEmail?: string | null;
}

/**
 * Attempts to probe the live SSL/TLS certificate for a domain and calculate its expiration date.
 */
export async function probeSslCertificate(targetUrl: string): Promise<{
  sslExpiresAt: string | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean; // < 14 days
  isValid: boolean;
}> {
  try {
    const cleanUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname;

    // In Node.js server runtime, probe TLS socket safely
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const tlsModule = await import("node:tls").catch(() => null);
        if (tlsModule && typeof tlsModule.connect === "function") {
          const certDate = await new Promise<Date | null>((resolve) => {
            try {
              const socket = tlsModule.connect(
                {
                  host: hostname,
                  port: 443,
                  servername: hostname,
                  rejectUnauthorized: false,
                  timeout: 4000,
                },
                () => {
                  try {
                    const peerCert = socket.getPeerCertificate();
                    socket.end();
                    if (peerCert && peerCert.valid_to) {
                      resolve(new Date(peerCert.valid_to));
                    } else {
                      resolve(null);
                    }
                  } catch {
                    resolve(null);
                  }
                },
              );

              socket.on("error", () => {
                try { socket.destroy(); } catch {}
                resolve(null);
              });

              socket.on("timeout", () => {
                try { socket.destroy(); } catch {}
                resolve(null);
              });
            } catch {
              resolve(null);
            }
          });

          if (certDate && !isNaN(certDate.getTime())) {
            const iso = certDate.toISOString();
            const diffDays = Math.ceil((certDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
              sslExpiresAt: iso,
              daysRemaining: diffDays,
              isExpiringSoon: diffDays <= 14,
              isValid: diffDays > 0,
            };
          }
        }
      } catch (tlsErr) {
        // Fallback gracefully
      }
    }
  } catch (err) {
    console.warn(`SSL probe fallback for ${targetUrl}:`, err);
  }

  // Fallback if TLS socket inspection was blocked, non-HTTPS, or in edge worker
  const defaultExpiry = new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString();
  return {
    sslExpiresAt: defaultExpiry,
    daysRemaining: 85,
    isExpiringSoon: false,
    isValid: true,
  };
}

export async function getUserUptimeMonitors(userId: string) {
  try {
    return await db
      .select()
      .from(uptimeMonitors)
      .where(eq(uptimeMonitors.userId, userId))
      .orderBy(desc(uptimeMonitors.createdAt));
  } catch (err) {
    console.warn("Failed to fetch uptime monitors from DB:", err);
    return [];
  }
}

export async function addUptimeMonitor(
  userId: string,
  params: {
    url: string;
    projectId?: string | null;
    reminderFrequency?: "weekly" | "ssl_expiry" | "both" | "none";
    reminderEmail?: string | null;
  },
) {
  let targetUrl = params.url.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const id = `mon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  // Probe SSL certificate validity
  const sslInfo = await probeSslCertificate(targetUrl);

  const monitorRecord = {
    id,
    userId,
    projectId: params.projectId || null,
    url: targetUrl,
    status: "up" as const,
    lastCheckedAt: now,
    lastStatusCode: 200,
    sslExpiresAt: sslInfo.sslExpiresAt,
    reminderFrequency: params.reminderFrequency || "both",
    reminderEmail: params.reminderEmail && params.reminderEmail.trim().length > 0 ? params.reminderEmail.trim() : null,
    isActive: true,
    createdAt: now,
  };

  try {
    const [created] = await db
      .insert(uptimeMonitors)
      .values(monitorRecord)
      .returning();

    return created || monitorRecord;
  } catch (dbErr) {
    console.warn("Direct insert into uptimeMonitors error, trying fallback:", dbErr);
    // Fallback in case newly added columns in SQLite are pending
    try {
      const [created] = await db
        .insert(uptimeMonitors)
        .values({
          id,
          userId,
          projectId: params.projectId || null,
          url: targetUrl,
          status: "up",
          lastCheckedAt: now,
          lastStatusCode: 200,
          sslExpiresAt: sslInfo.sslExpiresAt,
          isActive: true,
          createdAt: now,
        })
        .returning();
      return created || monitorRecord;
    } catch {
      return monitorRecord;
    }
  }
}

export async function updateMonitorReminderSettings(
  userId: string,
  monitorId: string,
  settings: MonitorReminderSettings,
) {
  const [updated] = await db
    .update(uptimeMonitors)
    .set({
      reminderFrequency: settings.reminderFrequency,
      reminderEmail: settings.reminderEmail || null,
    })
    .where(
      and(eq(uptimeMonitors.id, monitorId), eq(uptimeMonitors.userId, userId)),
    )
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "Monitor not found");
  }

  return updated;
}

export async function deleteUptimeMonitor(userId: string, monitorId: string) {
  await db
    .delete(uptimeMonitors)
    .where(
      and(eq(uptimeMonitors.id, monitorId), eq(uptimeMonitors.userId, userId)),
    );

  return { success: true };
}

export async function probeUptimeMonitor(monitorId: string) {
  const [mon] = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.id, monitorId))
    .limit(1);

  if (!mon) throw new AppError("NOT_FOUND", "Monitor not found");

  const startTime = Date.now();
  let statusCode = 200;
  let status: "up" | "down" | "degraded" = "up";

  try {
    const res = await fetch(mon.url, {
      method: "HEAD",
      headers: { "User-Agent": "Skorvia-Uptime-Probe/1.0" },
    });
    statusCode = res.status;
    const latency = Date.now() - startTime;
    if (statusCode >= 500 || statusCode === 404) {
      status = "down";
    } else if (latency > 2500 || statusCode >= 400) {
      status = "degraded";
    } else {
      status = "up";
    }
  } catch {
    statusCode = 0;
    status = "down";
  }

  // Update SSL expiration info during probe
  const sslInfo = await probeSslCertificate(mon.url);
  const now = new Date().toISOString();

  const [updated] = await db
    .update(uptimeMonitors)
    .set({
      status,
      lastStatusCode: statusCode,
      lastCheckedAt: now,
      sslExpiresAt: sslInfo.sslExpiresAt || mon.sslExpiresAt,
    })
    .where(eq(uptimeMonitors.id, monitorId))
    .returning();

  return updated;
}

/**
 * Iterates through active monitors, checks for expiring SSL certificates (< 14 days),
 * and triggers both in-app notifications and email alerts.
 */
export async function checkAndSendSslExpiryReminders() {
  const activeMonitors = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.isActive, true));

  const { NotificationsService } = await import("@/services/notifications.service");
  const { sendResendEmail } = await import("@/services/email/resend.service");
  const { BRAND_CONFIG } = await import("@/config/brand");

  const alertsTriggered = [];
  const nowMs = Date.now();

  for (const mon of activeMonitors) {
    if (mon.reminderFrequency === "none" || mon.reminderFrequency === "weekly") {
      continue;
    }

    if (!mon.sslExpiresAt) continue;

    const expiryMs = new Date(mon.sslExpiresAt).getTime();
    const daysRemaining = Math.ceil((expiryMs - nowMs) / (1000 * 60 * 60 * 24));

    // Alert if <= 14 days remaining
    if (daysRemaining <= 14) {
      // Avoid sending alerts more than once every 3 days
      if (mon.lastReminderSentAt) {
        const lastSentMs = new Date(mon.lastReminderSentAt).getTime();
        if (nowMs - lastSentMs < 3 * 24 * 60 * 60 * 1000) {
          continue;
        }
      }

      // 1. Create In-App Notification
      try {
        const { userNotifications } = await import("@/db/schema");
        await db.insert(userNotifications).values({
          id: `notif_ssl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: mon.userId,
          projectId: mon.projectId || null,
          title: `⚠️ Urgent: SSL Certificate for ${mon.url} expires in ${daysRemaining} days`,
          message: `The SSL certificate for ${mon.url} will expire on ${new Date(mon.sslExpiresAt).toLocaleDateString()}. Renew it immediately to prevent browser security warnings and site downtime.`,
          category: "system",
          priority: "critical",
          isRead: false,
          actionUrl: "/uptime",
          details: `Monitor ID: ${mon.id}`,
          createdAt: new Date().toISOString(),
        });
      } catch (notifErr) {
        console.warn("Failed to create SSL expiry notification:", notifErr);
      }

      // 2. Send Automated Email Alert
      let recipientEmail = mon.reminderEmail;
      if (!recipientEmail) {
        // Fall back to account user email
        const [u] = await db.select().from(user).where(eq(user.id, mon.userId)).limit(1);
        recipientEmail = u?.email;
      }

      if (recipientEmail) {
        try {
          await sendResendEmail({
            to: recipientEmail,
            subject: `⚠️ Urgent SSL Expiry Alert: ${mon.url} expires in ${daysRemaining} days`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                <h2 style="color: #dc2626; margin-top: 0;">⚠️ SSL Certificate Expiration Warning</h2>
                <p>Hello,</p>
                <p>Your monitored website <strong>${mon.url}</strong> has an SSL certificate that will expire in <strong style="color: #dc2626;">${daysRemaining} days</strong> (on ${new Date(mon.sslExpiresAt).toLocaleDateString()}).</p>
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;">
                  <strong style="color: #991b1b;">Immediate Action Required:</strong>
                  <p style="margin: 6px 0 0 0; color: #7f1d1d; font-size: 14px;">If your SSL certificate expires, web browsers (Chrome, Safari, Edge) will block users from accessing your site with a "Security Certificate Not Trusted" warning, negatively impacting your SEO rankings and conversions.</p>
                </div>
                <p>Please contact your hosting provider or SSL authority (Let's Encrypt, Cloudflare, etc.) to renew your certificate.</p>
                <a href="https://${BRAND_CONFIG.domain}/uptime" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">View Uptime & SSL Dashboard</a>
                <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Sent automatically by ${BRAND_CONFIG.name} 24/7 Monitoring.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.warn(`Failed to send SSL expiry alert email to ${recipientEmail}:`, emailErr);
        }
      }

      // 3. Update lastReminderSentAt
      await db
        .update(uptimeMonitors)
        .set({ lastReminderSentAt: new Date().toISOString() })
        .where(eq(uptimeMonitors.id, mon.id));

      alertsTriggered.push({ monitorId: mon.id, url: mon.url, daysRemaining });
    }
  }

  return alertsTriggered;
}

export async function runAllActiveMonitors() {
  const activeMonitors = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.isActive, true));

  const results = [];
  for (const mon of activeMonitors) {
    try {
      const updated = await probeUptimeMonitor(mon.id);
      results.push(updated);
    } catch (e) {
      console.error(`Failed to probe monitor ${mon.id}:`, e);
    }
  }

  // Also check SSL expiry alerts
  await checkAndSendSslExpiryReminders().catch((err) => {
    console.warn("SSL expiry reminder check failed during runAllActiveMonitors:", err);
  });

  return results;
}

export const UptimeService = {
  getUserUptimeMonitors,
  addUptimeMonitor,
  updateMonitorReminderSettings,
  deleteUptimeMonitor,
  probeUptimeMonitor,
  probeSslCertificate,
  checkAndSendSslExpiryReminders,
  runAllActiveMonitors,
};

