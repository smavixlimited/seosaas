import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface VenixKpiCardsProps {
  projectId: string;
  audit?: {
    status: "running" | "completed" | "failed";
    pagesCrawled: number;
    totalIssueTypes: number;
    topIssues: { severity: "critical" | "warning" | "info"; count: number }[];
  } | null;
  rankSummary?: {
    trackedKeywords: number;
    top10: number;
    improved: number;
    declined: number;
  } | null;
  backlinks?: {
    backlinks: number | null;
    referringDomains: number | null;
    rank: number | null;
  } | null;
  creditsRemaining?: number;
  creditsLimit?: number;
}

export function VenixKpiCards({
  projectId,
  audit,
  rankSummary,
  backlinks,
  creditsRemaining = 500,
  creditsLimit = 500,
}: VenixKpiCardsProps) {
  const creditsPercentage =
    creditsLimit > 0
      ? Math.min(100, Math.round((creditsRemaining / creditsLimit) * 100))
      : 100;

  const criticalIssuesCount =
    audit?.topIssues
      ?.filter((i) => i.severity === "critical")
      .reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  const hasAudit = audit !== null && audit !== undefined;
  const healthScore = hasAudit
    ? Math.max(10, Math.min(100, 100 - audit.totalIssueTypes * 8 - criticalIssuesCount * 5))
    : null;

  const trackedKeywords = rankSummary?.trackedKeywords ?? 0;
  const top10Keywords = rankSummary?.top10 ?? 0;
  const totalBacklinks = backlinks?.backlinks ?? 0;
  const referringDomains = backlinks?.referringDomains ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Site Health Score */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Icon icon="icon-park-outline:protect" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Site Health</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {healthScore !== null ? `${healthScore}/100` : "Ready to scan"}
              </h3>
            </div>
          </div>
          {hasAudit && (
            <span className={`badge badge-sm rounded-lg font-extrabold text-[10px] ${
              healthScore && healthScore >= 80 ? "badge-success text-white" : "badge-warning"
            }`}>
              {audit.status === "completed" ? "Verified" : audit.status}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>
            {hasAudit
              ? `${criticalIssuesCount} critical issue${criticalIssuesCount === 1 ? "" : "s"}`
              : "0 audits completed"}
          </span>
          <Link
            to="/p/$projectId/audit"
            params={{ projectId }}
            className="font-bold text-primary hover:underline"
          >
            {hasAudit ? "Audit Details" : "Run Audit"}
          </Link>
        </div>
      </div>

      {/* 2. Tracked Keywords & Positions */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Icon icon="icon-park-outline:chart-line" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Tracked Keywords</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {trackedKeywords > 0 ? trackedKeywords.toLocaleString() : "0 active"}
              </h3>
            </div>
          </div>
          {top10Keywords > 0 && (
            <span className="badge badge-info badge-sm rounded-lg font-extrabold text-[10px] text-white">
              Top 10: {top10Keywords}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>
            {trackedKeywords > 0
              ? `${top10Keywords} on Page 1`
              : "Discover keyword leaks"}
          </span>
          <Link
            to="/p/$projectId/keywords"
            params={{ projectId }}
            className="font-bold text-primary hover:underline"
          >
            Research &rarr;
          </Link>
        </div>
      </div>

      {/* 3. Total Backlinks Profile */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Icon icon="icon-park-outline:link-one" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Backlinks Index</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {totalBacklinks > 0 ? totalBacklinks.toLocaleString() : "0 detected"}
              </h3>
            </div>
          </div>
          {referringDomains > 0 && (
            <span className="badge badge-primary badge-sm rounded-lg font-extrabold text-[10px]">
              {referringDomains} Ref Domains
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>
            {referringDomains > 0
              ? `${referringDomains} referring domains`
              : "Analyze authority profile"}
          </span>
          <Link
            to="/p/$projectId/backlinks"
            params={{ projectId }}
            className="font-bold text-primary hover:underline"
          >
            Explore &rarr;
          </Link>
        </div>
      </div>

      {/* 4. Monthly Credits Balance */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Icon icon="icon-park-outline:lightning" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Credits Balance</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {creditsRemaining.toLocaleString()}
              </h3>
            </div>
          </div>
          <span className={`badge badge-sm rounded-lg font-extrabold text-[10px] ${
            creditsRemaining < 100 ? "badge-error text-white" : "badge-warning"
          }`}>
            {creditsPercentage}%
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t border-base-200 pt-2.5 text-[11px]">
          <div className="flex justify-between text-base-content/60">
            <span>{creditsRemaining.toLocaleString()} of {creditsLimit.toLocaleString()} credits</span>
            <Link to="/billing" className="font-bold text-primary hover:underline">
              Top up &rarr;
            </Link>
          </div>
          <progress
            className="progress progress-primary w-full h-1.5 rounded-full"
            value={creditsRemaining}
            max={creditsLimit}
          />
        </div>
      </div>
    </div>
  );
}
