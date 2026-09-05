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
import {
  sendAdminBroadcastServerFn,
  previewAdminBroadcastServerFn,
} from "@/serverFunctions/admin-broadcast";
import { useImpersonation } from "@/client/components/ImpersonationBanner";
import type { AdminUserRecord } from "@/services/user-management.service";
import type {
  BroadcastAudienceTarget,
  BroadcastChannel,
} from "@/services/admin-broadcast.service";

export const Route = createFileRoute("/_admin/admin/users")({
  component: AdminUsersPage,
});

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { startImpersonation } = useImpersonation();

  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  // Quota edit modal state
  const [selectedUser, setSelectedUser] =
    React.useState<AdminUserRecord | null>(null);
  const [editPlanId, setEditPlanId] = React.useState("pro");
  const [editCreditsLimit, setEditCreditsLimit] = React.useState(2500);

  // Broadcast & Direct Message Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = React.useState(false);
  const [msgTargetAudience, setMsgTargetAudience] =
    React.useState<BroadcastAudienceTarget>("all");
  const [msgTargetUser, setMsgTargetUser] =
    React.useState<AdminUserRecord | null>(null);
  const [msgTargetCountry, setMsgTargetCountry] = React.useState("ALL");
  const [msgChannels, setMsgChannels] = React.useState<BroadcastChannel[]>([
    "in_app",
    "email",
  ]);
  const [msgTitle, setMsgTitle] = React.useState(
    "Important Update: {{first_name}}",
  );
  const [msgBody, setMsgBody] = React.useState(
    "Hello {{first_name}},\n\nWe have updated your {{plan}} plan with new high-performance features. You currently have {{credits}} credits remaining.\n\nBest regards,\nThe Skorvia Team",
  );
  const [msgCategory, setMsgCategory] = React.useState<
    "system" | "announcement" | "special_offer" | "warning" | "update"
  >("announcement");
  const [msgPriority, setMsgPriority] = React.useState<
    "info" | "warning" | "success" | "critical"
  >("info");
  const [msgActionUrl, setMsgActionUrl] = React.useState("/projects");

  const usersQuery = useQuery({
    queryKey: [
      "adminUsersPaginated",
      {
        search,
        planId: planFilter,
        role: roleFilter,
        status: statusFilter,
        page,
      },
    ],
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

  const previewQuery = useQuery({
    queryKey: [
      "previewAdminBroadcast",
      msgTargetAudience,
      msgTargetUser?.id,
      msgTargetCountry,
      msgTitle,
      msgBody,
    ],
    queryFn: () =>
      previewAdminBroadcastServerFn({
        data: {
          targetAudience: msgTargetAudience,
          targetUserId: msgTargetUser?.id,
          targetCountry: msgTargetCountry,
          titleTemplate: msgTitle,
          messageTemplate: msgBody,
        },
      }),
    enabled: isBroadcastModalOpen,
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: () =>
      sendAdminBroadcastServerFn({
        data: {
          targetAudience: msgTargetAudience,
          targetUserId: msgTargetUser?.id,
          targetCountry: msgTargetCountry,
          channels: msgChannels,
          titleTemplate: msgTitle,
          messageTemplate: msgBody,
          category: msgCategory,
          priority: msgPriority,
          actionUrl: msgActionUrl || undefined,
        },
      }),
    onSuccess: (res) => {
      toast.success(
        `Broadcast sent successfully to ${res.sentCount} recipients (${res.inAppDeliveredCount} in-app, ${res.emailDeliveredCount} emails)`,
      );
      setIsBroadcastModalOpen(false);
      setMsgTargetUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send broadcast");
    },
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
    mutationFn: (data: {
      userId: string;
      monthlyCreditsLimit: number;
      planId: string;
    }) => adjustUserQuotaServerFn({ data }),
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
    mutationFn: (userId: string) =>
      deleteUserAccountServerFn({ data: { userId } }),
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

  const handleOpenDirectMessage = (u: AdminUserRecord) => {
    setMsgTargetAudience("single_user");
    setMsgTargetUser(u);
    setMsgTitle(`Notification for ${u.name || u.email}`);
    setIsBroadcastModalOpen(true);
  };

  const handleOpenGlobalBroadcast = () => {
    setMsgTargetAudience("all");
    setMsgTargetUser(null);
    setMsgTitle("New Platform Announcement: {{first_name}}");
    setIsBroadcastModalOpen(true);
  };

  const insertMergeTag = (tag: string) => {
    setMsgBody((prev) => `${prev} ${tag}`);
  };

  const toggleChannel = (ch: BroadcastChannel) => {
    if (msgChannels.includes(ch)) {
      if (msgChannels.length > 1) {
        setMsgChannels(msgChannels.filter((c) => c !== ch));
      }
    } else {
      setMsgChannels([...msgChannels, ch]);
    }
  };

  const users = usersQuery.data?.users || [];
  const total = usersQuery.data?.total || 0;
  const totalPages = usersQuery.data?.totalPages || 1;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Global Broadcast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            User Management &amp; Communications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage subscriber accounts, quota limits, direct messaging, and
            targeted email/in-app broadcasts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenGlobalBroadcast}
          className="btn btn-primary rounded-xl font-bold text-xs text-white shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <Icon icon="solar:letter-unread-bold" className="h-4 w-4" />
          <span>Broadcast Message</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="agency">Agency Plan</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="user">Standard User</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Registered Customers ({total})
          </h5>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
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
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    {usersQuery.isLoading
                      ? "Loading customer list..."
                      : "No users match the search filter."}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {u.name
                            ? u.name.slice(0, 2).toUpperCase()
                            : u.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {u.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {u.planId}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700 dark:text-slate-200">
                      {u.creditsUsed.toLocaleString()} /{" "}
                      {u.monthlyCreditsLimit.toLocaleString()}
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
                      {/* Direct Message Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDirectMessage(u)}
                        className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1"
                        title="Send Direct Message"
                      >
                        <Icon
                          icon="solar:letter-bold"
                          className="h-3.5 w-3.5"
                        />
                        <span>Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenQuotaModal(u)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1"
                        title="Adjust Plan & Quota"
                      >
                        <Icon
                          icon="solar:tuning-square-2-bold-duotone"
                          className="h-3.5 w-3.5 text-primary"
                        />
                        <span>Quota</span>
                      </button>

                      <button
                        type="button"
                        disabled={impersonateMutation.isPending}
                        onClick={() => impersonateMutation.mutate(u.id)}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold inline-flex items-center gap-1"
                        title="Magic Impersonate"
                      >
                        <Icon
                          icon="solar:user-speak-rounded-bold-duotone"
                          className="h-3.5 w-3.5"
                        />
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
                          <Icon
                            icon="solar:trash-bin-2-bold-duotone"
                            className="h-4 w-4"
                          />
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

      {/* Broadcast & Direct Messaging Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon
                    icon="solar:letter-unread-bold-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-800 dark:text-slate-100">
                    {msgTargetUser
                      ? `Direct Message: ${msgTargetUser.name || msgTargetUser.email}`
                      : "Targeted Customer Broadcast"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Send personalized in-app notifications and email updates
                    with dynamic merge variables.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Audience Selector (if not single user) */}
              {!msgTargetUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Target Audience Group
                    </label>
                    <select
                      value={msgTargetAudience}
                      onChange={(e) =>
                        setMsgTargetAudience(e.target.value as any)
                      }
                      className="select select-bordered select-sm w-full rounded-xl font-bold bg-white dark:bg-slate-800"
                    >
                      <option value="all">All Registered Users</option>
                      <option value="free_only">
                        Free / Starter Users Only
                      </option>
                      <option value="paid_only">
                        All Subscribed (Pro &amp; Agency)
                      </option>
                      <option value="starter_plan">
                        Starter Plan Subscribers
                      </option>
                      <option value="pro_plan">Pro Growth Subscribers</option>
                      <option value="agency_plan">
                        Agency Plan Subscribers
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Country / Region Filter
                    </label>
                    <select
                      value={msgTargetCountry}
                      onChange={(e) => setMsgTargetCountry(e.target.value)}
                      className="select select-bordered select-sm w-full rounded-xl font-bold bg-white dark:bg-slate-800"
                    >
                      <option value="ALL">All Countries / Global</option>
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="NG">Nigeria (NG)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Delivery Channels */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Delivery Channels:
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={msgChannels.includes("in_app")}
                      onChange={() => toggleChannel("in_app")}
                      className="checkbox checkbox-primary checkbox-xs"
                    />
                    <span>In-App Notification Bell</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={msgChannels.includes("email")}
                      onChange={() => toggleChannel("email")}
                      className="checkbox checkbox-primary checkbox-xs"
                    />
                    <span>Email Delivery</span>
                  </label>
                </div>
              </div>

              {/* Template Dynamic Merge Variables helper tags */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Dynamic Merge Tags (Click to insert):
                  </span>
                  <span className="text-primary font-mono font-bold">
                    {previewQuery.data
                      ? `Will reach ${previewQuery.data.targetUserCount} users`
                      : "Calculating..."}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { tag: "{{first_name}}", label: "First Name" },
                    { tag: "{{name}}", label: "Full Name" },
                    { tag: "{{email}}", label: "Email" },
                    { tag: "{{plan}}", label: "Plan Tier" },
                    { tag: "{{credits}}", label: "Available Credits" },
                  ].map((m) => (
                    <button
                      key={m.tag}
                      type="button"
                      onClick={() => insertMergeTag(m.tag)}
                      className="btn btn-xs rounded-lg font-mono bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white border-0"
                    >
                      + {m.label} ({m.tag})
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject / Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Message Subject / Notification Title
                </label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  className="input input-bordered input-sm w-full rounded-xl font-bold bg-white dark:bg-slate-800"
                  placeholder="e.g. Important Update for {{first_name}}"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="textarea textarea-bordered w-full rounded-2xl text-xs leading-relaxed font-normal bg-white dark:bg-slate-800"
                  placeholder="Write your message here... You can use {{first_name}}, {{plan}}, {{credits}}"
                />
              </div>

              {/* Action Link & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={msgActionUrl}
                    onChange={(e) => setMsgActionUrl(e.target.value)}
                    className="input input-bordered input-sm w-full rounded-xl bg-white dark:bg-slate-800"
                    placeholder="/billing or /p/$projectId/brand-analysis"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Notification Category
                  </label>
                  <select
                    value={msgCategory}
                    onChange={(e) => setMsgCategory(e.target.value as any)}
                    className="select select-bordered select-sm w-full rounded-xl font-bold bg-white dark:bg-slate-800"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="special_offer">
                      Special Offer / Upgrade Discount
                    </option>
                    <option value="system">System Notice</option>
                    <option value="update">Feature Update</option>
                    <option value="warning">Account Warning</option>
                  </select>
                </div>
              </div>

              {/* Live Rendered Sample Preview */}
              {previewQuery.data && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary badge-xs text-white font-bold">
                      Live Recipient Preview
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sample for:{" "}
                      {previewQuery.data.sampleUsers[0]?.email || "Customer"}
                    </span>
                  </div>
                  <h5 className="font-black text-slate-800 dark:text-slate-100 text-xs">
                    {previewQuery.data.renderedTitleSample}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-normal">
                    {previewQuery.data.renderedMessageSample}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="btn btn-sm btn-ghost rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  sendBroadcastMutation.isPending || !msgTitle || !msgBody
                }
                onClick={() => sendBroadcastMutation.mutate()}
                className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2"
              >
                <Icon
                  icon="solar:plain-bold"
                  className={`h-4 w-4 ${sendBroadcastMutation.isPending ? "animate-spin" : ""}`}
                />
                <span>
                  {sendBroadcastMutation.isPending
                    ? "Dispatching..."
                    : "Send Message"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Quota Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustQuotaMutation.mutate({
                  userId: selectedUser.id,
                  planId: editPlanId,
                  monthlyCreditsLimit: editCreditsLimit,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Assign Plan Tier
                </label>
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold focus:outline-none"
                >
                  <option value="starter">Starter Plan</option>
                  <option value="pro">Pro Growth Plan</option>
                  <option value="agency">Agency &amp; Scale Plan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Monthly AI &amp; Crawl Credit Allowance
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={editCreditsLimit}
                  onChange={(e) => setEditCreditsLimit(Number(e.target.value))}
                  className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustQuotaMutation.isPending}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
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
