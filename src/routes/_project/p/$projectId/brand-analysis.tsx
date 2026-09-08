import { createFileRoute } from "@tanstack/react-router";
import { BrandAnalysisPage } from "@/client/features/brand-analysis/BrandAnalysisPage";

export const Route = createFileRoute("/_project/p/$projectId/brand-analysis")({
  component: BrandAnalysisRoute,
});

function BrandAnalysisRoute() {
  const { projectId } = Route.useParams();
  return <BrandAnalysisPage projectId={projectId} />;
}
