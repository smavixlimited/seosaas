import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getAuditLogsPaginatedServerFn } from "@/serverFunctions/security-audit";
import type { AuditLogEntry } from "@/services/security-audit.service";

export const Route = createFileRoute("/_admin/admin/audit-logs")({
  component: AdminAuditLogsPage,
});

function AdminAuditLogsPage() {
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);

  const logsQuery = useQuery({
    queryKey: ["adminAuditLogs", { search, action: actionFilter, page }],
    queryFn: () =>
      getAuditLogsPaginatedServerFn({
        data: {
          search: search || undefined,
          action: actionFilter,
          page,
          limit: 15,
        },
      }),
  });

  const data = logsQuery.data as { logs: AuditLogEntry[]; total: number; totalPages: number } | undefined;
  const logs: AuditLogEntry[] = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETED") || action.includes("BANNED")) return "bg-rose-500/10 text-rose-600";
    if (action.includes("UPDATED") || action.includes("ADJUSTED")) return "bg-indigo-500/10 text-indigo-600";
    if (action.includes("APPROVED")) return "bg-emerald-500/10 text-emerald-600";
    if (action.includes("IMPERSONATION")) return "bg-amber-500/10 text-amber-600";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            System Audit &amp; Activity Trail
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable log of all administrative actions, quota updates, security changes, and customer impersonations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Icon icon="solar:minimalistic-magnifer-line-duotone" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by admin email, action, target ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Administrative Actions</option>
            <option value="USER_QUOTA_ADJUSTED">USER_QUOTA_ADJUSTED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="IMPERSONATION_STARTED">IMPERSONATION_STARTED</option>
            <option value="SECURITY_POLICY_UPDATED">SECURITY_POLICY_UPDATED</option>
            <option value="API_KEY_UPDATED">API_KEY_UPDATED</option>
            <option value="BRANDING_UPDATED">BRANDING_UPDATED</option>
            <option value="MANUAL_PAYMENT_APPROVED">MANUAL_PAYMENT_APPROVED</option>
          </select>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Recorded Audit Trail ({total})
          </h5>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Actor (Admin)</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Entity</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {logsQuery.isLoading ? "Loading audit trail..." : "No matching audit logs found."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-100">
                      {log.adminEmail}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {log.targetId || "N/A"}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {log.metadata ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex"
                          title="View JSON Payload"
                        >
                          <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Metadata Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Audit Event Payload: {selectedLog.action}
              </h5>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs max-h-80 overflow-y-auto">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
