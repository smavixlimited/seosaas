import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Globe,
  Lock,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  Trash2,
  XCircle,
  Mail,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUptimeMonitorsServerFn,
  addUptimeMonitorServerFn,
  updateMonitorReminderServerFn,
  deleteUptimeMonitorServerFn,
  probeUptimeMonitorServerFn,
  triggerSslExpiryCheckServerFn,
} from "@/serverFunctions/uptime";

export const Route = createFileRoute("/_app/uptime")({
  component: UptimePage,
});

interface MonitorItem {
  id: string;
  userId: string;
  projectId?: string | null;
  url: string;
  status: "up" | "down" | "degraded";
  lastCheckedAt?: string | null;
  lastStatusCode?: number | null;
  sslExpiresAt?: string | null;
  reminderFrequency?: "weekly" | "ssl_expiry" | "both" | "none";
  reminderEmail?: string | null;
  lastReminderSentAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

function UptimePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [reminderModalOpen, setReminderModalOpen] = React.useState(false);
  const [selectedMonitor, setSelectedMonitor] = React.useState<MonitorItem | null>(null);

  // Add Monitor Form
  const [newUrl, setNewUrl] = React.useState("");
  const [newReminderFrequency, setNewReminderFrequency] = React.useState<
    "weekly" | "ssl_expiry" | "both" | "none"
  >("both");
  const [newReminderEmail, setNewReminderEmail] = React.useState("");

  // Edit Reminder Form
  const [editFrequency, setEditFrequency] = React.useState<
    "weekly" | "ssl_expiry" | "both" | "none"
  >("both");
  const [editEmail, setEditEmail] = React.useState("");

  const monitorsQuery = useQuery({
    queryKey: ["uptime-monitors"],
    queryFn: () => getUptimeMonitorsServerFn() as Promise<MonitorItem[]>,
  });

  const monitors = monitorsQuery.data ?? [];

