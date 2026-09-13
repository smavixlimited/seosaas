import { createFileRoute } from "@tanstack/react-router";
import { AdvancedAnalyticsPage } from "@/client/features/advanced-analytics/AdvancedAnalyticsPage";

export const Route = createFileRoute(
  "/_project/p/$projectId/advanced-analytics",
)({
  component: AdvancedAnalyticsRoute,
});

function AdvancedAnalyticsRoute() {
  const { projectId } = Route.useParams();
  return <AdvancedAnalyticsPage projectId={projectId} />;
}
