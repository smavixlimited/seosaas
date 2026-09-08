import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminWaitlistServerFn,
  updateAdminWaitlistStatusServerFn,
  deleteAdminWaitlistServerFn,
} from "@/serverFunctions/waitlist";
import { exportRecordsToCsv } from "@/client/lib/export-csv";
import type { WaitlistEntryRecord } from "@/services/waitlist.service";

export const Route = createFileRoute("/_admin/admin/waitlist")({
  component: AdminWaitlistPage,
});

export function AdminWaitlistPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedEntry, setSelectedEntry] =
    React.useState<WaitlistEntryRecord | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");

  const waitlistQuery = useQuery({
    queryKey: ["adminWaitlist", { search, status: statusFilter }],
    queryFn: () =>
      getAdminWaitlistServerFn({
        data: {
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          limit: 100,
        },
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: {
      id: string;
      status: "pending" | "invited" | "approved" | "rejected";
      notes?: string;
    }) => updateAdminWaitlistStatusServerFn({ data }),
    onSuccess: (_, variables) => {
      toast.success(`Waitlist user status updated to ${variables.status}`);
      void queryClient.invalidateQueries({ queryKey: ["adminWaitlist"] });
      setSelectedEntry(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminWaitlistServerFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Waitlist entry deleted");
      void queryClient.invalidateQueries({ queryKey: ["adminWaitlist"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete entry");
    },
  });

  const handleExportCsv = () => {
    const entries = waitlistQuery.data?.entries || [];
    if (entries.length === 0) {
      toast.error("No waitlist records to export");
      return;
    }

    exportRecordsToCsv("skorvia_waitlist", entries, [
      { header: "Full Name", accessor: (row) => row.name || "" },
      { header: "Email Address", accessor: "email" },
      { header: "Company", accessor: (row) => row.company || "" },
      { header: "Website", accessor: (row) => row.website || "" },
      { header: "Primary Interest", accessor: (row) => row.useCase || "" },
      { header: "Status", accessor: "status" },
      { header: "Date Applied", accessor: "createdAt" },
      { header: "Date Invited", accessor: (row) => row.invitedAt || "" },
      { header: "Admin Notes", accessor: (row) => row.notes || "" },
    ]);
    toast.success(`Exported ${entries.length} waitlist records to CSV`);
  };

  const stats = waitlistQuery.data?.stats || {
    total: 0,
    pending: 0,
    invited: 0,
    approved: 0,
    rejected: 0,
  };

  const entries = waitlistQuery.data?.entries || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Icon
              icon="solar:lock-keyhole-bold-duotone"
              className="text-primary size-7"
            />
            <span>Priority Waitlist & Early Access</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review registration applications, send onboarding invitations, and
            export user records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={entries.length === 0}
            className="btn btn-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold gap-2 shadow-xs rounded-xl"
          >
            <Icon
              icon="solar:export-bold"
              className="size-4 text-emerald-500"
            />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="solar:users-group-rounded-bold" className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Total waitlist queue
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Icon icon="solar:clock-circle-bold" className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {stats.pending.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting invitation</div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Invited / Emailed
            </span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Icon icon="solar:letter-bold" className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {stats.invited.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Invited to sign up</div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Approved / VIP
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Icon icon="solar:check-circle-bold" className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.approved.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            VIP & Enterprise Tier
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by email, name, company, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "pending", "invited", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === tab
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Waitlist Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {waitlistQuery.isLoading ? (
          <div className="p-12 text-center">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="text-xs text-slate-400 font-semibold mt-2">
              Loading waitlist database...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Icon icon="solar:folder-open-bold-duotone" className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No waitlist applicants found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try clearing your search query or status filter."
                : "When users register while public sign-up is closed, their records will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Company & Website</th>
                  <th className="py-3 px-4">Interest / Focus</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map((item) => {
                  const statusColors: Record<string, string> = {
                    pending:
                      "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    invited: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    approved:
                      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
                  };

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.name || "Anonymous Applicant"}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                          {item.email}
                        </div>
                      </td>

                      {/* Company & Website */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.company || "—"}
                        </div>
                        {item.website ? (
                          <a
                            href={
                              item.website.startsWith("http")
                                ? item.website
                                : `https://${item.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>
                              {item.website.replace(/^https?:\/\//, "")}
                            </span>
                            <Icon
                              icon="solar:arrow-right-up-linear"
                              className="size-3"
                            />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Use Case */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                          {item.useCase || "General SEO"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                            statusColors[item.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: item.id,
                                  status: "invited",
                                })
                              }
                              className="btn btn-xs bg-primary text-white hover:bg-primary/90 rounded-lg font-bold"
                            >
                              Invite
                            </button>
                          )}
                          {item.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: item.id,
                                  status: "approved",
                                })
                              }
                              className="btn btn-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg font-bold"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete waitlist entry for ${item.email}?`,
                                )
                              ) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            className="btn btn-xs btn-ghost text-slate-400 hover:text-rose-500 rounded-lg p-1"
                            title="Delete"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="size-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
