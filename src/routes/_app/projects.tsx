import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/projects")({
  beforeLoad: () => {
    throw redirect({
      to: "/my-brands",
    });
  },
  component: () => null,
});
