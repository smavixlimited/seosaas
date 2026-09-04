import { createFileRoute } from "@tanstack/react-router";
import { ConversionReadinessPage } from "@/client/features/conversion-readiness/ConversionReadinessPage";

export const Route = createFileRoute("/_project/p/$projectId/ad-readiness")({
  component: ConversionReadinessRoute,
});

function ConversionReadinessRoute() {
  const { projectId } = Route.useParams();
  return <ConversionReadinessPage projectId={projectId} />;
}
