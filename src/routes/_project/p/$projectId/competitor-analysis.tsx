import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CompetitorAnalysisDecoder } from "@/client/features/competitors/CompetitorAnalysisDecoder";

const competitorAnalysisSearchSchema = z.object({
  domain: z.string().optional().default(""),
});

export const Route = createFileRoute(
  "/_project/p/$projectId/competitor-analysis",
)({
  validateSearch: (search: Record<string, unknown>): { domain?: string } => ({
    domain: typeof search.domain === "string" ? search.domain : undefined,
  }),
  component: CompetitorAnalysisRoute,
});

function CompetitorAnalysisRoute() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <CompetitorAnalysisDecoder
      projectId={projectId}
      initialDomain={search.domain || ""}
    />
  );
}
