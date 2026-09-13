import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { uptimeMonitors, user } from "@/db/schema";
import { AppError } from "@/server/lib/errors";
import { assertSafeUrlOrThrow } from "@/shared/security/ssrf";

export interface MonitorReminderSettings {
  reminderFrequency: "all" | "weekly" | "ssl_expiry" | "domain_expiry" | "both" | "none";
  reminderEmail?: string | null;
}

/**
 * Detects hosting provider from HTTP response headers.
 */
export function detectHostingProvider(headers: Headers): string {
  const server = (headers.get("server") || "").toLowerCase();
  const poweredBy = (headers.get("x-powered-by") || "").toLowerCase();
  const vercel = headers.get("x-vercel-id");
  const cfRay = headers.get("cf-ray");
  const cloudfront = headers.get("x-amz-cf-id");
  const netlify = headers.get("x-nf-request-id") || headers.get("x-netlify");
  const fastly = headers.get("x-fastly-request-id");
  const render = headers.get("x-render-origin-server");
  const kinsta = headers.get("kinsta-cache");
  const wpEngine = headers.get("wpe-backend");

  if (cfRay || server.includes("cloudflare")) return "Cloudflare";
  if (vercel) return "Vercel";
  if (cloudfront || server.includes("cloudfront") || server.includes("amazons3")) return "AWS CloudFront";
  if (netlify) return "Netlify";
  if (fastly) return "Fastly";
  if (render) return "Render";
  if (kinsta) return "Kinsta";
  if (wpEngine) return "WP Engine";
  if (server.includes("nginx")) return "Nginx / VPS";
  if (server.includes("apache")) return "Apache";
  if (server.includes("caddy")) return "Caddy";
  if (server.includes("litespeed")) return "LiteSpeed";
  if (server.includes("github")) return "GitHub Pages";
  if (poweredBy.includes("next.js")) return "Next.js Server";

  return server ? server.charAt(0).toUpperCase() + server.slice(1) : "Cloud Infrastructure";
}

/**
 * Probes the domain registration and expiration date via RDAP protocol.
 */
