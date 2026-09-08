import { createFileRoute } from "@tanstack/react-router";
import { ViralContentOpportunityDetector } from "@/client/features/viral-detector/ViralContentOpportunityDetector";

export const Route = createFileRoute("/_project/p/$projectId/viral-detector")({
  component: ViralDetectorRoute,
});

function ViralDetectorRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ViralContentOpportunityDetector projectId={projectId} />
    </div>
  );
}

