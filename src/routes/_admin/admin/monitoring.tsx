import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getLiveSystemMonitoringServerFn,
  getWebhookErrorLogsServerFn,
  retryWebhookDeliveryServerFn,
  resolveWebhookErrorServerFn,
} from "@/serverFunctions/system-monitoring";
import type { WebhookErrorRecord } from "@/services/system-monitoring.service";

export const Route = createFileRoute("/_admin/admin/monitoring")({
  component: AdminMonitoringPage,
});

function AdminMonitoringPage() {
  const queryClient = useQueryClient();

  const [providerFilter, setProviderFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [inspectingLog, setInspectingLog] = React.useState<WebhookErrorRecord | null>(null);

  const monitorQuery = useQuery({
    queryKey: ["adminSystemMonitoring"],
    queryFn: () => getLiveSystemMonitoringServerFn(),
    refetchInterval: 30000,
  });

  const webhooksQuery = useQuery({
    queryKey: ["adminWebhookErrors", { provider: providerFilter, status: statusFilter, search, page }],
    queryFn: () =>
      getWebhookErrorLogsServerFn({
        data: {
          provider: providerFilter,
          status: statusFilter,
          search: search || undefined,
          page,
          limit: 10,
        },
      }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => retryWebhookDeliveryServerFn({ data: { id } }),
    onSuccess: (res) => {
      toast.success(res.message);
      void queryClient.invalidateQueries({ queryKey: ["adminWebhookErrors"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to retry webhook");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => resolveWebhookErrorServerFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Webhook marked as resolved");
      void queryClient.invalidateQueries({ queryKey: ["adminWebhookErrors"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resolve error");
    },
  });

  const probes = monitorQuery.data?.probes ?? [];
  const kpis = monitorQuery.data?.kpis;
  const webhookData = webhooksQuery.data as { logs: WebhookErrorRecord[]; total: number; totalPages: number } | undefined;
  const webhookLogs = webhookData?.logs ?? [];
  const total = webhookData?.total ?? 0;
  const totalPages = webhookData?.totalPages ?? 1;

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            System Monitoring &amp; Infrastructure
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live round-trip latency diagnostics for 3rd-party dependencies, runtime KPIs, and webhook retries.
          </p>
        </div>

        <button
          type="button"
          disabled={monitorQuery.isFetching}
          onClick={() => void monitorQuery.refetch()}
          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Icon
            icon="solar:restart-bold"
            className={`h-4 w-4 ${monitorQuery.isFetching ? "animate-spin" : ""}`}
          />
          <span>{monitorQuery.isFetching ? "Probing..." : "Run Probes"}</span>
        </button>
      </div>

      {/* KPI Runtime Metric Cards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Process Memory (RSS)
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">
              {kpis.memoryRssMb} <span className="text-xs font-normal text-slate-500">MB</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Heap: {kpis.memoryHeapUsedMb} / {kpis.memoryHeapTotalMb} MB
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Server Uptime
            </div>
            <div className="text-xl font-bold text-primary font-mono mt-1">
              {Math.floor(kpis.uptimeSeconds / 3600)}h {Math.floor((kpis.uptimeSeconds % 3600) / 60)}m
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Continuous availability</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Database Engine
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Dual-DB Parity
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cloudflare D1 / Postgres</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Runtime Platform
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">
              {kpis.nodeVersion}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">OS: {kpis.platform}</div>
          </div>
        </div>
      )}

      {/* 3rd Party Dependency Latency Grid */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Dependency Health &amp; Latency</h5>
          <span className="text-xs text-slate-400">Auto-Refreshes every 30s</span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {probes.map((probe) => {
            const isOperational = probe.status === "operational";
            const isDegraded = probe.status === "degraded";

            return (
              <div
                key={probe.name}
                className="rounded-lg border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isOperational
                          ? "bg-emerald-500/10 text-emerald-600"
                          : isDegraded
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {probe.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      {probe.latencyMs}ms
                    </span>
                  </div>

                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{probe.name}</h6>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {probe.details || probe.endpoint}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-[10px] text-slate-400 font-mono truncate">
                  {probe.endpoint}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failed Webhooks Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">Failed Webhooks &amp; Inbound Error Logger</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit and re-dispatch failed payment, subscription, and sync webhooks.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search errors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 w-40 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            />
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Providers</option>
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="lemonsqueezy">LemonSqueezy</option>
              <option value="resend">Resend</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Provider &amp; Event</th>
                <th className="px-6 py-3">Failure Reason</th>
                <th className="px-6 py-3">HTTP Status</th>
                <th className="px-6 py-3">Retries</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {webhookLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    {webhooksQuery.isLoading ? "Loading logs..." : "No failed webhooks recorded."}
                  </td>
                </tr>
              ) : (
                webhookLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {log.provider}
                      </span>
                      <p className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-100 mt-1">
                        {log.event}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {log.errorMessage}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                      {log.responseStatus || 500}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                      {log.retryCount}/5
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => setInspectingLog(log)}
                        className="p-1 rounded text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Inspect Payload"
                      >
                        <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                      </button>
                      {log.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => retryMutation.mutate(log.id)}
                          disabled={retryMutation.isPending}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="Retry Webhook"
                        >
                          <Icon icon="solar:restart-bold" className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Payload Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Webhook Payload: {inspectingLog.provider} / {inspectingLog.event}
              </h5>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto">
              {inspectingLog.payloadJson}
            </pre>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
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
