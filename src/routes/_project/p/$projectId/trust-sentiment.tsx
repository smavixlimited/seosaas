import { createFileRoute } from "@tanstack/react-router";
import { BrandMentionsPage } from "@/client/features/brand-mentions/BrandMentionsPage";

export const Route = createFileRoute("/_project/p/$projectId/trust-sentiment")({
  component: TrustSentimentRoute,
});

function TrustSentimentRoute() {
  const { projectId } = Route.useParams();
  return <BrandMentionsPage projectId={projectId} />;
}
