import { createFileRoute, Navigate } from "@tanstack/react-router";
import { promptExplorerSearchSchema } from "@/types/schemas/ai-search";

export const Route = createFileRoute("/_project/p/$projectId/prompt-explorer")({
  validateSearch: promptExplorerSearchSchema,
  component: PromptExplorerRoute,
});

function PromptExplorerRoute() {
  const { projectId } = Route.useParams();
  return (
    <Navigate
      to="/p/$projectId/brand-lookup"
      params={{ projectId }}
      search={{ q: undefined, c: undefined, scope: undefined }}
      replace
    />
  );
}
