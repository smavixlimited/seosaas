import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { ViralContentOpportunityDetector } from "@/client/features/viral-detector/ViralContentOpportunityDetector";

export const Route = createFileRoute("/_project/p/$projectId/viral-detector")({
  component: ViralDetectorRoute,
});

function ViralDetectorRoute() {
  const { projectId } = Route.useParams();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shadow-xs">
            <Icon icon="solar:fire-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              Viral Content &amp; Opportunity Detector
            </h1>
            <p className="text-xs text-base-content/60 font-medium">
              Discover high-converting opening hooks, trending video formats, and export to your roadmap.
            </p>
          </div>
        </div>
      </div>

      <ViralContentOpportunityDetector projectId={projectId} />
    </div>
  );
}