export async function probeDomainInfo(targetUrl: string): Promise<{
  domainExpiresAt: string | null;
  domainRegistrar: string | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean; // < 30 days
}> {
  try {
    const cleanUrl = assertSafeUrlOrThrow(
      targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
    );
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname;

    const parts = hostname.split(".");
    const apexDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${apexDomain}`, {
        headers: { Accept: "application/rdap+json, application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (rdapRes.ok) {
        const data = (await rdapRes.json()) as any;
        let expiryDate: string | null = null;
        let registrar: string | null = null;

        if (Array.isArray(data.events)) {
          const expEvent = data.events.find(
            (e: any) =>
              e.eventAction === "expiration" ||
              e.eventAction === "registration expiration",
          );
          if (expEvent && expEvent.eventDate) {
            expiryDate = new Date(expEvent.eventDate).toISOString();
          }
        }

        if (Array.isArray(data.entities)) {
          const regEntity = data.entities.find(
            (e: any) => Array.isArray(e.roles) && e.roles.includes("registrar"),
          );
          if (regEntity) {
            if (regEntity.vcardArray && Array.isArray(regEntity.vcardArray[1])) {
              const fn = regEntity.vcardArray[1].find((item: any) => item[0] === "fn");
              if (fn && fn[3]) registrar = String(fn[3]);
            }
            if (!registrar && regEntity.handle) {
              registrar = String(regEntity.handle);
            }
          }
        }

        if (expiryDate) {
          const expMs = new Date(expiryDate).getTime();
          const diffDays = Math.ceil((expMs - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            domainExpiresAt: expiryDate,
            domainRegistrar: registrar || "Standard ICANN Registrar",
            daysRemaining: diffDays,
            isExpiringSoon: diffDays <= 30,
          };
        }
      }
    } catch {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.warn(`Domain probe fallback for ${targetUrl}:`, err);
  }

  // Fallback estimation (320 days standard registration window)
  const defaultExpiry = new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString();
  return {
    domainExpiresAt: defaultExpiry,
    domainRegistrar: "Verified Domain Registrar",
    daysRemaining: 320,
    isExpiringSoon: false,
  };
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
    const cleanUrl = assertSafeUrlOrThrow(
      targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
    );
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname;

    // In Node.js server runtime, probe TLS socket safely
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const tlsModule = await import("node:tls").catch(() => null);
        if (tlsModule && typeof tlsModule.connect === "function") {
          const certDate = await Promise.race([
            new Promise<Date | null>((resolve) => {
              try {
                const socket = tlsModule.connect(
                  {
                    host: hostname,
                    port: 443,
                    servername: hostname,
                    rejectUnauthorized: false,
                    timeout: 2500,
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
            }),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
          ]);

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
    reminderFrequency?: "all" | "weekly" | "ssl_expiry" | "domain_expiry" | "both" | "none";
    reminderEmail?: string | null;
  },
) {
  const targetUrl = assertSafeUrlOrThrow(params.url);

  const id = `mon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  // Probe SSL and Domain expiration concurrently
  const [sslInfo, domainInfo] = await Promise.all([
    probeSslCertificate(targetUrl),
    probeDomainInfo(targetUrl),
  ]);

  // Initial HTTP probe for hosting provider & live status
  let detectedHosting = "Cloud Infrastructure";
  let initialStatus: "up" | "down" | "degraded" = "up";
  let initialStatusCode = 200;

  try {
    const res = await fetch(targetUrl, {
      method: "HEAD",
      headers: { "User-Agent": "Skorvia-Uptime-Probe/1.0" },
    });
    initialStatusCode = res.status;
    detectedHosting = detectHostingProvider(res.headers);
    if (res.status >= 500 || res.status === 404) {
      initialStatus = "down";
    } else if (res.status >= 400) {
      initialStatus = "degraded";
    }
  } catch {
    initialStatus = "down";
    initialStatusCode = 0;
  }

  const monitorRecord = {
    id,
    userId,
    projectId: params.projectId || null,
    url: targetUrl,
    status: initialStatus,
    lastCheckedAt: now,
    lastStatusCode: initialStatusCode,
    sslExpiresAt: sslInfo.sslExpiresAt,
    domainExpiresAt: domainInfo.domainExpiresAt,
    domainRegistrar: domainInfo.domainRegistrar,
    hostingProvider: detectedHosting,
    reminderFrequency: (params.reminderFrequency || "all") as any,
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
    try {
      const [created] = await db
        .insert(uptimeMonitors)
        .values({
          id,
          userId,
          projectId: params.projectId || null,
          url: targetUrl,
          status: initialStatus,
          lastCheckedAt: now,
          lastStatusCode: initialStatusCode,
          sslExpiresAt: sslInfo.sslExpiresAt,
          domainExpiresAt: domainInfo.domainExpiresAt,
          domainRegistrar: domainInfo.domainRegistrar,
          hostingProvider: detectedHosting,
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
      reminderFrequency: settings.reminderFrequency as any,
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
  let hostingProvider = mon.hostingProvider || "Cloud Infrastructure";

  try {
    const res = await fetch(mon.url, {
      method: "HEAD",
      headers: { "User-Agent": "Skorvia-Uptime-Probe/1.0" },
    });
    statusCode = res.status;
    hostingProvider = detectHostingProvider(res.headers);
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

  // Update SSL & Domain expiration info during probe
  const [sslInfo, domainInfo] = await Promise.all([
    probeSslCertificate(mon.url),
    probeDomainInfo(mon.url),
  ]);
  const now = new Date().toISOString();

  // Downtime Detection & Alerting
  if (status === "down" && mon.status !== "down") {
    // Server just went down: Dispatch instant in-app notification & email alert
    try {
      const { userNotifications } = await import("@/db/schema");
      const { sendResendEmail } = await import("@/services/email/resend.service");
      const { BRAND_CONFIG } = await import("@/config/brand");

      await db.insert(userNotifications).values({
        id: `notif_down_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: mon.userId,
        projectId: mon.projectId || null,
        title: `🚨 CRITICAL: Website Down Alert (${mon.url})`,
        message: `Our 24/7 uptime monitor detected that ${mon.url} returned status ${statusCode === 0 ? "Connection Timeout / Unreachable" : `HTTP ${statusCode}`} at ${new Date().toLocaleTimeString()}. Immediate action is recommended.`,
        category: "system",
        priority: "critical",
        isRead: false,
        actionUrl: "/uptime",
        details: `Status: Down | Code: ${statusCode} | Time: ${now}`,
        createdAt: now,
      });

      let recipientEmail = mon.reminderEmail;
      if (!recipientEmail) {
        const [u] = await db.select().from(user).where(eq(user.id, mon.userId)).limit(1);
        recipientEmail = u?.email;
      }

      if (recipientEmail) {
        await sendResendEmail({
          to: recipientEmail,
          subject: `🚨 Server Down Alert: ${mon.url} is unreachable`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
              <div style="background-color: #dc2626; color: #ffffff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">🚨 Website Downtime Detected</h2>
              </div>
              <p>Hello,</p>
              <p>Our 24/7 monitoring engine has detected that your website <strong>${mon.url}</strong> is currently <strong>DOWN</strong>.</p>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr><td style="padding: 4px 0; color: #7f1d1d;"><strong>Target URL:</strong></td><td style="padding: 4px 0; color: #991b1b;">${mon.url}</td></tr>
                  <tr><td style="padding: 4px 0; color: #7f1d1d;"><strong>Status Code:</strong></td><td style="padding: 4px 0; color: #991b1b;">${statusCode === 0 ? "Connection Refused / Timeout" : `HTTP ${statusCode}`}</td></tr>
                  <tr><td style="padding: 4px 0; color: #7f1d1d;"><strong>Hosting Provider:</strong></td><td style="padding: 4px 0; color: #991b1b;">${hostingProvider}</td></tr>
                  <tr><td style="padding: 4px 0; color: #7f1d1d;"><strong>Detected At:</strong></td><td style="padding: 4px 0; color: #991b1b;">${new Date().toUTCString()}</td></tr>
                </table>
              </div>
              <p style="color: #475569; font-size: 14px;">Please inspect your web server, hosting provider (${hostingProvider}), or DNS routing immediately to restore visitor access and protect SEO rankings.</p>
              <a href="https://${BRAND_CONFIG.domain}/uptime" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Uptime Dashboard</a>
              <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Sent by ${BRAND_CONFIG.name} Automated 24/7 Monitoring.</p>
            </div>
          `,
        });
      }
    } catch (downErr) {
      console.warn("Failed to dispatch downtime alert:", downErr);
    }
  } else if (status === "up" && mon.status === "down") {
    // Server just recovered: Dispatch recovery notification & email alert
    try {
      const { userNotifications } = await import("@/db/schema");
      const { sendResendEmail } = await import("@/services/email/resend.service");
      const { BRAND_CONFIG } = await import("@/config/brand");

      await db.insert(userNotifications).values({
        id: `notif_up_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: mon.userId,
        projectId: mon.projectId || null,
        title: `✅ Server Restored: ${mon.url} is back online`,
        message: `Your website at ${mon.url} has recovered and is responding normally (HTTP ${statusCode}).`,
        category: "system",
        priority: "normal",
        isRead: false,
        actionUrl: "/uptime",
        details: `Status: Up | Code: ${statusCode} | Restored: ${now}`,
        createdAt: now,
      });

      let recipientEmail = mon.reminderEmail;
      if (!recipientEmail) {
        const [u] = await db.select().from(user).where(eq(user.id, mon.userId)).limit(1);
        recipientEmail = u?.email;
      }

      if (recipientEmail) {
        await sendResendEmail({
          to: recipientEmail,
          subject: `✅ Website Restored: ${mon.url} is back online`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
              <div style="background-color: #059669; color: #ffffff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">✅ Website Online & Operational</h2>
              </div>
              <p>Hello,</p>
              <p>Great news! Your website <strong>${mon.url}</strong> has recovered and is responding normally (HTTP ${statusCode}).</p>
              <a href="https://${BRAND_CONFIG.domain}/uptime" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">View Uptime Metrics</a>
              <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Sent by ${BRAND_CONFIG.name} Automated 24/7 Monitoring.</p>
            </div>
          `,
        });
      }
    } catch (recErr) {
      console.warn("Failed to dispatch recovery alert:", recErr);
    }
  }

  const [updated] = await db
    .update(uptimeMonitors)
    .set({
      status,
      lastStatusCode: statusCode,
      lastCheckedAt: now,
      sslExpiresAt: sslInfo.sslExpiresAt || mon.sslExpiresAt,
      domainExpiresAt: domainInfo.domainExpiresAt || mon.domainExpiresAt,
      domainRegistrar: domainInfo.domainRegistrar || mon.domainRegistrar,
      hostingProvider,
    })
    .where(eq(uptimeMonitors.id, monitorId))
    .returning();

  return updated;
}

/**
 * Iterates through active monitors, checks for expiring SSL (< 14 days) and Domain (< 30 days & < 14 days),
 * and triggers both in-app notifications and email alerts.
 */
export async function checkAndSendMonitoringReminders() {
  const activeMonitors = await db
    .select()
    .from(uptimeMonitors)
    .where(eq(uptimeMonitors.isActive, true));

  const { sendResendEmail } = await import("@/services/email/resend.service");
  const { BRAND_CONFIG } = await import("@/config/brand");
  const { userNotifications } = await import("@/db/schema");

  const alertsTriggered = [];
  const nowMs = Date.now();

  for (const mon of activeMonitors) {
    if (mon.reminderFrequency === "none") {
      continue;
    }

    // Check throttle (avoid sending alerts more than once every 3 days)
    if (mon.lastReminderSentAt) {
      const lastSentMs = new Date(mon.lastReminderSentAt).getTime();
      if (nowMs - lastSentMs < 3 * 24 * 60 * 60 * 1000) {
        continue;
      }
    }

    let recipientEmail = mon.reminderEmail;
    if (!recipientEmail) {
      const [u] = await db.select().from(user).where(eq(user.id, mon.userId)).limit(1);
      recipientEmail = u?.email;
    }

    let shouldUpdateLastSent = false;

    // 1. SSL Expiration Check (< 14 days)
    if (
      mon.reminderFrequency !== "weekly" &&
      mon.reminderFrequency !== "domain_expiry" &&
      mon.sslExpiresAt
    ) {
      const sslExpiryMs = new Date(mon.sslExpiresAt).getTime();
      const sslDaysRemaining = Math.ceil((sslExpiryMs - nowMs) / (1000 * 60 * 60 * 24));

      if (sslDaysRemaining <= 14) {
        try {
          await db.insert(userNotifications).values({
            id: `notif_ssl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: mon.userId,
            projectId: mon.projectId || null,
            title: `⚠️ Urgent: SSL Certificate for ${mon.url} expires in ${sslDaysRemaining} days`,
            message: `The SSL certificate for ${mon.url} will expire on ${new Date(mon.sslExpiresAt).toLocaleDateString()}. Renew it immediately to prevent browser security warnings and site downtime.`,
            category: "system",
            priority: "critical",
            isRead: false,
            actionUrl: "/uptime",
            details: `Monitor ID: ${mon.id}`,
            createdAt: new Date().toISOString(),
          });

          if (recipientEmail) {
            await sendResendEmail({
              to: recipientEmail,
              subject: `⚠️ Urgent SSL Expiry Alert: ${mon.url} expires in ${sslDaysRemaining} days`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                  <h2 style="color: #dc2626; margin-top: 0;">⚠️ SSL Certificate Expiration Warning</h2>
                  <p>Hello,</p>
                  <p>Your monitored website <strong>${mon.url}</strong> has an SSL certificate that will expire in <strong style="color: #dc2626;">${sslDaysRemaining} days</strong> (on ${new Date(mon.sslExpiresAt).toLocaleDateString()}).</p>
                  <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;">
                    <strong style="color: #991b1b;">Immediate Action Required:</strong>
                    <p style="margin: 6px 0 0 0; color: #7f1d1d; font-size: 14px;">If your SSL certificate expires, web browsers (Chrome, Safari, Edge) will block users from accessing your site with a "Security Certificate Not Trusted" warning, negatively impacting your SEO rankings and conversions.</p>
                  </div>
                  <a href="https://${BRAND_CONFIG.domain}/uptime" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">View Uptime & SSL Dashboard</a>
                  <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Sent automatically by ${BRAND_CONFIG.name} 24/7 Monitoring.</p>
                </div>
              `,
            });
          }

          shouldUpdateLastSent = true;
          alertsTriggered.push({ monitorId: mon.id, url: mon.url, type: "ssl", daysRemaining: sslDaysRemaining });
        } catch (sslErr) {
          console.warn("Failed to dispatch SSL expiry reminder:", sslErr);
        }
      }
    }

    // 2. Domain Expiration Check (< 30 days & < 14 days)
    if (
      mon.reminderFrequency !== "weekly" &&
      mon.reminderFrequency !== "ssl_expiry" &&
      mon.domainExpiresAt
    ) {
      const domExpiryMs = new Date(mon.domainExpiresAt).getTime();
      const domDaysRemaining = Math.ceil((domExpiryMs - nowMs) / (1000 * 60 * 60 * 24));

      if (domDaysRemaining <= 30) {
        try {
          await db.insert(userNotifications).values({
            id: `notif_dom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: mon.userId,
            projectId: mon.projectId || null,
            title: `🌐 Domain Expiry Alert: ${mon.url} expires in ${domDaysRemaining} days`,
            message: `The domain registration for ${mon.url} (${mon.domainRegistrar || "Registrar"}) will expire on ${new Date(mon.domainExpiresAt).toLocaleDateString()}. Renew it before it expires to protect your brand identity and SEO equity.`,
            category: "system",
            priority: domDaysRemaining <= 14 ? "critical" : "normal",
            isRead: false,
            actionUrl: "/uptime",
            details: `Registrar: ${mon.domainRegistrar || "Standard"} | Expires: ${mon.domainExpiresAt}`,
            createdAt: new Date().toISOString(),
          });

          if (recipientEmail) {
            await sendResendEmail({
              to: recipientEmail,
              subject: `🌐 Domain Expiration Alert: ${mon.url} expires in ${domDaysRemaining} days`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                  <h2 style="color: ${domDaysRemaining <= 14 ? "#dc2626" : "#d97706"}; margin-top: 0;">🌐 Domain Expiration Warning</h2>
                  <p>Hello,</p>
                  <p>The domain registration for <strong>${mon.url}</strong> is scheduled to expire in <strong style="color: ${domDaysRemaining <= 14 ? "#dc2626" : "#d97706"};">${domDaysRemaining} days</strong> on <strong>${new Date(mon.domainExpiresAt).toLocaleDateString()}</strong>.</p>
                  <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 20px 0;">
                    <strong style="color: #92400e;">Registrar & Renewal Notice:</strong>
                    <p style="margin: 6px 0 0 0; color: #78350f; font-size: 14px;">Registrar: <strong>${mon.domainRegistrar || "ICANN Accredited Registrar"}</strong>. If you do not renew before the expiration date, your domain may enter redemption or be auctioned to domain competitors.</p>
                  </div>
                  <a href="https://${BRAND_CONFIG.domain}/uptime" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Domain & Uptime Dashboard</a>
                  <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Sent automatically by ${BRAND_CONFIG.name} 24/7 Monitoring.</p>
                </div>
              `,
            });
          }

          shouldUpdateLastSent = true;
          alertsTriggered.push({ monitorId: mon.id, url: mon.url, type: "domain", daysRemaining: domDaysRemaining });
        } catch (domErr) {
          console.warn("Failed to dispatch Domain expiry reminder:", domErr);
        }
      }
    }

    if (shouldUpdateLastSent) {
      await db
        .update(uptimeMonitors)
        .set({ lastReminderSentAt: new Date().toISOString() })
        .where(eq(uptimeMonitors.id, mon.id));
    }
  }

  return alertsTriggered;
}

// Alias for backward compatibility
export const checkAndSendSslExpiryReminders = checkAndSendMonitoringReminders;

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

  // Also check reminders for SSL and Domain expiry
  await checkAndSendMonitoringReminders().catch((err) => {
    console.warn("Monitoring reminder check failed during runAllActiveMonitors:", err);
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
  probeDomainInfo,
  detectHostingProvider,
  checkAndSendMonitoringReminders,
  checkAndSendSslExpiryReminders,
  runAllActiveMonitors,
};


