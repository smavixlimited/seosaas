import { createFileRoute } from "@tanstack/react-router";
import { TrendsRadarPage } from "@/client/features/trends-radar/TrendsRadarPage";

export const Route = createFileRoute("/_project/p/$projectId/trends-radar")({
  component: TrendsRadarRoute,
});

function TrendsRadarRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TrendsRadarPage projectId={projectId} />
    </div>
  );
}
