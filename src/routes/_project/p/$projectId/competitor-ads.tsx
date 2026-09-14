import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CompetitorAdLibrary } from "@/client/features/competitors/CompetitorAdLibrary";

export const Route = createFileRoute("/_project/p/$projectId/competitor-ads")({
  validateSearch: (search: Record<string, unknown>): { domain?: string } => ({
    domain: typeof search.domain === "string" ? search.domain : undefined,
  }),
  component: CompetitorAdsRoute,
});

function CompetitorAdsRoute() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
              Competitor Ad Spying
            </h1>
            <span className="badge badge-primary badge-sm font-bold">
              Multi-Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Spy on winning Meta, Google, TikTok, and LinkedIn ad creatives from
            any competitor with zero user ad accounts needed.
          </p>
        </div>
      </div>

      <CompetitorAdLibrary
        projectId={projectId}
        initialDomain={search.domain || ""}
      />
    </div>
  );
}
