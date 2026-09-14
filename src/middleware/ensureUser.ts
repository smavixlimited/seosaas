import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import type { EnsuredProject } from "@/middleware/ensure-user/types";
import { AppError } from "@/server/lib/errors";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";

function extractProjectId(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  // 1. Direct { projectId: "..." }
  if ("projectId" in data) {
    const projectId = (data as { projectId?: unknown }).projectId;
    if (typeof projectId === "string" && projectId.length > 0) {
      return projectId;
    }
  }

  // 2. Nested TanStack Start shape { data: { projectId: "..." } }
  if (
    "data" in data &&
    typeof (data as any).data === "object" &&
    (data as any).data !== null &&
    "projectId" in (data as any).data
  ) {
    const projectId = (data as { data: { projectId?: unknown } }).data
      .projectId;
    if (typeof projectId === "string" && projectId.length > 0) {
      return projectId;
    }
  }

  return null;
}

export const ensureUserMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next, data }) => {
  const context = await resolveUserContextFromHeaders(getRequest().headers);

  const projectId = extractProjectId(data);

  let project: EnsuredProject | undefined;

  if (projectId) {
    // ADR 0001 intentionally keeps project authorization here so every
    // project-scoped server function gets the same request-scoped org+project
    // check before handlers run. Function-level middleware narrows the type.
    project = await ProjectRepository.getProjectForOrganization(
      projectId,
      context.organizationId,
    );

    if (!project) {
      throw new AppError("NOT_FOUND");
    }
  }

  return next({
    context: {
      ...context,
      project,
    },
  });
});
