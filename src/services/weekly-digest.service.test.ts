import { describe, it, expect } from "vitest";
import { WeeklyDigestService } from "@/services/weekly-digest.service";
import { generateCsvString } from "@/client/lib/export-csv";

describe("Phase 26: Weekly SEO Digests & Universal CSV Exporter Suite", () => {
  const testUserId = "usr_digest_test_01";
  const testEmail = "newsletter@skorvia-test.com";

  describe("1. Weekly SEO Performance Metrics & Digest Calculation", () => {
    it("computes user digest metrics including keywords, backlinks, and health scores", async () => {
      const metrics = await WeeklyDigestService.computeUserDigestMetrics(testUserId, testEmail);

      expect(metrics.userId).toBe(testUserId);
      expect(metrics.email).toBe(testEmail);
      expect(metrics.keywordsGained).toBeGreaterThanOrEqual(0);
      expect(metrics.newBacklinks).toBeGreaterThanOrEqual(0);
      expect(metrics.healthScore).toBeGreaterThanOrEqual(0);
      expect(metrics.healthScore).toBeLessThanOrEqual(100);
      expect(metrics.domain).toBeDefined();
    });

    it("dispatches automated weekly digest email", async () => {
      const result = await WeeklyDigestService.sendDigestToUser(testUserId, testEmail);
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });

    it("executes Monday Cron trigger handler across users", async () => {
      const cronResult = await WeeklyDigestService.handleMondayDigestCron();
      expect(cronResult.processedCount).toBeGreaterThanOrEqual(1);
      expect(cronResult.successCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("2. Universal CSV Exporter & Security Sanitization", () => {
    it("formats tabular data into compliant RFC 4180 CSV strings", () => {
      const data = [
        { keyword: "seo tools", volume: 14000, difficulty: 45, isTracked: true },
        { keyword: "backlink checker", volume: 8200, difficulty: 60, isTracked: false },
      ];

      const columns = [
        { header: "Search Keyword", accessor: (r: typeof data[0]) => r.keyword },
        { header: "Search Volume", accessor: (r: typeof data[0]) => r.volume },
        { header: "Keyword Difficulty", accessor: (r: typeof data[0]) => `${r.difficulty}%` },
        { header: "Tracked", accessor: (r: typeof data[0]) => (r.isTracked ? "YES" : "NO") },
      ];

      const csv = generateCsvString(data, columns);
      expect(csv).toContain("Search Keyword,Search Volume,Keyword Difficulty,Tracked");
      expect(csv).toContain("seo tools,14000,45%,YES");
      expect(csv).toContain("backlink checker,8200,60%,NO");
    });

    it("sanitizes CSV formula injection characters", () => {
      const maliciousData = [
        { name: "=cmd|' /C calc'!A0", role: "+admin", note: "-test@domain" },
      ];

      const columns = [
        { header: "Name", accessor: (r: typeof maliciousData[0]) => r.name },
        { header: "Role", accessor: (r: typeof maliciousData[0]) => r.role },
        { header: "Note", accessor: (r: typeof maliciousData[0]) => r.note },
      ];

      const csv = generateCsvString(maliciousData, columns);
      expect(csv).toContain("Name,Role,Note");
      expect(csv).toContain("'=cmd|' /C calc'!A0");
      expect(csv).toContain("'+admin");
      expect(csv).toContain("'-test@domain");
    });
  });
});
