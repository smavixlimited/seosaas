import { useMemo, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import {
  exportIssues,
  exportPages,
  exportPerformance,
} from "@/client/features/audit/results/export";
import type { AuditResultsData } from "@/client/features/audit/results/types";
import { isLighthouseFailure } from "@/client/features/audit/results/AuditResultsTableFilterLogic";
import {
  IssuesView,
  resolveIssueSeverity,
} from "@/client/features/audit/results/IssuesView";
import { PagesTable } from "@/client/features/audit/results/PagesTable";
import {
  ExportDropdown,
  PerformanceTable,
} from "@/client/features/audit/results/ResultsTables";
import { BRAND_CONFIG } from "@/config/brand";
import {
  AUDIT_ISSUE_TYPES,
  getIssueDescriptor,
  type AuditIssueDescriptor,
} from "@/shared/audit-issues";
import { calculateAuditGrade } from "@/shared/audit-grading";

type ResultsTab = "issues" | "pages" | "performance";

export function ResultsView({
  projectId,
  data,
  onTabChange,
  tab,
}: {
  projectId: string;
  data: AuditResultsData;
  tab: string;
  onTabChange: (tab: ResultsTab) => void;
}) {
  const { audit, pages, lighthouse, issues } = data;
  const hasPerformanceTab = lighthouse.length > 0;
  const activeTab =
    tab === "performance" && !hasPerformanceTab ? "issues" : tab;
  const stats = useResultStats(pages, lighthouse);
  const blockedCount = useMemo(
    () => pages.filter((page) => page.fetchClass === "blocked").length,
    [pages],
  );

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const issue of issues) {
      counts[resolveIssueSeverity(issue)] += 1;
    }
    return counts;
  }, [issues]);

  const auditGrade = useMemo(() => {
    return calculateAuditGrade({
      issues,
      pagesCrawled: audit.pagesCrawled,
      lighthouseScores: lighthouse.map((l) => l.seoScore ?? l.performanceScore),
    });
  }, [issues, audit.pagesCrawled, lighthouse]);

  const failedIssueTypes = useMemo(
    () => new Set(issues.map((i) => i.issueType)),
    [issues],
  );

  const passedTests = useMemo(() => {
    return (
      Object.entries(AUDIT_ISSUE_TYPES) as [string, AuditIssueDescriptor][]
    )
      .filter(([typeKey]) => !failedIssueTypes.has(typeKey))
      .map(([typeKey, desc]) => ({
        typeKey,
        title: desc.title
          .replace(/^Missing /i, "Valid ")
          .replace(/^Broken /i, "Healthy ")
          .replace(/^Duplicate /i, "Unique ")
          .replace(/^Crawler was blocked/i, "Crawler Access Verified"),
        explanation: `Zero defects detected across all crawled pages. Site passes this technical SEO benchmark.`,
      }));
  }, [failedIssueTypes]);

  return (
    <>
      {/* 1. Interactive Screen View */}
      <div className="screen-only space-y-4">
        {blockedCount > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              <span className="font-medium">
                We were blocked on {blockedCount}{" "}
                {blockedCount === 1 ? "page" : "pages"}.
              </span>{" "}
              <span className="text-base-content/70">
                The site's bot protection challenged our crawler, so those pages
                couldn't be audited.
              </span>
            </p>
          </div>
        )}

        <StatsStrip
          pagesCrawled={audit.pagesCrawled}
          issues={issues}
          totalLighthouse={lighthouse.length}
          averageResponseMs={stats.averageResponseMs}
          lighthouseSummary={stats.lighthouseSummary}
          auditGrade={auditGrade}
        />

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <ResultsHeader
              issueCount={issues.length}
              pageCount={pages.length}
              lighthouseCount={lighthouse.length}
              hasPerformanceTab={hasPerformanceTab}
              activeTab={activeTab}
              onTabChange={onTabChange}
              onExport={(format) => {
                if (activeTab === "performance") {
                  exportPerformance(lighthouse, pages, format);
                  return;
                }
                if (activeTab === "issues") {
                  exportIssues(issues, format);
                  return;
                }
                exportPages(pages, format);
              }}
              onPrint={() => window.print()}
            />

            {activeTab === "issues" && (
              <IssuesView issues={issues} projectId={projectId} />
            )}
            {activeTab === "pages" && (
              <PagesTable
                pages={pages}
                startUrl={audit.startUrl}
                issues={issues}
              />
            )}
            {activeTab === "performance" && lighthouse.length > 0 && (
              <PerformanceTable
                auditId={audit.id}
                projectId={projectId}
                lighthouse={lighthouse}
                pages={pages}
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. Executive Print / PDF Export View (Clean White-Label Report) */}
      <div
        id="audit-printable-report"
        className="hidden print:block p-8 bg-white text-slate-900 space-y-8 font-sans"
      >
        {/* Executive Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="h-12 w-auto max-w-[160px] object-contain"
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-900">
                {BRAND_CONFIG.name} Search Intelligence
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Technical SEO Site Audit Report
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-bold font-mono text-slate-700">
                  Target URL: {audit.startUrl}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs"
                  style={{
                    backgroundColor:
                      auditGrade.category === "green"
                        ? "#ecfdf5"
                        : auditGrade.category === "orange"
                          ? "#fffbeb"
                          : "#fff1f2",
                    color:
                      auditGrade.category === "green"
                        ? "#047857"
                        : auditGrade.category === "orange"
                          ? "#b45309"
                          : "#be123c",
                    borderColor:
                      auditGrade.category === "green"
                        ? "#a7f3d0"
                        : auditGrade.category === "orange"
                          ? "#fde68a"
                          : "#fecdd3",
                  }}
                >
                  {auditGrade.score}% • Grade {auditGrade.letterGrade} (
                  {auditGrade.label})
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-1">
            <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px] uppercase tracking-wider">
              Status: Completed
            </div>
            <p className="font-semibold text-slate-700 pt-1">
              Date:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-[10px] text-slate-400">
              Audit ID: {audit.id.slice(0, 12)}
            </p>
          </div>
        </div>

        {/* Executive Scorecard */}
        <div className="grid grid-cols-6 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 print-break-inside-avoid">
          <div className="col-span-2 flex flex-col justify-center border-r border-slate-200 pr-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SEO Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-4xl font-black tabular-nums"
                style={{
                  color:
                    auditGrade.category === "green"
                      ? "#059669"
                      : auditGrade.category === "orange"
                        ? "#d97706"
                        : "#e11d48",
                }}
              >
                {auditGrade.score}%
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <span className="text-xs font-bold text-slate-700 mt-0.5">
              Grade {auditGrade.letterGrade} — {auditGrade.label}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
              {auditGrade.summary}
            </p>
          </div>

          <div className="col-span-4 grid grid-cols-4 gap-3 text-center pl-2">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Pages Crawled
              </p>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {audit.pagesCrawled}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-rose-500">
                Critical Issues
              </p>
              <p className="text-xl font-bold text-rose-600 mt-1">
                {severityCounts.critical}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-amber-500">
                Warnings
              </p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {severityCounts.warning}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Avg Latency
              </p>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {stats.averageResponseMs}ms
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Identified Issues (Need to Fix) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 print-break-inside-avoid">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span>Issues Requiring Action ({issues.length} total)</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Prioritized by Severity
            </span>
          </div>

          {issues.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold text-center print-break-inside-avoid">
              ✓ No technical SEO issues detected across crawled pages.
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, idx) => {
                const desc = getIssueDescriptor(issue.issueType);
                return (
                  <div
                    key={issue.id || idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 print-break-inside-avoid shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            issue.severity === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : issue.severity === "warning"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {desc?.title ||
                            issue.issueType
                              .replace(/[-_]+/g, " ")
                              .toUpperCase()}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500 truncate max-w-sm">
                        {issue.pageUrl}
                      </span>
                    </div>
                    {desc?.explanation && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {desc.explanation}
                      </p>
                    )}
                    {desc?.howToFix && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
                        <strong className="font-bold text-indigo-950">
                          Recommended Fix:{" "}
                        </strong>
                        {desc.howToFix}
                      </div>
                    )}
                    {issue.detailsJson && (
                      <p className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-150">
                        {issue.detailsJson}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Crawled Pages Inventory Table */}
        {pages.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 print-break-inside-avoid">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Crawled Pages Inventory ({pages.length} pages)</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                Live HTTP Status &amp; On-Page Health
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="p-2.5">URL</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5 text-center">H1</th>
                    <th className="p-2.5 text-center">Words</th>
                    <th className="p-2.5 text-center">Missing Alt</th>
                    <th className="p-2.5 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pages.map((p, idx) => (
                    <tr key={p.id || idx} className="print-break-inside-avoid">
                      <td className="p-2.5 font-mono text-[11px] max-w-xs truncate text-slate-900 font-semibold">
                        {p.url}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            (p.statusCode ?? 200) < 300
                              ? "bg-emerald-100 text-emerald-800"
                              : (p.statusCode ?? 200) < 400
                                ? "bg-blue-100 text-blue-800"
                                : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.statusCode ?? "200"}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs truncate text-[11px]">
                        {p.title || "<Missing Title>"}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {p.h1Count}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {p.wordCount ?? 0}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {(p.imagesMissingAlt ?? 0) > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {p.imagesMissingAlt}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-500">
                        {p.responseTimeMs ?? 0}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Performance & Core Web Vitals Table */}
        {lighthouse.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 print-break-inside-avoid">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span>
                  Performance &amp; Core Web Vitals ({lighthouse.length} tested)
                </span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                Lighthouse Audit Scores
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="p-2.5">Page URL</th>
                    <th className="p-2.5 text-center">Device</th>
                    <th className="p-2.5 text-center">Performance</th>
                    <th className="p-2.5 text-center">SEO Score</th>
                    <th className="p-2.5 text-center">Accessibility</th>
                    <th className="p-2.5 text-center">LCP</th>
                    <th className="p-2.5 text-center">CLS</th>
                    <th className="p-2.5 text-right">TTFB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {lighthouse.map((lh, idx) => (
                    <tr key={lh.id || idx} className="print-break-inside-avoid">
                      <td className="p-2.5 max-w-xs truncate text-slate-900 font-sans font-semibold">
                        {pages.find((p) => p.id === lh.pageId)?.url ||
                          lh.pageId}
                      </td>
                      <td className="p-2.5 text-center uppercase text-[10px] font-bold text-slate-500">
                        {lh.strategy}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        <span
                          className={
                            lh.performanceScore && lh.performanceScore >= 80
                              ? "text-emerald-600"
                              : lh.performanceScore && lh.performanceScore >= 50
                                ? "text-amber-600"
                                : "text-rose-600"
                          }
                        >
                          {lh.performanceScore ?? "-"}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">
                        {lh.seoScore ?? "-"}
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">
                        {lh.accessibilityScore ?? "-"}
                      </td>
                      <td className="p-2.5 text-center">
                        {lh.lcpMs ? `${lh.lcpMs}ms` : "-"}
                      </td>
                      <td className="p-2.5 text-center">
                        {lh.cls != null ? lh.cls.toFixed(2) : "-"}
                      </td>
                      <td className="p-2.5 text-right text-slate-500">
                        {lh.ttfbMs ? `${lh.ttfbMs}ms` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Passed Technical SEO Benchmarks */}
        {passedTests.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 print-break-inside-avoid">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>
                  Passed Technical SEO Benchmarks ({passedTests.length} tests)
                </span>
              </h2>
              <span className="text-xs text-emerald-700 font-semibold">
                Verified Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {passedTests.map((test) => (
                <div
                  key={test.typeKey}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-start gap-2.5 print-break-inside-avoid"
                >
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {test.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {test.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Footer */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-400 print-break-inside-avoid">
          <p>
            © {new Date().getFullYear()}{" "}
            {BRAND_CONFIG.legalName || BRAND_CONFIG.name} • Confidential Client
            Deliverable
          </p>
          <p>
            Generated by {BRAND_CONFIG.name} Intelligence • {BRAND_CONFIG.url}
          </p>
        </div>
      </div>
    </>
  );
}

function useResultStats(
  pages: AuditResultsData["pages"],
  lighthouse: AuditResultsData["lighthouse"],
) {
  const averageResponseMs = useMemo(() => {
    if (pages.length === 0) return 0;
    const total = pages.reduce(
      (sum: number, page: AuditResultsData["pages"][number]) =>
        sum + (page.responseTimeMs ?? 0),
      0,
    );
    return Math.round(total / pages.length);
  }, [pages]);

  const lighthouseSummary = useMemo(() => {
    const failed = lighthouse.filter(
      (row: AuditResultsData["lighthouse"][number]) => isLighthouseFailure(row),
    ).length;
    const successful = lighthouse.filter(
      (row: AuditResultsData["lighthouse"][number]) =>
        !isLighthouseFailure(row),
    );
    const averageScore = (
      key: "performanceScore" | "seoScore" | "accessibilityScore",
    ) => {
      const values = successful
        .map((row: AuditResultsData["lighthouse"][number]) => row[key])
        .filter((value: number | null): value is number => value != null);
      if (values.length === 0) return null;
      const total = values.reduce((sum: number, value) => sum + value, 0);
      return Math.round(total / values.length);
    };

    return {
      failed,
      avgPerformance: averageScore("performanceScore"),
      avgSeo: averageScore("seoScore"),
      avgAccessibility: averageScore("accessibilityScore"),
    };
  }, [lighthouse]);

  return { averageResponseMs, lighthouseSummary };
}

function ResultsHeader({
  issueCount,
  pageCount,
  lighthouseCount,
  hasPerformanceTab,
  activeTab,
  onTabChange,
  onExport,
  onPrint,
}: {
  issueCount: number;
  pageCount: number;
  lighthouseCount: number;
  hasPerformanceTab: boolean;
  activeTab: string;
  onTabChange: (tab: ResultsTab) => void;
  onExport: (format: "csv" | "json" | "sheets") => void;
  onPrint: () => void;
}) {
  const tabs: Array<{ tab: ResultsTab; label: string }> = [
    { tab: "issues", label: `Issues (${issueCount})` },
    { tab: "pages", label: `Pages (${pageCount})` },
    ...(hasPerformanceTab
      ? [
          {
            tab: "performance" as const,
            label: `Performance (${lighthouseCount})`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div role="tablist" className="tabs tabs-border w-fit">
        {tabs.map(({ label, tab }) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab ${isActive ? "tab-active" : ""}`}
              onClick={() => onTabChange(tab)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="btn btn-sm btn-outline rounded-xl font-bold gap-1.5 text-xs text-base-content/80 hover:text-base-content"
          title="Print or Save as PDF"
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Export / Print PDF</span>
        </button>
        <ExportDropdown onExport={onExport} />
      </div>
    </div>
  );
}

interface StatItem {
  label: string;
  value: string;
  valueClass?: string;
  sub?: ReactNode;
}

function StatsStrip({
  pagesCrawled,
  issues,
  totalLighthouse,
  averageResponseMs,
  lighthouseSummary,
  auditGrade,
}: {
  pagesCrawled: number;
  issues: AuditResultsData["issues"];
  totalLighthouse: number;
  averageResponseMs: number;
  lighthouseSummary: {
    failed: number;
    avgPerformance: number | null;
    avgSeo: number | null;
    avgAccessibility: number | null;
  };
  auditGrade: ReturnType<typeof calculateAuditGrade>;
}) {
  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const issue of issues) {
      counts[resolveIssueSeverity(issue)] += 1;
    }
    return counts;
  }, [issues]);

  const items: StatItem[] = [
    {
      label: "SEO Health Score",
      value: `${auditGrade.score}%`,
      valueClass: auditGrade.textClass + " font-black",
      sub: (
        <span className="font-bold text-xs">
          Grade {auditGrade.letterGrade} • {auditGrade.label}
        </span>
      ),
    },
    { label: "Pages crawled", value: String(pagesCrawled) },
    {
      label: "Issues found",
      value: String(issues.length),
      valueClass: issues.length === 0 ? "text-success" : "",
      sub: issues.length > 0 && (
        <span className="flex items-center gap-2.5">
          <SeverityCount count={severityCounts.critical} dotClass="bg-error" />
          <SeverityCount count={severityCounts.warning} dotClass="bg-warning" />
          <SeverityCount
            count={severityCounts.info}
            dotClass="bg-base-content/30"
          />
        </span>
      ),
    },
    { label: "Avg response", value: `${averageResponseMs}ms` },
  ];

  if (totalLighthouse > 0) {
    items.push(
      { label: "Lighthouse tests", value: String(totalLighthouse) },
      {
        label: "Avg Lighthouse perf",
        value:
          lighthouseSummary.avgPerformance == null
            ? "-"
            : String(lighthouseSummary.avgPerformance),
        valueClass: scoreClass(lighthouseSummary.avgPerformance),
      },
      {
        label: "Avg Lighthouse SEO",
        value:
          lighthouseSummary.avgSeo == null
            ? "-"
            : String(lighthouseSummary.avgSeo),
        valueClass: scoreClass(lighthouseSummary.avgSeo),
      },
      {
        label: "Avg Lighthouse a11y",
        value:
          lighthouseSummary.avgAccessibility == null
            ? "-"
            : String(lighthouseSummary.avgAccessibility),
        valueClass: scoreClass(lighthouseSummary.avgAccessibility),
      },
      {
        label: "Lighthouse failures",
        value: String(lighthouseSummary.failed),
        valueClass:
          lighthouseSummary.failed > 0 ? "text-error" : "text-success",
      },
    );
  }

  const columnsClass =
    items.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <div
      className={`grid ${columnsClass} gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden`}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-base-100 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-base-content/50">
            {item.label}
          </p>
          <p
            className={`text-xl font-semibold mt-0.5 tabular-nums ${item.valueClass ?? ""}`}
          >
            {item.value}
          </p>
          {item.sub && (
            <div className="text-xs text-base-content/60 mt-1">{item.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function SeverityCount({
  count,
  dotClass,
}: {
  count: number;
  dotClass: string;
}) {
  if (count === 0) return null;
  return (
    <span className="flex items-center gap-1 tabular-nums">
      <span className={`size-1.5 rounded-full ${dotClass}`} />
      {count}
    </span>
  );
}

function scoreClass(score: number | null) {
  if (score == null) return "";
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}
