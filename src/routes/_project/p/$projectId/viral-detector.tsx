import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export const Route = createFileRoute("/_project/p/$projectId/viral-detector")({
  component: ViralDetectorRoute,
});

function ViralDetectorRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon icon="solar:fire-bold-duotone" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              Viral Content & Opportunity Detector
            </h1>
            <p className="text-xs text-base-content/60">
              Discover high-CTR angles, trending content hooks, and viral social
              patterns tailored to your brand.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center space-y-4 shadow-sm">
        <Icon
          icon="solar:magic-stick-3-bold-duotone"
          className="h-12 w-12 text-primary mx-auto animate-pulse"
        />
        <h3 className="text-lg font-bold text-base-content">
          Viral Content Intelligence
        </h3>
        <p className="text-xs text-base-content/60 max-w-md mx-auto">
          Scan competitor social proof, viral hook patterns, and trending search
          formats to generate high-converting content ideas.
        </p>
      </div>
    </div>
  );
}
