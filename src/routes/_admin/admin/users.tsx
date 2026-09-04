import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAdminUsersPaginatedServerFn,
  adjustUserQuotaServerFn,
  startUserImpersonationServerFn,
  deleteUserAccountServerFn,
} from "@/serverFunctions/admin-users";
import { useImpersonation } from "@/client/components/ImpersonationBanner";
import type { AdminUserRecord } from "@/services/user-management.service";

export const Route = createFileRoute("/_admin/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { startImpersonation } = useImpersonation();

  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  // Quota edit modal state
  const [selectedUser, setSelectedUser] = React.useState<AdminUserRecord | null>(null);
  const [editPlanId, setEditPlanId] = React.useState("pro");
  const [editCreditsLimit, setEditCreditsLimit] = React.useState(2500);

  const usersQuery = useQuery({
    queryKey: ["adminUsersPaginated", { search, planId: planFilter, role: roleFilter, status: statusFilter, page }],
    queryFn: () =>
      getAdminUsersPaginatedServerFn({
        data: {
          search: search || undefined,
          planId: planFilter,
          role: roleFilter,
          status: statusFilter,
          page,
          limit: 15,
        },
      }),
  });

  const impersonateMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      startUserImpersonationServerFn({ data: { targetUserId } }),
    onSuccess: (res) => {
      startImpersonation(res);
      window.location.href = "/projects";
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start impersonation");
    },
  });

  const adjustQuotaMutation = useMutation({
    mutationFn: (data: { userId: string; monthlyCreditsLimit: number; planId: string }) =>
      adjustUserQuotaServerFn({ data }),
    onSuccess: () => {
      toast.success("User quota and plan updated successfully!");
      setSelectedUser(null);
      void queryClient.invalidateQueries({ queryKey: ["adminUsersPaginated"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user quota");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUserAccountServerFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("User account deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["adminUsersPaginated"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete account");
    },
  });

  const handleOpenQuotaModal = (u: AdminUserRecord) => {
    setSelectedUser(u);
    setEditPlanId(u.planId);
    setEditCreditsLimit(u.monthlyCreditsLimit);
  };

  const handleSaveQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    adjustQuotaMutation.mutate({
      userId: selectedUser.id,
      planId: editPlanId,
      monthlyCreditsLimit: editCreditsLimit,
    });
  };

  const data = usersQuery.data as { users: AdminUserRecord[]; total: number; totalPages: number } | undefined;
  const users: AdminUserRecord[] = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            User Accounts &amp; Magic Impersonation
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage customer accounts, adjust credit allowances, and log into workspaces with 1-click read-only impersonation.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Icon icon="solar:minimalistic-magnifer-line-duotone" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name, email, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Plan Tiers</option>
            <option value="free">Free Starter</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro Growth</option>
            <option value="agency">Agency Scale</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="user">Standard User</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Registered Customers ({total})
          </h5>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3">Customer Profile</th>
                <th className="px-6 py-3">Plan Tier</th>
                <th className="px-6 py-3">Monthly Credits</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {usersQuery.isLoading ? "Loading customer list..." : "No users match the search filter."}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name.slice(0, 2).toUpperCase() : u.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{u.name || "Customer"}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {u.planId}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                      {u.creditsUsed.toLocaleString()} / {u.monthlyCreditsLimit.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "superadmin"
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenQuotaModal(u)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1"
                        title="Adjust Plan & Quota"
                      >
                        <Icon icon="solar:tuning-square-2-bold-duotone" className="h-3.5 w-3.5 text-primary" />
                        <span>Quota</span>
                      </button>

                      <button
                        type="button"
                        disabled={impersonateMutation.isPending}
                        onClick={() => impersonateMutation.mutate(u.id)}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold inline-flex items-center gap-1"
                        title="Magic Impersonate"
                      >
                        <Icon icon="solar:user-speak-rounded-bold-duotone" className="h-3.5 w-3.5" />
                        <span>Impersonate</span>
                      </button>

                      {u.role !== "superadmin" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete account for ${u.email}?`)) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex"
                          title="Delete User"
                        >
                          <Icon icon="solar:trash-bin-2-bold-duotone" className="h-4 w-4" />
                        </button>
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

      {/* Adjust Quota Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Adjust Plan &amp; Quota: {selectedUser.email}
              </h5>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assign Plan Tier</label>
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold focus:outline-none"
                >
                  <option value="starter">Starter Plan</option>
                  <option value="pro">Pro Growth Plan</option>
                  <option value="agency">Agency &amp; Scale Plan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Monthly AI &amp; Crawl Credit Allowance</label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={editCreditsLimit}
                  onChange={(e) => setEditCreditsLimit(Number(e.target.value))}
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustQuotaMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
                >
                  {adjustQuotaMutation.isPending ? "Saving..." : "Save Quota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
