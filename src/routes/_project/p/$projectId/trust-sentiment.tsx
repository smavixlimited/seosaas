import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_project/p/$projectId/trust-sentiment")({
  component: TrustSentimentRoute,
});

function TrustSentimentRoute() {
  const { projectId } = Route.useParams();
  return (
    <Navigate
      to="/p/$projectId/brand-analysis"
      params={{ projectId }}
      replace
    />
  );
}
