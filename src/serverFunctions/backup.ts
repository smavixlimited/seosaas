import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import {
  BackupService,
  type ProjectBackupSnapshot,
} from "@/services/backup.service";

const exportSnapshotSchema = z.object({
  projectId: z.string().min(1),
});

const restoreSnapshotSchema = z.object({
  snapshot: z.custom<ProjectBackupSnapshot>(),
});

export const exportProjectBackup = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(exportSnapshotSchema)
  .handler(async ({ data }) => {
    return BackupService.createProjectBackupSnapshot(data.projectId);
  });

export const restoreProjectBackup = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(restoreSnapshotSchema)
  .handler(async ({ data, context }) => {
    return BackupService.restoreProjectBackupSnapshot(
      data.snapshot,
      context.userId,
      context.organizationId,
    );
  });