  const addMutation = useMutation({
    mutationFn: () =>
      addUptimeMonitorServerFn({
        data: {
          url: newUrl.trim(),
          reminderFrequency: newReminderFrequency,
          reminderEmail: newReminderEmail.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      setModalOpen(false);
      setNewUrl("");
      setNewReminderEmail("");
      toast.success("Domain added with automated 24/7 uptime & SSL monitoring.");
    },
    onError: (err) => {
      toast.error("Failed to add monitor: " + (err as Error).message);
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: () => {
      if (!selectedMonitor) throw new Error("No monitor selected");
      return updateMonitorReminderServerFn({
        data: {
          monitorId: selectedMonitor.id,
          reminderFrequency: editFrequency,
          reminderEmail: editEmail.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      setReminderModalOpen(false);
      setSelectedMonitor(null);
      toast.success("Reminder preferences updated successfully.");
    },
    onError: (err) => {
      toast.error("Failed to update reminders: " + (err as Error).message);
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
      toast.success("Live HTTP & SSL probe complete.");
    },
  });

  const testSslAlertsMutation = useMutation({
    mutationFn: () => triggerSslExpiryCheckServerFn(),
    onSuccess: (res: any) => {
      toast.success(
        res && res.length > 0
          ? `Triggered ${res.length} SSL expiration notification(s)!`
          : "All monitored SSL certificates are healthy and valid.",
      );
    },
    onError: (err) => {
      toast.error("Failed to check SSL alerts: " + (err as Error).message);
    },
  });

  const nowMs = Date.now();
  const upCount = monitors.filter((m) => m.status === "up").length;
  const downCount = monitors.filter((m) => m.status === "down").length;

  const expiringSslMonitors = monitors.filter((m) => {
    if (!m.sslExpiresAt) return false;
    const days = Math.ceil(
      (new Date(m.sslExpiresAt).getTime() - nowMs) / (1000 * 60 * 60 * 24),
    );
    return days <= 14;
  });

  const handleOpenReminderModal = (mon: MonitorItem) => {
    setSelectedMonitor(mon);
    setEditFrequency(mon.reminderFrequency || "both");
    setEditEmail(mon.reminderEmail || "");
    setReminderModalOpen(true);
  };

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
              Automated 24/7 health probes for HTTP availability, response times,
              and SSL expiration alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testSslAlertsMutation.isPending}
              onClick={() => testSslAlertsMutation.mutate()}
              className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5"
              title="Run automated check for expiring certificates and trigger reminders"
            >
              <Bell className="h-3.5 w-3.5 text-primary" /> Check Reminders
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Monitored URL
            </button>
          </div>
        </div>

        {/* Critical SSL Expiry Warning Banner (< 14 days) */}
        {expiringSslMonitors.length > 0 && (
          <div className="rounded-2xl border-2 border-error/50 bg-error/10 p-4 sm:p-5 text-error flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-error text-white flex items-center justify-center shrink-0 shadow-md shadow-error/30 animate-pulse">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-error">
                  ⚠️ Critical Alert: {expiringSslMonitors.length} Domain SSL
                  Certificate(s) Expiring in Less Than 2 Weeks!
                </h3>
                <p className="text-xs text-base-content/80 mt-0.5">
                  Web browsers will block visitor traffic with a security warning if
                  not renewed immediately. In-app and email reminders have been
                  dispatched.
                </p>
              </div>
            </div>
            <span className="badge badge-error text-white font-black text-[11px] uppercase tracking-wider shrink-0 px-3 py-2">
              Immediate Action Required
            </span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div
            className={`rounded-2xl border p-4 space-y-1 ${
              expiringSslMonitors.length > 0
                ? "border-error/50 bg-error/10 text-error"
                : "border-base-300 bg-base-200/40"
            }`}
          >
            <div className="text-xs font-semibold">
              SSL Expiring Soon (&lt;14d)
            </div>
            <div
              className={`text-2xl font-black ${
                expiringSslMonitors.length > 0 ? "text-error" : "text-base-content"
              }`}
            >
              {expiringSslMonitors.length} Domains
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
              Add your website or client domains to receive automated downtime
              alerts, weekly summaries, and SSL certificate expiration reminders.
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
            {monitors.map((mon) => {
              const expiryMs = mon.sslExpiresAt
                ? new Date(mon.sslExpiresAt).getTime()
                : null;
              const daysRemaining = expiryMs
                ? Math.ceil((expiryMs - nowMs) / (1000 * 60 * 60 * 24))
                : null;
              const isExpiringSoon =
                daysRemaining !== null && daysRemaining <= 14;

              return (
                <div
                  key={mon.id}
                  className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isExpiringSoon
                      ? "border-error/60 bg-error/5 dark:bg-error/10 hover:border-error"
                      : "border-base-300 bg-base-100 hover:border-base-content/20"
                  }`}
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
                      <div className="text-sm font-bold text-base-content flex flex-wrap items-center gap-2">
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

                        {/* SSL Expiry Status Badge (Red under 2 weeks) */}
                        {isExpiringSoon ? (
                          <span className="badge badge-error text-white font-bold text-[10px] gap-1 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            SSL EXPIRES IN {daysRemaining} DAYS
                          </span>
                        ) : daysRemaining !== null ? (
                          <span className="badge badge-ghost text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1 border-emerald-500/30">
                            <Lock className="h-3 w-3" /> SSL Valid ({daysRemaining}d left)
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-[10px] text-base-content/60">
                            SSL Active
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-base-content/60 mt-1">
                        <span>Status: HTTP {mon.lastStatusCode || 200}</span>
                        <span>•</span>
                        <span>
                          Checked:{" "}
                          {mon.lastCheckedAt
                            ? new Date(mon.lastCheckedAt).toLocaleTimeString()
                            : "Pending"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bell className="h-3 w-3 text-primary" />
                          Reminders:{" "}
                          <strong className="text-base-content/80 capitalize">
                            {mon.reminderFrequency === "both"
                              ? "Weekly + SSL Alerts"
                              : mon.reminderFrequency === "ssl_expiry"
                                ? "SSL Alerts Only"
                                : mon.reminderFrequency === "weekly"
                                  ? "Weekly Only"
                                  : "Off"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenReminderModal(mon)}
                      className="btn btn-ghost btn-sm rounded-xl text-xs gap-1.5"
                      title="Configure weekly or SSL expiry reminder settings"
                    >
                      <Settings className="h-3.5 w-3.5" /> Reminders
                    </button>

                    <button
                      type="button"
                      disabled={probeMutation.isPending}
                      onClick={() => probeMutation.mutate(mon.id)}
                      className="btn btn-ghost btn-sm rounded-xl text-xs gap-1.5"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          probeMutation.isPending ? "animate-spin" : ""
                        }`}
                      />{" "}
                      Probe Now
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove monitor for ${mon.url}?`))
                          deleteMutation.mutate(mon.id);
                      }}
                      className="btn btn-ghost btn-sm btn-square rounded-xl text-error"
                      title="Delete Monitor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                Skorvia will monitor HTTP availability 24/7, track SSL certificate
                expiration, and send automated in-app and email reminders.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newUrl.trim()) addMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Domain / URL *
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

                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Notification & Reminder Schedule
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl text-xs mt-1"
                    value={newReminderFrequency}
                    onChange={(e) =>
                      setNewReminderFrequency(
                        e.target.value as "weekly" | "ssl_expiry" | "both" | "none",
                      )
                    }
                  >
                    <option value="both">
                      🔔 Both Weekly Digest & SSL Expiry Alerts (&lt;14d)
                    </option>
                    <option value="ssl_expiry">
                      🔒 SSL Expiry Warnings Only (&lt;14d and &lt;7d)
                    </option>
                    <option value="weekly">📊 Weekly Uptime Digest Only</option>
                    <option value="none">🔕 Disabled (No Reminders)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Alert Email (Optional - defaults to account email)
                  </label>
                  <input
                    type="email"
                    placeholder="admin@yourbrand.com"
                    className="input input-bordered input-sm w-full rounded-xl text-xs mt-1"
                    value={newReminderEmail}
                    onChange={(e) => setNewReminderEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
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

        {/* Edit Reminder Settings Modal */}
        {reminderModalOpen && selectedMonitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-base-content">
                  Reminder Settings
                </h3>
              </div>
              <p className="text-xs text-base-content/70">
                Configure automated alerts for <strong>{selectedMonitor.url}</strong>.
                When the SSL certificate has less than 2 weeks remaining, critical
                alerts will trigger automatically.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateReminderMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Reminder Frequency
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl text-xs mt-1"
                    value={editFrequency}
                    onChange={(e) =>
                      setEditFrequency(
                        e.target.value as "weekly" | "ssl_expiry" | "both" | "none",
                      )
                    }
                  >
                    <option value="both">
                      🔔 Both Weekly Digest & SSL Expiry Alerts (&lt;14d)
                    </option>
                    <option value="ssl_expiry">
                      🔒 SSL Expiry Warnings Only (&lt;14d and &lt;7d)
                    </option>
                    <option value="weekly">📊 Weekly Uptime Digest Only</option>
                    <option value="none">🔕 Disabled (No Reminders)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-base-content/70">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email for alerts"
                    className="input input-bordered input-sm w-full rounded-xl text-xs mt-1"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                  <span className="text-[10px] text-base-content/60 mt-1 block">
                    Leave blank to send to your default account email.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                  <button
                    type="button"
                    onClick={() => setReminderModalOpen(false)}
                    className="btn btn-ghost btn-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateReminderMutation.isPending}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-white"
                  >
                    {updateReminderMutation.isPending
                      ? "Saving..."
                      : "Save Preferences"}
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

