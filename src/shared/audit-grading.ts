/**
 * Standardized SEO & Technical Audit Grading System
 *
 * Thresholds:
 * - 70% and above (70 - 100): GREEN (Good / Excellent)
 * - 50% to 69% (50 - 69): ORANGE (Fair / Minor Optimizations Needed)
 * - 49% and below (0 - 49): RED (Critical Action Required)
 */

interface AuditGradeInfo {
  score: number; // 0 to 100
  letterGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  label: string;
  category: "green" | "orange" | "red";
  colorHex: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  summary: string;
}

export function calculateAuditGrade(params: {
  issues?: Array<{ severity?: string }>;
  pagesCrawled?: number;
  criticalCount?: number;
  warningCount?: number;
  infoCount?: number;
  lighthouseScores?: Array<number | null | undefined>;
}): AuditGradeInfo {
  const issues = params.issues ?? [];
  const pagesCrawled = Math.max(1, params.pagesCrawled ?? 1);

  let criticalCount = params.criticalCount ?? 0;
  let warningCount = params.warningCount ?? 0;
  let infoCount = params.infoCount ?? 0;

  if (issues.length > 0 && !params.criticalCount && !params.warningCount) {
    for (const issue of issues) {
      const sev = issue.severity?.toLowerCase();
      if (sev === "critical" || sev === "error" || sev === "high") {
        criticalCount++;
      } else if (sev === "warning" || sev === "medium") {
        warningCount++;
      } else {
        infoCount++;
      }
    }
  }

  // Base score starts at 100
  let rawScore = 100;

  // Weighted penalties normalized to site crawl size
  const criticalPenalty = Math.min(
    60,
    criticalCount *
      (pagesCrawled === 1
        ? 22
        : Math.max(5, Math.round(30 / Math.sqrt(pagesCrawled)))),
  );
  const warningPenalty = Math.min(
    30,
    warningCount *
      (pagesCrawled === 1
        ? 8
        : Math.max(2, Math.round(15 / Math.sqrt(pagesCrawled)))),
  );
  const infoPenalty = Math.min(10, infoCount * 0.5);

  rawScore -= criticalPenalty + warningPenalty + infoPenalty;

  // Optional Lighthouse score integration if available
  if (params.lighthouseScores && params.lighthouseScores.length > 0) {
    const validScores = params.lighthouseScores.filter(
      (s): s is number => s != null && !isNaN(s),
    );
    if (validScores.length > 0) {
      const avgLh =
        validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length;
      // Blend 80% crawler technical audit + 20% lighthouse core web vitals
      rawScore = Math.round(rawScore * 0.8 + avgLh * 0.2);
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Determine Grade, Label & User-Specified Color Rules:
  // >= 70: GREEN
  // 50 to 69: ORANGE
  // <= 49: RED
  let letterGrade: AuditGradeInfo["letterGrade"] = "F";
  let label = "Critical Action Required";
  let category: AuditGradeInfo["category"] = "red";
  let colorHex = "#e11d48"; // Rose / Red
  let badgeClass =
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  let textClass = "text-rose-600 dark:text-rose-400";
  let bgClass = "bg-rose-500";
  let borderClass = "border-rose-500";
  let summary =
    "Severe technical defects detected. Immediate crawler optimization required.";

  if (score >= 70) {
    category = "green";
    colorHex = "#10b981"; // Emerald / Green
    badgeClass =
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    textClass = "text-emerald-600 dark:text-emerald-400";
    bgClass = "bg-emerald-500";
    borderClass = "border-emerald-500";

    if (score >= 90) {
      letterGrade = "A+";
      label = "Excellent SEO Health";
      summary =
        "Website exhibits excellent technical search compliance with minimal or zero blockers.";
    } else if (score >= 80) {
      letterGrade = "A";
      label = "Great SEO Health";
      summary = "Strong technical foundation with minor non-blocking items.";
    } else {
      letterGrade = "B";
      label = "Good Technical Standing";
      summary =
        "Solid baseline health with a few manageable optimization opportunities.";
    }
  } else if (score >= 50) {
    category = "orange";
    colorHex = "#f59e0b"; // Amber / Orange
    badgeClass =
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    textClass = "text-amber-600 dark:text-amber-400";
    bgClass = "bg-amber-500";
    borderClass = "border-amber-500";

    if (score >= 60) {
      letterGrade = "C";
      label = "Moderate SEO Health";
      summary =
        "Noticeable technical issues impacting crawl efficiency and search indexing.";
    } else {
      letterGrade = "D";
      label = "Needs Optimization";
      summary = "Multiple critical warnings or crawling roadblocks detected.";
    }
  } else {
    // 0 - 49: RED
    category = "red";
    letterGrade = "F";
    label = "Critical Action Required";
  }

  return {
    score,
    letterGrade,
    label,
    category,
    colorHex,
    badgeClass,
    textClass,
    bgClass,
    borderClass,
    summary,
  };
}
