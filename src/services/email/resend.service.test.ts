import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendResendEmail,
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
  sendSiteAuditCompletedEmail,
  sendUptimeDowntimeAlertEmail,
  sendBillingInvoiceReceiptEmail,
} from "@/services/email/resend.service";

describe("Resend Transactional Email Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles mock/dev mode gracefully when API key is not set", async () => {
    const res = await sendResendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello World</p>",
    });

    expect(res.success).toBe(true);
    expect(res.id).toMatch(/^mock_/);
  });

  it("formats and generates Account Verification email correctly", async () => {
    const res = await sendAccountVerificationEmail({
      email: "user@example.com",
      confirmationUrl: "https://skorvia.com/verify-email?token=abc123xyz",
      name: "Alex",
    });

    expect(res.success).toBe(true);
  });

  it("formats and generates Password Reset email correctly", async () => {
    const res = await sendPasswordResetEmail({
      email: "user@example.com",
      resetUrl: "https://skorvia.com/reset-password?token=resetToken456",
      name: "Alex",
    });

    expect(res.success).toBe(true);
  });

  it("formats and generates Site Audit Completed email alert", async () => {
    const res = await sendSiteAuditCompletedEmail({
      email: "client@agency.com",
      domain: "example.com",
      healthScore: 94,
      criticalIssues: 2,
      reportUrl: "https://skorvia.com/p/proj_1/audit",
    });

    expect(res.success).toBe(true);
  });

  it("formats and generates Uptime & Downtime Alert email", async () => {
    const res = await sendUptimeDowntimeAlertEmail({
      email: "ops@company.com",
      domain: "acme.org",
      status: "down",
      statusCode: 502,
      responseTimeMs: 2500,
    });

    expect(res.success).toBe(true);
  });

  it("formats and generates Billing Invoice Receipt email", async () => {
    const res = await sendBillingInvoiceReceiptEmail({
      email: "founder@startup.io",
      planName: "Pro",
      amount: 79,
      currency: "USD",
      reference: "txn_skorvia_9921",
    });

    expect(res.success).toBe(true);
  });
});
