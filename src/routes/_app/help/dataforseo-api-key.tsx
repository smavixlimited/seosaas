import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/help/dataforseo-api-key")({
  beforeLoad: () => {
    throw redirect({ to: "/docs" });
  },
  component: () => null,
});
