import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/_project/p/$projectId/competitors")({
  component: CompetitorsRoute,
});

function CompetitorsRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              className="h-6 w-6"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              Tracked Competitors
            </h1>
            <p className="text-xs text-base-content/60">
              Manage your benchmark competitors, website domains, and social
              media handles.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center space-y-4 shadow-sm">
        <Icon
          icon="solar:radar-bold-duotone"
          className="h-12 w-12 text-primary mx-auto opacity-80"
        />
        <h3 className="text-lg font-bold text-base-content">
          Competitors Directory
        </h3>
        <p className="text-xs text-base-content/60 max-w-md mx-auto">
          Add, edit, and organize competitor profiles and social links to track
          market share and run 1-on-1 strategy comparisons.
        </p>
      </div>
    </div>
  );
}
