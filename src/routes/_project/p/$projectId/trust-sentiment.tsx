import { createFileRoute } from "@tanstack/react-router";
import { AudienceTrustPreAdGate } from "@/client/features/trust-sentiment/AudienceTrustPreAdGate";

export const Route = createFileRoute("/_project/p/$projectId/trust-sentiment")({
  component: TrustSentimentRoute,
});

function TrustSentimentRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AudienceTrustPreAdGate projectId={projectId} />
    </div>
  );
}

