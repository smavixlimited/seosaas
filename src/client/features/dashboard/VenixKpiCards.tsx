import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface VenixKpiCardsProps {
  projectId: string;
  healthScore?: number | null;
  trackedKeywordsCount?: number;
  backlinksCount?: number;
  creditsRemaining?: number;
  creditsLimit?: number;
}

export function VenixKpiCards({
  projectId,
  healthScore = 92,
  trackedKeywordsCount = 1420,
  backlinksCount = 8920,
  creditsRemaining = 2450,
  creditsLimit = 2500,
}: VenixKpiCardsProps) {
  const creditsPercentage = creditsLimit > 0 ? Math.round((creditsRemaining / creditsLimit) * 100) : 100;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Site Health Score */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Icon icon="solar:shield-check-line-duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Site Health</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {healthScore !== null && healthScore !== undefined ? `${healthScore}/100` : "Good"}
              </h3>
            </div>
          </div>
          <span className="badge badge-success badge-sm rounded-lg font-extrabold text-[10px] text-white">
            +3.5%
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>0 Critical Crawl Errors</span>
          <Link
            to="/p/$projectId/audit"
            params={{ projectId }}
            className="font-bold text-primary hover:underline"
          >
            Audit details &rarr;
          </Link>
        </div>
      </div>

      {/* 2. Tracked Keywords & Positions */}
      <div className="card rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Icon icon="solar:chart-2-line-duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Ranked Keywords</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {trackedKeywordsCount.toLocaleString()}
              </h3>
            </div>
          </div>
          <span className="badge badge-info badge-sm rounded-lg font-extrabold text-[10px] text-white">
            Top 10: 42
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>+14 New in Top 20</span>
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
              <Icon icon="solar:link-circle-line-duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Total Backlinks</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {backlinksCount.toLocaleString()}
              </h3>
            </div>
          </div>
          <span className="badge badge-primary badge-sm rounded-lg font-extrabold text-[10px]">
            99% Live
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-base-200 pt-2.5 text-[11px] text-base-content/60">
          <span>18 New Referring Domains</span>
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
              <Icon icon="solar:bolt-circle-line-duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-base-content/60">Credits Balance</p>
              <h3 className="text-xl font-black text-base-content tracking-tight">
                {creditsRemaining.toLocaleString()}
              </h3>
            </div>
          </div>
          <span className="badge badge-warning badge-sm rounded-lg font-extrabold text-[10px]">
            {creditsPercentage}%
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t border-base-200 pt-2.5 text-[11px]">
          <div className="flex justify-between text-base-content/60">
            <span>{creditsRemaining} of {creditsLimit} credits</span>
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
