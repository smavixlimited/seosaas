import { createFileRoute } from "@tanstack/react-router";
import { CompetitorsDirectory } from "@/client/features/competitors/CompetitorsDirectory";

export const Route = createFileRoute("/_project/p/$projectId/competitors")({
  component: CompetitorsRoute,
});

function CompetitorsRoute() {
  const { projectId } = Route.useParams();
  return <CompetitorsDirectory projectId={projectId} />;
}
