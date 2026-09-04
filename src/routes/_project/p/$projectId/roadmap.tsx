import { createFileRoute } from "@tanstack/react-router";
import { RoadmapPage } from "@/client/features/roadmap/RoadmapPage";

export const Route = createFileRoute("/_project/p/$projectId/roadmap")({
  component: RoadmapRoute,
});

function RoadmapRoute() {
  const { projectId } = Route.useParams();
  return <RoadmapPage projectId={projectId} />;
}
