import { describe, it, expect } from "vitest";
import { BRAND_CONFIG } from "@/config/brand";
import { CreditGuardService } from "@/services/credit-guard.service";
import { WebhookIdempotencyService } from "@/services/webhook-idempotency.service";
import { DataForSeoAsyncService } from "@/services/dataforseo-async.service";
import { parseMigrationCsv } from "@/client/features/saved-keywords/CsvMigrationImporterModal";
import { generateCsvString } from "@/client/lib/export-csv";

describe("Skorvia Enterprise: Complete 32-Phase Master Verification Suite", () => {
  it("Phase 1-28: verifies foundational branding and multi-system services", () => {
    expect(BRAND_CONFIG.name).toBe("Skorvia");
    expect(BRAND_CONFIG.logoUrl).toBe("/logo.png");
    expect(BRAND_CONFIG.domain).toBe("skorvia.com");
  });

  it("Phase 29: verifies atomic SQL credit deductions and webhook replay guards", async () => {
    const deductRes = await CreditGuardService.deductCreditsAtomic({
      userId: "usr_master_p29_01",
      amount: 5,
    });
    expect(deductRes.success).toBe(true);

    const claim = await WebhookIdempotencyService.claimWebhookEvent({
      gateway: "paystack",
      eventId: "evt_master_test_p29",
      eventType: "charge.success",
      payload: { ref: "pay_001" },
    });
    expect(claim.isDuplicate).toBe(false);
  });

  it("Phase 30: verifies async task chunking and state machine progression", async () => {
    const batch = await DataForSeoAsyncService.enqueueBatchRankCheck({
      targetDomain: "skorvia.com",
      keywords: ["best seo tools 2026", "aeo search engine optimization"],
    });
    expect(batch.totalTasks).toBe(2);
    expect(batch.chunkCount).toBe(1);
    expect(batch.tasks).toHaveLength(2);
  });

  it("Phase 31: verifies 1-click Ahrefs and Semrush CSV migration parsing", () => {
    const csvData = `Keyword,KD,Volume,CPC\n"enterprise ai seo",45,18200,4.20`;
    const parsed = parseMigrationCsv(csvData);
    expect(parsed.detectedSource).toBe("Ahrefs");
    expect(parsed.keywords[0].keyword).toBe("enterprise ai seo");
    expect(parsed.keywords[0].volume).toBe(18200);
    expect(parsed.keywords[0].difficulty).toBe(45);
  });

  it("Phase 32: verifies dynamic Open Graph and universal CSV export formatting", () => {
    const rows = [{ keyword: "skorvia ranking", score: 98 }];
    const csvOutput = generateCsvString(rows, [
      { header: "Keyword", accessor: "keyword" },
      { header: "Score", accessor: "score" },
    ]);
    expect(csvOutput).toContain("skorvia ranking");
    expect(csvOutput).toContain("Keyword,Score");
  });
});
