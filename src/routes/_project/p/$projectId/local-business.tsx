import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_project/p/$projectId/local-business")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/p/$projectId",
      params: { projectId: params.projectId },
      replace: true,
    });
  },
  component: () => null,
});
