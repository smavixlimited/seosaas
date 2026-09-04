import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/_project/p/$projectId/my-analysis")({
  component: MyAnalysisRoute,
});

function MyAnalysisRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon icon="solar:document-text-bold-duotone" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              My Analysis Archive
            </h1>
            <p className="text-xs text-base-content/60">
              Access and export all your historical Brand Analyses, Competitor Benchmarks, and Ad Readiness Reports.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center space-y-4 shadow-sm">
        <Icon icon="solar:folder-with-files-bold-duotone" className="h-12 w-12 text-primary mx-auto" />
        <h3 className="text-lg font-bold text-base-content">Comprehensive Report Archive</h3>
        <p className="text-xs text-base-content/60 max-w-md mx-auto">
          View, organize in categorized tabs (Brand Analysis, Competitor Analysis, Competitor Ads), and export presentation-ready PDF reports.
        </p>
      </div>
    </div>
  );
}
