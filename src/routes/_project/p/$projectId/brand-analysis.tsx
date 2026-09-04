import { createFileRoute } from "@tanstack/react-router";
import { ConversionReadinessPage } from "@/client/features/conversion-readiness/ConversionReadinessPage";

export const Route = createFileRoute("/_project/p/$projectId/brand-analysis")({
  component: BrandAnalysisRoute,
});

function BrandAnalysisRoute() {
  const { projectId } = Route.useParams();
  return <ConversionReadinessPage projectId={projectId} />;
}
