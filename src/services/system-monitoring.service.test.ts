import { describe, it, expect, beforeEach } from "vitest";
import { SystemMonitoringService } from "@/services/system-monitoring.service";

describe("SystemMonitoringService (Infrastructure & Webhook Error Logger)", () => {
  beforeEach(() => {
    // Reset state if needed
  });

  describe("Live Dependency Health Probes", () => {
    it("probes all core 3rd party providers with latency numbers", async () => {
      const probes = await SystemMonitoringService.runLiveDependencyProbes();
      expect(probes.length).toBeGreaterThanOrEqual(4);

      const dbProbe = probes.find((p) => p.category === "database");
      expect(dbProbe).toBeDefined();
      expect(dbProbe?.latencyMs).toBeGreaterThan(0);

      const searchProbe = probes.find((p) => p.category === "search");
      expect(searchProbe).toBeDefined();
      expect(searchProbe?.latencyMs).toBeGreaterThan(0);
    });
  });

  describe("System KPIs & Runtime Metrics", () => {
    it("retrieves process memory and uptime metrics", () => {
      const kpis = SystemMonitoringService.getSystemKpis();
      expect(kpis.memoryRssMb).toBeGreaterThan(0);
      expect(kpis.memoryHeapUsedMb).toBeGreaterThan(0);
      expect(kpis.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(kpis.nodeVersion).toBeDefined();
    });
  });

  describe("Webhook Error Logger & Retry Engine", () => {
    it("retrieves webhook error logs with fallback seeds", async () => {
      const result = await SystemMonitoringService.getWebhookErrorLogs();
      expect(result.logs.length).toBeGreaterThan(0);
      expect(result.logs[0].provider).toBeDefined();
      expect(result.logs[0].errorMessage).toBeDefined();
    });

    it("logs a failed webhook, retries it, and resolves the error", async () => {
      const logged = await SystemMonitoringService.logWebhookFailure({
        provider: "lemonsqueezy",
        event: "subscription_payment_failed",
        payload: { order_id: "ls_1001", customer: "test@example.com" },
        error: new Error("Insufficient user credit balance"),
        responseStatus: 402,
      });

      expect(logged.id).toBeDefined();
      expect(logged.provider).toBe("lemonsqueezy");
      expect(logged.status).toBe("failed");

      const retryRes = await SystemMonitoringService.retryWebhook(
        logged.id,
        "usr_superadmin_01",
        "admin@skorvia.com",
      );
      expect(retryRes.success).toBe(true);

      const resolved = await SystemMonitoringService.resolveWebhook(
        logged.id,
        "usr_superadmin_01",
        "admin@skorvia.com",
      );
      expect(resolved).toBe(true);
    });
  });
});
