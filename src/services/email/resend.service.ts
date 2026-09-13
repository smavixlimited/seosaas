import { BRAND_CONFIG } from "@/config/brand";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function resolveResendApiKey(): Promise<string | null> {
  if (typeof process !== "undefined" && process.env?.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY.trim();
  }
  try {
    const { SystemSettingsService } = await import(
      "@/services/system-settings.service"
    );
    const emailSettings = await SystemSettingsService.getSetting<{
      resendApiKey?: string;
    }>("email_apis", {});
    if (emailSettings.resendApiKey?.trim()) {
      return emailSettings.resendApiKey.trim();
    }
  } catch {}
  return null;
}

export async function sendResendEmail(
  options: SendEmailOptions,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = await resolveResendApiKey();
  const fromAddress =
    options.from ||
    `${BRAND_CONFIG.name} <notifications@${BRAND_CONFIG.domain}>`;

  if (!apiKey) {
    console.info("[Resend Email Mock/Dev]", {
      to: options.to,
      subject: options.subject,
      from: fromAddress,
    });
    return { success: true, id: `mock_${Date.now()}` };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || BRAND_CONFIG.supportEmail,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg =
        (errJson as { message?: string }).message ||
        `Resend HTTP error ${response.status}`;
      console.error("Resend send email error:", errMsg);
      return { success: false, error: errMsg };
    }

    const data = (await response.json()) as { id?: string };
    return { success: true, id: data.id };
  } catch (err) {
    console.error("Failed to dispatch Resend email:", err);
    return { success: false, error: (err as Error).message };
  }
}

