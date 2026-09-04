import { createFileRoute } from "@tanstack/react-router";
import { BrandMentionsPage } from "@/client/features/brand-mentions/BrandMentionsPage";

export const Route = createFileRoute("/_project/p/$projectId/brand-mentions")({
  component: BrandMentionsRoute,
});

function BrandMentionsRoute() {
  const { projectId } = Route.useParams();
  return <BrandMentionsPage projectId={projectId} />;
}
