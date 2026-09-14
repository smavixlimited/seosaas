import { createFileRoute } from "@tanstack/react-router";
import { ContentEngineStudio } from "@/client/features/content-engine/ContentEngineStudio";

export const Route = createFileRoute("/_project/p/$projectId/content-engine")({
  component: ContentEngineRoute,
});

function ContentEngineRoute() {
  const { projectId } = Route.useParams();
  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl">
        <ContentEngineStudio projectId={projectId} />
      </div>
    </div>
  );
}
