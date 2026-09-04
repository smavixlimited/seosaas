import { createFileRoute } from "@tanstack/react-router";
import { LocalBusinessPage } from "@/client/features/local-business/LocalBusinessPage";

export const Route = createFileRoute("/_project/p/$projectId/local-business")({
  component: LocalBusinessRoute,
});

function LocalBusinessRoute() {
  const { projectId } = Route.useParams();
  return <LocalBusinessPage projectId={projectId} />;
}
