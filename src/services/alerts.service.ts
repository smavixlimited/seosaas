import { sendResendEmail } from "@/services/email/resend.service";
import { BRAND_CONFIG } from "@/config/brand";

export interface RankDropAlertParams {
  email: string;
  domain: string;
  keyword: string;
  previousPosition: number;
  newPosition: number;
  threshold?: number;
  reportUrl?: string;
}

export interface CriticalAuditAlertParams {
  email: string;
  domain: string;
  criticalIssues: number;
  healthScore: number;
  reportUrl: string;
}

export interface SslExpirationAlertParams {
  email: string;
  domain: string;
  daysRemaining: number;
  expiryDate: string;
}

export interface WeeklyDigestAlertParams {
  email: string;
  domain: string;
  totalTrackedKeywords: number;
  topGainerKeyword?: string;
  topGainerDelta?: number;
  healthScore: number;
  dashboardUrl: string;
}

export const AlertsService = {
  /**
   * Evaluates if a rank change warrants an instant drop alert and dispatches notification.
   */
  async checkAndDispatchRankDropAlert(params: RankDropAlertParams) {
    const threshold = params.threshold ?? 3;
    const dropDelta = params.newPosition - params.previousPosition;

    // In search rankings, a larger number means a worse position (e.g., 2 -> 7 is a drop of 5)
    if (dropDelta < threshold) {
      return { alerted: false, reason: "Below threshold" };
    }

    const reportUrl = params.reportUrl || `${BRAND_CONFIG.url}/projects`;
    const subject = `⚠️ Rank Drop Alert: "${params.keyword}" dropped ${dropDelta} positions on ${params.domain}`;
    const html = `
      <div style="font-family:sans-serif;padding:24px;color:#1e293b;">
        <h3 style="color:#ef4444;margin-top:0;">Rank Drop Alert for ${params.domain}</h3>
        <p>Our daily rank tracking monitor detected a position decline for a tracked keyword:</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:bold;">Keyword: <em>"${params.keyword}"</em></p>
          <p style="margin:4px 0;color:#64748b;font-size:14px;">Previous Rank: <strong>#${params.previousPosition}</strong> &rarr; Current Rank: <strong style="color:#ef4444;">#${params.newPosition}</strong> (${dropDelta} positions dropped)</p>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="${reportUrl}" style="background:#17199b;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">View Rank Tracker</a>
        </div>
      </div>
    `;

    const res = await sendResendEmail({
      to: params.email,
      subject,
      html,
    });

    return { alerted: true, dropDelta, res };
  },

  /**
   * Dispatches an alert when critical technical issues (e.g., 5xx, broken indexability) are discovered.
   */
  async checkAndDispatchCriticalAuditAlert(params: CriticalAuditAlertParams) {
    if (params.criticalIssues <= 0) {
      return { alerted: false, reason: "No critical issues" };
    }

    const subject = `🚨 Critical SEO Issues Detected on ${params.domain} (${params.criticalIssues} found)`;
    const html = `
      <div style="font-family:sans-serif;padding:24px;color:#1e293b;">
        <h3 style="color:#ef4444;margin-top:0;">Critical SEO Alert: ${params.domain}</h3>
        <p>Our crawler discovered <strong>${params.criticalIssues} critical technical issue(s)</strong> that may impair search crawling or indexation.</p>
        <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin:16px 0;">
          <div style="font-size:24px;font-weight:bold;color:#b91c1c;">Health Score: ${params.healthScore}/100</div>
          <p style="margin:8px 0 0;font-size:13px;color:#991b1b;">Immediate attention recommended to prevent organic traffic loss.</p>
        </div>
        <div style="text-align:center;margin-top:24px;">
          <a href="${params.reportUrl}" style="background:#17199b;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">View Audit Report & Fixes</a>
        </div>
      </div>
    `;

    const res = await sendResendEmail({
      to: params.email,
      subject,
      html,
    });

    return { alerted: true, res };
  },

  /**
   * Dispatches an SSL certificate expiration warning when expiry is within 14 days.
   */
  async checkAndDispatchSslExpirationAlert(params: SslExpirationAlertParams) {
    if (params.daysRemaining > 14) {
      return { alerted: false, reason: "SSL not expiring soon" };
    }

    const subject = `🔒 SSL Expiration Warning: Certificate for ${params.domain} expires in ${params.daysRemaining} days`;
    const html = `
      <div style="font-family:sans-serif;padding:24px;color:#1e293b;">
        <h3 style="color:#f59e0b;margin-top:0;">SSL Certificate Expiring Soon</h3>
        <p>The SSL certificate for <strong>${params.domain}</strong> is scheduled to expire on <strong>${params.expiryDate}</strong> (${params.daysRemaining} days remaining).</p>
        <p>Please renew your certificate to avoid browser security warnings and search ranking penalties.</p>
        <div style="text-align:center;margin-top:24px;">
          <a href="${BRAND_CONFIG.url}/uptime" style="background:#17199b;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">Open Uptime & SSL Monitor</a>
        </div>
      </div>
    `;

    const res = await sendResendEmail({
      to: params.email,
      subject,
      html,
    });

    return { alerted: true, res };
  },

  /**
   * Dispatches weekly Monday executive SEO digest.
   */
  async checkAndDispatchWeeklyDigest(params: WeeklyDigestAlertParams) {
    const subject = `📈 Weekly SEO Digest for ${params.domain} — Health Score: ${params.healthScore}/100`;
    const html = `
      <div style="font-family:sans-serif;padding:24px;color:#1e293b;">
        <h3 style="color:#17199b;margin-top:0;">Your Weekly SEO Overview for ${params.domain}</h3>
        <p>Here is how your search performance and organic rankings shaped up this week:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;">
          <div style="background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#17199b;">${params.totalTrackedKeywords}</div>
            <div style="font-size:12px;color:#64748b;font-weight:bold;text-transform:uppercase;">Tracked Keywords</div>
          </div>
          <div style="background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:24px;font-weight:bold;color:#10b981;">${params.healthScore}/100</div>
            <div style="font-size:12px;color:#64748b;font-weight:bold;text-transform:uppercase;">Technical Health</div>
          </div>
        </div>
        ${
          params.topGainerKeyword
            ? `<p style="font-size:14px;color:#10b981;">🚀 <strong>Top Gainer:</strong> "${params.topGainerKeyword}" (+${params.topGainerDelta} positions)</p>`
            : ""
        }
        <div style="text-align:center;margin-top:24px;">
          <a href="${params.dashboardUrl}" style="background:#17199b;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">Open Full Dashboard</a>
        </div>
      </div>
    `;

    const res = await sendResendEmail({
      to: params.email,
      subject,
      html,
    });

    return { alerted: true, res };
  },
};
