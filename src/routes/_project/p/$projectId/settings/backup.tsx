import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  exportProjectBackup,
  restoreProjectBackup,
} from "@/serverFunctions/backup";
import type { ProjectBackupSnapshot } from "@/services/backup.service";

export const Route = createFileRoute("/_project/p/$projectId/settings/backup")({
  component: ProjectBackupSettingsPage,
});

function ProjectBackupSettingsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const exportMutation = useMutation({
    mutationFn: () => exportProjectBackup({ data: { projectId } }),
    onSuccess: (snapshot) => {
      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `skorvia_backup_${snapshot.project.domain || "project"}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Project backup snapshot downloaded successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate project backup");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (snapshot: ProjectBackupSnapshot) =>
      restoreProjectBackup({ data: { snapshot } }),
    onSuccess: (res) => {
      toast.success(
        `Successfully restored "${res.projectName}"! Redirecting...`,
      );
      void navigate({
        to: "/p/$projectId",
        params: { projectId: res.restoredProjectId },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to restore backup snapshot");
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as ProjectBackupSnapshot;
        if (!parsed.version || !parsed.project?.domain) {
          toast.error("Invalid backup snapshot file");
          return;
        }
        restoreMutation.mutate(parsed);
      } catch {
        toast.error("Failed to parse JSON backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary badge-sm font-bold text-xs">
            Zero Data Loss
          </span>
          <span className="text-xs text-base-content/50">
            Portable JSON Schema v1.0
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-base-content mt-1">
          Backup & Disaster Recovery
        </h1>
        <p className="text-xs text-base-content/60">
          Export full portable snapshots of your project metadata, context
          sections, key pages, and uptime monitors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Icon
                  icon="solar:download-square-bold-duotone"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-base-content">
                  Export Project Snapshot
                </h3>
                <p className="text-xs text-base-content/60">
                  Download complete project JSON bundle
                </p>
              </div>
            </div>
            <p className="text-xs text-base-content/70 mt-4 leading-relaxed">
              Includes domain setup, AI context memory, key target URLs, uptime
              configurations, and indexing logs. Portable across any Skorvia
              deployment.
            </p>
          </div>

          <button
            type="button"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
            className="btn btn-primary rounded-2xl font-bold text-white shadow-md shadow-primary/20 gap-2 mt-6 w-full"
          >
            <Icon icon="solar:disk-bold-duotone" className="h-4 w-4" />
            <span>
              {exportMutation.isPending
                ? "Generating Snapshot..."
                : "Download Backup Snapshot (.json)"}
            </span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Icon
                  icon="solar:upload-square-bold-duotone"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-base-content">
                  Restore from Snapshot
                </h3>
                <p className="text-xs text-base-content/60">
                  Import a previously exported JSON backup
                </p>
              </div>
            </div>
            <p className="text-xs text-base-content/70 mt-4 leading-relaxed">
              Upload a `.json` snapshot to recover project settings, context
              memory, and URL configurations into your active workspace.
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={restoreMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline rounded-2xl font-bold gap-2 mt-6 w-full hover:bg-base-200"
            >
              <Icon icon="solar:restart-bold-duotone" className="h-4 w-4" />
              <span>
                {restoreMutation.isPending
                  ? "Restoring Snapshot..."
                  : "Upload & Restore Snapshot"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Disaster Recovery Architecture Notice */}
      <div className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
        <h4 className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-2">
          <Icon
            icon="solar:shield-check-bold-duotone"
            className="h-4 w-4 text-emerald-500"
          />
          <span>Automated Cloud Disaster Recovery</span>
        </h4>
        <p className="text-xs text-base-content/70 mt-2 leading-relaxed">
          Skorvia Cloud automatically persists transactional write-ahead logs
          (WAL) and dual database replicas (Cloudflare D1 + PostgreSQL). Manual
          snapshots provide full air-gapped data portability and independent
          compliance archives.
        </p>
      </div>
    </div>
  );
}
