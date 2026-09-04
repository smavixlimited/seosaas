import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { AudienceTrustPreAdGate } from "@/client/features/trust-sentiment/AudienceTrustPreAdGate";

export const Route = createFileRoute("/_project/p/$projectId/trust-sentiment")({
  component: TrustSentimentRoute,
});

function TrustSentimentRoute() {
  const { projectId } = Route.useParams();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Icon icon="solar:shield-check-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              Audience Trust &amp; Pre-Ad Gate
            </h1>
            <p className="text-xs text-base-content/60 font-medium">
              Verify customer sentiment, risk alerts, and trust signals before spending ad budget.
            </p>
          </div>
        </div>
      </div>

      <AudienceTrustPreAdGate projectId={projectId} />
    </div>
  );
}