// Base HTML Email Template Wrapper matching Skorvia Branding
function wrapEmailHtml(contentHtml: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_CONFIG.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .logo { height: 36px; display: inline-block; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .btn { display: inline-block; background-color: #17199b; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; margin: 24px 0; font-size: 14px; text-align: center; }
    .footer { padding: 24px 32px; background-color: #f8fafc; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; }
    .stat-card { background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center; }
    .score-badge { font-size: 32px; font-weight: 900; color: #17199b; }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;font-size:0;line-height:0;max-height:0;mso-hide:all;">${preheader}</span>` : ""}
  <div class="container">
    <div class="header">
      <h2 style="margin:0;color:#17199b;font-weight:900;letter-spacing:-0.5px;">${BRAND_CONFIG.name}</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${BRAND_CONFIG.slogan}</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin:0 0 8px;">&copy; ${new Date().getFullYear()} ${BRAND_CONFIG.legalName}. All rights reserved.</p>
      <p style="margin:0;">Questions? Contact us at <a href="mailto:${BRAND_CONFIG.supportEmail}" style="color:#17199b;text-decoration:none;">${BRAND_CONFIG.supportEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// 1. Account Verification Email
export async function sendAccountVerificationEmail(params: {
  email: string;
  confirmationUrl: string;
  name?: string | null;
}) {
  const greeting = params.name ? `Hi ${params.name},` : "Hello,";
  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#0f172a;">Confirm your email address</h3>
    <p>${greeting}</p>
    <p>Welcome to <strong>${BRAND_CONFIG.name}</strong>! Please click the button below to verify your email address and activate your account.</p>
    <div style="text-align:center;">
      <a href="${params.confirmationUrl}" class="btn">Verify My Email</a>
    </div>
    <p style="font-size:13px;color:#64748b;">Or paste this link into your browser:<br><a href="${params.confirmationUrl}" style="color:#17199b;word-break:break-all;">${params.confirmationUrl}</a></p>
    <p style="font-size:13px;color:#64748b;margin-top:24px;">If you didn't create this account, you can safely ignore this email.</p>
    `,
    "Verify your Skorvia account",
  );

  return sendResendEmail({
    to: params.email,
    subject: `Verify your email for ${BRAND_CONFIG.name}`,
    html,
  });
}

// 2. Password Reset Email
export async function sendPasswordResetEmail(params: {
  email: string;
  resetUrl: string;
  name?: string | null;
}) {
  const greeting = params.name ? `Hi ${params.name},` : "Hello,";
  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#0f172a;">Reset your password</h3>
    <p>${greeting}</p>
    <p>We received a request to reset the password for your <strong>${BRAND_CONFIG.name}</strong> account. Click the button below to set a new password:</p>
    <div style="text-align:center;">
      <a href="${params.resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size:13px;color:#64748b;">This password reset link is valid for <strong>60 minutes</strong>. If you didn't request a password reset, no action is needed.</p>
    `,
    "Reset your Skorvia password",
  );

  return sendResendEmail({
    to: params.email,
    subject: `Reset your ${BRAND_CONFIG.name} password`,
    html,
  });
}

// 3. Site Audit Completed Alert
export async function sendSiteAuditCompletedEmail(params: {
  email: string;
  domain: string;
  healthScore: number;
  criticalIssues: number;
  reportUrl: string;
}) {
  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#0f172a;">Site Audit Completed for ${params.domain}</h3>
    <p>We've finished analyzing <strong>${params.domain}</strong>. Here is your overall technical health breakdown:</p>
    <div class="stat-card">
      <div class="score-badge">${params.healthScore}/100</div>
      <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin-top:4px;">Technical SEO Health Score</div>
      <div style="margin-top:12px;font-size:13px;color:#ef4444;font-weight:bold;">${params.criticalIssues} Critical issue(s) detected</div>
    </div>
    <div style="text-align:center;">
      <a href="${params.reportUrl}" class="btn">View Full Audit Report</a>
    </div>
    `,
    `Audit results for ${params.domain}: Score ${params.healthScore}/100`,
  );

  return sendResendEmail({
    to: params.email,
    subject: `[Audit Ready] ${params.domain} SEO Health Score: ${params.healthScore}/100`,
    html,
  });
}

// 4. Uptime Downtime Alert
export async function sendUptimeDowntimeAlertEmail(params: {
  email: string;
  domain: string;
  status: "down" | "degraded" | "recovered";
  statusCode?: number;
  responseTimeMs?: number;
}) {
  const isRecovered = params.status === "recovered";
  const title = isRecovered
    ? `✅ Site Recovered: ${params.domain}`
    : `🚨 Downtime Alert: ${params.domain} is DOWN`;

  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:${isRecovered ? "#10b981" : "#ef4444"};">${title}</h3>
    <p>Our automated monitoring probe detected a status change for <strong>${params.domain}</strong>.</p>
    <div class="stat-card">
      <p style="margin:0;font-size:14px;"><strong>Status:</strong> ${params.status.toUpperCase()}</p>
      ${params.statusCode ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b;">HTTP Status Code: ${params.statusCode}</p>` : ""}
      ${params.responseTimeMs ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b;">Response Time: ${params.responseTimeMs}ms</p>` : ""}
      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Timestamp: ${new Date().toUTCString()}</p>
    </div>
    <div style="text-align:center;">
      <a href="${BRAND_CONFIG.url}/uptime" class="btn">Open Uptime Dashboard</a>
    </div>
    `,
    title,
  );

  return sendResendEmail({
    to: params.email,
    subject: title,
    html,
  });
}

// 5. Billing & Invoice Receipt
export async function sendBillingInvoiceReceiptEmail(params: {
  email: string;
  planName: string;
  amount: number;
  currency: string;
  reference: string;
}) {
  const formattedAmount = `${params.currency === "NGN" ? "₦" : "$"}${params.amount.toLocaleString()}`;
  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#0f172a;">Payment Confirmation & Receipt</h3>
    <p>Thank you for subscribing to <strong>${BRAND_CONFIG.name} ${params.planName} Plan</strong>!</p>
    <div class="stat-card">
      <div style="font-size:24px;font-weight:900;color:#10b981;">${formattedAmount}</div>
      <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Reference: ${params.reference}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <p>Your monthly API credits and quota limit have been automatically provisioned to your account.</p>
    <div style="text-align:center;">
      <a href="${BRAND_CONFIG.url}/projects" class="btn">Go to My Dashboard</a>
    </div>
    `,
    `Receipt for your ${BRAND_CONFIG.name} ${params.planName} subscription`,
  );

  return sendResendEmail({
    to: params.email,
    subject: `Receipt: ${BRAND_CONFIG.name} ${params.planName} Plan (${formattedAmount})`,
    html,
  });
}

// 6. Security Alert: New Device / IP Login Detected
export async function sendNewDeviceLoginAlertEmail(params: {
  email: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  timestamp?: string;
  lockAccountUrl?: string;
}) {
  const time = params.timestamp || new Date().toUTCString();
  const lockUrl =
    params.lockAccountUrl || `${BRAND_CONFIG.url}/dashboard/settings/security`;

  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#dc2626;">🚨 Security Alert: New Login Detected</h3>
    <p>A new sign-in was detected on your <strong>${BRAND_CONFIG.name}</strong> account.</p>
    <div class="stat-card" style="background:#fef2f2;border:1px solid #fee2e2;text-align:left;">
      <p style="margin:4px 0;font-size:13px;"><strong>🌐 Browser:</strong> ${params.browser}</p>
      <p style="margin:4px 0;font-size:13px;"><strong>💻 Operating System:</strong> ${params.os}</p>
      <p style="margin:4px 0;font-size:13px;"><strong>📍 Estimated Location:</strong> ${params.location}</p>
      <p style="margin:4px 0;font-size:13px;"><strong>🔍 IP Address:</strong> ${params.ipAddress}</p>
      <p style="margin:4px 0;font-size:12px;color:#64748b;"><strong>⏰ Time:</strong> ${time}</p>
    </div>
    <p style="color:#64748b;font-size:13px;">If this was you, you can safely disregard this email. If you did not authorize this login, click below immediately to revoke all active sessions and secure your account.</p>
    <div style="text-align:center;">
      <a href="${lockUrl}" class="btn" style="background-color:#dc2626;">Secure My Account</a>
    </div>
    `,
    `Security Alert: New sign-in detected on your ${BRAND_CONFIG.name} account`,
  );

  return sendResendEmail({
    to: params.email,
    subject: `🚨 [Security Alert] New login detected from ${params.browser} on ${params.os}`,
    html,
  });
}

// 7. Team Member Invitation Email
export async function sendTeamInviteEmail(params: {
  email: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  inviteToken: string;
  expiresInDays?: number;
}) {
  const inviteUrl = `${BRAND_CONFIG.url}/accept-invite?token=${params.inviteToken}`;
  const days = params.expiresInDays || 7;
  const roleName = params.role.charAt(0).toUpperCase() + params.role.slice(1);

  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#17199b;">You've Been Invited to Join a Team on ${BRAND_CONFIG.name}</h3>
    <p><strong>${params.inviterName || params.inviterEmail}</strong> has invited you to collaborate on their SEO, AI Search Visibility, and analytics projects.</p>
    <div class="stat-card" style="text-align:left;">
      <p style="margin:4px 0;font-size:13px;"><strong>👤 Invited By:</strong> ${params.inviterName || params.inviterEmail} (${params.inviterEmail})</p>
      <p style="margin:4px 0;font-size:13px;"><strong>🛡️ Assigned Role:</strong> <span style="color:#17199b;font-weight:bold;">${roleName}</span></p>
      <p style="margin:4px 0;font-size:12px;color:#64748b;"><strong>⏳ Expiration:</strong> This invitation link expires in ${days} days.</p>
    </div>
    <p>As a team member with the <strong>${roleName}</strong> role, you will be able to access SEO campaigns, monitor keyword rankings, and review audits.</p>
    <div style="text-align:center;">
      <a href="${inviteUrl}" class="btn">Accept Invitation & Join Team</a>
    </div>
    <p style="font-size:11px;color:#94a3b8;text-align:center;">Or copy this URL into your browser: <br><span style="word-break:break-all;">${inviteUrl}</span></p>
    `,
    `You've been invited to join ${BRAND_CONFIG.name} by ${params.inviterName || params.inviterEmail}`,
  );

  return sendResendEmail({
    to: params.email,
    subject: `✉️ ${params.inviterName || "A team member"} invited you to join their team on ${BRAND_CONFIG.name}`,
    html,
  });
}

// 8. Automated Monday SEO Digest Email
export async function sendWeeklySeoDigestEmail(params: {
  email: string;
  domain: string;
  projectId?: string;
  keywordsGained: number;
  keywordsLost: number;
  newBacklinks: number;
  auditIssuesCount: number;
  healthScore: number;
  topGainerKeyword?: string;
}) {
  const projectUrl = params.projectId
    ? `${BRAND_CONFIG.url}/p/${params.projectId}`
    : `${BRAND_CONFIG.url}/projects`;

  const html = wrapEmailHtml(
    `
    <h3 style="margin-top:0;font-size:20px;color:#17199b;">📈 Your Weekly SEO Summary for ${params.domain}</h3>
    <p>Here is your weekly search visibility, keyword ranking, and technical site health performance report.</p>
    
    <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:12px;margin:20px 0;">
      <div class="stat-card" style="margin:0;padding:16px;">
        <div style="font-size:24px;font-weight:900;color:#10b981;">+${params.keywordsGained}</div>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;">Keywords Gained</p>
      </div>
      <div class="stat-card" style="margin:0;padding:16px;">
        <div style="font-size:24px;font-weight:900;color:#3b82f6;">+${params.newBacklinks}</div>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;">New Backlinks</p>
      </div>
      <div class="stat-card" style="margin:0;padding:16px;">
        <div style="font-size:24px;font-weight:900;color:#17199b;">${params.healthScore}%</div>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;">Site Health Score</p>
      </div>
      <div class="stat-card" style="margin:0;padding:16px;">
        <div style="font-size:24px;font-weight:900;color:${params.auditIssuesCount > 0 ? "#f59e0b" : "#10b981"};">${params.auditIssuesCount}</div>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;">Issues to Fix</p>
      </div>
    </div>

    ${
      params.topGainerKeyword
        ? `<div class="stat-card" style="text-align:left;background:#f0fdf4;border:1px solid #dcfce7;">
            <p style="margin:0;font-size:12px;color:#15803d;"><strong>🚀 Top Gainer:</strong> "${params.topGainerKeyword}" climbed into the top search results this week!</p>
          </div>`
        : ""
    }

    <p style="font-size:13px;color:#64748b;">Log in to your Skorvia workspace to run updated audits, optimize missing content gaps, and track AI visibility.</p>
    
    <div style="text-align:center;">
      <a href="${projectUrl}" class="btn">View Full SEO Report</a>
    </div>
    `,
    `Weekly SEO Performance Digest for ${params.domain}: +${params.keywordsGained} Keywords, +${params.newBacklinks} Backlinks`,
  );

  return sendResendEmail({
    to: params.email,
    subject: `📈 Weekly SEO Summary for ${params.domain}: +${params.keywordsGained} Keywords, ${params.healthScore}% Health`,
    html,
  });
}
