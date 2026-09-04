import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlertsService } from "@/services/alerts.service";
import { CronOrchestratorService } from "@/services/cron-orchestrator.service";

describe("SEO Intelligence Alerts & Cron Schedulers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("AlertsService", () => {
    it("triggers rank drop alert when position drops by more than threshold", async () => {
      const res = await AlertsService.checkAndDispatchRankDropAlert({
        email: "seo@growth.com",
        domain: "acme.com",
        keyword: "ai rank tracker",
        previousPosition: 3,
        newPosition: 8, // drop of 5 >= default 3
      });

      expect(res.alerted).toBe(true);
      expect(res.dropDelta).toBe(5);
    });

    it("ignores rank changes below alert threshold", async () => {
      const res = await AlertsService.checkAndDispatchRankDropAlert({
        email: "seo@growth.com",
        domain: "acme.com",
        keyword: "ai rank tracker",
        previousPosition: 4,
        newPosition: 5, // drop of 1 < 3
      });

      expect(res.alerted).toBe(false);
    });

    it("dispatches critical technical audit alerts", async () => {
      const res = await AlertsService.checkAndDispatchCriticalAuditAlert({
        email: "dev@company.com",
        domain: "mystore.com",
        criticalIssues: 4,
        healthScore: 68,
        reportUrl: "https://skorvia.com/p/proj_1/audit",
      });

      expect(res.alerted).toBe(true);
    });

    it("dispatches SSL certificate expiration alert when <= 14 days remaining", async () => {
      const res = await AlertsService.checkAndDispatchSslExpirationAlert({
        email: "ops@startup.io",
        domain: "api.startup.io",
        daysRemaining: 7,
        expiryDate: "2026-09-08",
      });

      expect(res.alerted).toBe(true);
    });

    it("dispatches weekly executive SEO digest email", async () => {
      const res = await AlertsService.checkAndDispatchWeeklyDigest({
        email: "founder@saas.com",
        domain: "saas.com",
        totalTrackedKeywords: 120,
        topGainerKeyword: "seo automation tools",
        topGainerDelta: 14,
        healthScore: 95,
        dashboardUrl: "https://skorvia.com/projects",
      });

      expect(res.alerted).toBe(true);
    });
  });

  describe("CronOrchestratorService", () => {
    it("handles 5-minute uptime ping cron trigger", async () => {
      const res = await CronOrchestratorService.executeScheduledTask("five_min_uptime_ping");
      expect(res.success).toBe(true);
      expect(res.schedule).toBe("five_min_uptime_ping");
    });

    it("handles daily rank check cron trigger", async () => {
      const res = await CronOrchestratorService.executeScheduledTask("daily_rank_check");
      expect(res.success).toBe(true);
      expect(res.schedule).toBe("daily_rank_check");
    });

    it("handles weekly site audit cron trigger", async () => {
      const res = await CronOrchestratorService.executeScheduledTask("weekly_site_audit");
      expect(res.success).toBe(true);
      expect(res.schedule).toBe("weekly_site_audit");
    });

    it("handles weekly SEO digest cron trigger", async () => {
      const res = await CronOrchestratorService.executeScheduledTask("weekly_seo_digest");
      expect(res.success).toBe(true);
      expect(res.schedule).toBe("weekly_seo_digest");
    });
  });
});
