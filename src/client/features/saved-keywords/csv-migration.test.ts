import { describe, it, expect } from "vitest";
import { parseMigrationCsv } from "@/client/features/saved-keywords/CsvMigrationImporterModal";

describe("Phase 31: Customer Migration Hub & CSV Parser Suite", () => {
  it("auto-detects and parses Ahrefs CSV exports", () => {
    const ahrefsCsv = `Keyword,KD,Volume,CPC,Parent Keyword
"best seo software",42,14200,3.50,"seo tools"
"local rank tracker",28,4800,2.10,"rank tracking"
"ai visibility audit",15,1900,1.20,"aeo audit"`;

    const result = parseMigrationCsv(ahrefsCsv);
    expect(result.detectedSource).toBe("Ahrefs");
    expect(result.keywords).toHaveLength(3);
    expect(result.keywords[0]).toEqual({
      keyword: "best seo software",
      volume: 14200,
      difficulty: 42,
      cpc: 3.5,
      intent: undefined,
    });
  });

  it("auto-detects and parses Semrush CSV exports", () => {
    const semrushCsv = `Keyword,Search Volume,Keyword Difficulty,CPC (USD),Intent
"b2b saas marketing",8100,56,8.20,"Commercial"
"google maps seo near me",12400,31,4.50,"Local"`;

    const result = parseMigrationCsv(semrushCsv);
    expect(result.detectedSource).toBe("Semrush");
    expect(result.keywords).toHaveLength(2);
    expect(result.keywords[0].keyword).toBe("b2b saas marketing");
    expect(result.keywords[0].difficulty).toBe(56);
    expect(result.keywords[0].intent).toBe("Commercial");
  });

  it("handles generic CSV files with standard fallback columns", () => {
    const genericCsv = `Search Term,Monthly Searches,Cost Per Click
"shopify speed optimization",3200,4.10
"broken link checker",9800,1.80`;

    const result = parseMigrationCsv(genericCsv);
    expect(result.detectedSource).toBe("Generic CSV");
    expect(result.keywords).toHaveLength(2);
    expect(result.keywords[0].keyword).toBe("shopify speed optimization");
    expect(result.keywords[0].volume).toBe(3200);
  });

  it("safely ignores empty lines and invalid CSV content", () => {
    const emptyCsv = ``;
    const result = parseMigrationCsv(emptyCsv);
    expect(result.keywords).toHaveLength(0);
  });
});
