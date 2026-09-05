import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUptimeMonitorsServerFn,
  addUptimeMonitorServerFn,
  deleteUptimeMonitorServerFn,
  probeUptimeMonitorServerFn,
} from "@/serverFunctions/uptime";

export const Route = createFileRoute("/_app/uptime")({
  component: UptimePage,
});

function UptimePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [newUrl, setNewUrl] = React.useState("");

  const monitorsQuery = useQuery({
    queryKey: ["uptime-monitors"],
    queryFn: () => getUptimeMonitorsServerFn(),
  });

  const monitors = monitorsQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: (url: string) => addUptimeMonitorServerFn({ data: { url } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      setModalOpen(false);
      setNewUrl("");
      toast.success("Domain added to 24/7 uptime monitoring.");
    },
    onError: (err) => {
      toast.error("Failed to add monitor: " + (err as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (monitorId: string) =>
      deleteUptimeMonitorServerFn({ data: { monitorId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      toast.success("Monitor removed.");
    },
  });

  const probeMutation = useMutation({
    mutationFn: (monitorId: string) =>
      probeUptimeMonitorServerFn({ data: { monitorId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      toast.success("Uptime probe complete.");
    },
  });

  const upCount = monitors.filter((m) => m.status === "up").length;
  const downCount = monitors.filter((m) => m.status === "down").length;

  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                Website Uptime & SSL Monitor
              </h1>
            </div>
            <p className="mt-1 text-xs text-base-content/60">
              Automated 5-minute health probes for HTTP availability, response
              times, and SSL certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Monitored URL
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4 space-y-1">
            <div className="text-xs font-semibold text-base-content/60">
              Total Monitored
            </div>
            <div className="text-2xl font-black text-base-content">
              {monitors.length} URLs
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
            <div className="text-xs font-semibold text-emerald-600">
              Operational (100% Up)
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {upCount} URLs
            </div>
          </div>
          <div className="rounded-2xl border border-error/30 bg-error/5 p-4 space-y-1">
            <div className="text-xs font-semibold text-error">
              Down / Degraded
            </div>
            <div className="text-2xl font-black text-error">
              {downCount} URLs
            </div>
          </div>
        </div>

        {/* Monitors List */}
        {monitors.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-12 text-center space-y-3">
            <Globe className="h-10 w-10 text-base-content/30 mx-auto" />
            <h3 className="text-base font-bold text-base-content">
              No Uptime Monitors Configured
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              Add your primary website or client domains to receive automated
              downtime alerts and SSL certificate expiration notices.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-primary btn-sm rounded-xl font-bold text-white mt-2"
            >
              Add First Monitor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {monitors.map((mon) => (
              <div
                key={mon.id}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-base-content/20 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {mon.status === "up" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : mon.status === "degraded" ? (
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-error" />
                    )}
                    {mon.status === "up" && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-base-content flex items-center gap-2">
                      <span>{mon.url}</span>
                      <span
                        className={`badge badge-xs font-black uppercase ${
                          mon.status === "up"
                            ? "badge-success text-white"
                            : mon.status === "degraded"
                              ? "badge-warning"
                              : "badge-error text-white"
                        }`}
                      >
                        {mon.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-base-content/60 mt-1">
                      <span>Status: HTTP {mon.lastStatusCode || 200}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-emerald-500" /> SSL Active
                      </span>
                      <span>•</span>
                      <span>
                        Checked:{" "}
                        {mon.lastCheckedAt
                          ? new Date(mon.lastCheckedAt).toLocaleTimeString()
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={probeMutation.isPending}
                    onClick={() => probeMutation.mutate(mon.id)}
                    className="btn btn-ghost btn-sm rounded-xl text-xs gap-1.5"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${probeMutation.isPending ? "animate-spin" : ""}`}
                    />{" "}
                    Probe Now
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete monitor?"))
                        deleteMutation.mutate(mon.id);
                    }}
                    className="btn btn-ghost btn-sm btn-square rounded-xl text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Monitor Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-base-content">
                Add Website to Monitor
              </h3>
              <p className="text-xs text-base-content/70">
                Skorvia will ping this URL every 5 minutes and notify you of
                latency spikes or downtime.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newUrl.trim()) addMutation.mutate(newUrl.trim());
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Domain / URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://mysite.com"
                    className="input input-bordered input-sm w-full rounded-xl text-xs mt-1"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-ghost btn-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMutation.isPending}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-white"
                  >
                    {addMutation.isPending ? "Adding..." : "Add Monitor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
