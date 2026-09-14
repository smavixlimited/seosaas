import { describe, it, expect } from "vitest";
import { calculateAuditGrade } from "./audit-grading";

describe("calculateAuditGrade", () => {
  it("grades sites with zero issues as 100% Grade A+ (Green)", () => {
    const grade = calculateAuditGrade({
      issues: [],
      pagesCrawled: 50,
    });
    expect(grade.score).toBe(100);
    expect(grade.letterGrade).toBe("A+");
    expect(grade.category).toBe("green");
  });

  it("grades clean sites with minor issues in 70-100 range as Green", () => {
    const grade = calculateAuditGrade({
      issues: [{ severity: "warning" }, { severity: "info" }],
      pagesCrawled: 20,
    });
    expect(grade.score).toBeGreaterThanOrEqual(70);
    expect(grade.category).toBe("green");
  });

  it("grades sites with moderate defects in 50-69 range as Orange", () => {
    const grade = calculateAuditGrade({
      criticalCount: 2,
      warningCount: 4,
      pagesCrawled: 10,
    });
    expect(grade.score).toBeGreaterThanOrEqual(50);
    expect(grade.score).toBeLessThanOrEqual(69);
    expect(grade.category).toBe("orange");
  });

  it("grades severely broken sites in 0-49 range as Red", () => {
    const grade = calculateAuditGrade({
      criticalCount: 5,
      warningCount: 8,
      pagesCrawled: 5,
    });
    expect(grade.score).toBeLessThanOrEqual(49);
    expect(grade.category).toBe("red");
    expect(grade.letterGrade).toBe("F");
  });
});
