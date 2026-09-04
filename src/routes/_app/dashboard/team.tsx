import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getTeamSummaryServerFn,
  inviteTeamMemberServerFn,
  updateMemberRoleServerFn,
  removeMemberServerFn,
  revokeInvitationServerFn,
} from "@/serverFunctions/team-management";
import type { TeamRole } from "@/services/team-management.service";

export const Route = createFileRoute("/_app/dashboard/team")({
  component: TeamManagementPage,
});

function TeamManagementPage() {
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "editor" | "viewer">("editor");

  const [editingMember, setEditingMember] = React.useState<{
    id: string;
    name: string;
    email: string;
    role: TeamRole;
  } | null>(null);
  const [editRole, setEditRole] = React.useState<"admin" | "editor" | "viewer">("editor");

  const teamQuery = useQuery({
    queryKey: ["teamSummaryData"],
    queryFn: () => getTeamSummaryServerFn(),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteTeamMemberServerFn({
        data: {
          email: inviteEmail.trim(),
          role: inviteRole,
        },
      }),
    onSuccess: () => {
      toast.success(`Invitation email sent to ${inviteEmail}!`);
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole("editor");
      void queryClient.invalidateQueries({ queryKey: ["teamSummaryData"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send team invitation");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: () => {
      if (!editingMember) throw new Error("No member selected");
      return updateMemberRoleServerFn({
        data: {
          memberId: editingMember.id,
          role: editRole,
        },
      });
    },
    onSuccess: () => {
      toast.success("Team member role updated successfully!");
      setEditingMember(null);
      void queryClient.invalidateQueries({ queryKey: ["teamSummaryData"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update member role");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMemberServerFn({ data: { memberId } }),
    onSuccess: () => {
      toast.success("Team member removed from organization");
      void queryClient.invalidateQueries({ queryKey: ["teamSummaryData"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (inviteId: string) => revokeInvitationServerFn({ data: { inviteId } }),
    onSuccess: () => {
      toast.success("Invitation revoked successfully");
      void queryClient.invalidateQueries({ queryKey: ["teamSummaryData"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke invitation");
    },
  });

  const summary = teamQuery.data;
  const seatLimit = summary?.seatLimit ?? 1;
  const seatsUsed = summary?.seatsUsed ?? 1;
  const percentUsed = Math.min(100, Math.round((seatsUsed / Math.max(1, seatLimit)) * 100));
  const isNearLimit = percentUsed >= 80;

  return (
    <div className="h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-8 md:py-10 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-base-content/60">
            <Link to="/settings" className="hover:text-primary transition-colors">
              Settings
            </Link>
            <span>/</span>
            <span className="text-primary">Team Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content flex items-center gap-2">
            <span>Team & Workspace Access</span>
            <span className="badge badge-primary badge-sm font-bold uppercase">
              {summary?.planId.replace("-", " ") || "Free"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60">
            Collaborate on SEO projects, manage client viewer permissions, and invite team specialists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/billing" className="btn btn-outline btn-sm rounded-xl font-bold gap-1">
            <Icon icon="solar:card-2-bold" className="h-4 w-4" />
            <span>Manage Plan</span>
          </Link>
          <button
            type="button"
            disabled={!summary?.canInvite}
            onClick={() => setIsInviteModalOpen(true)}
            className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2"
          >
            <Icon icon="solar:user-plus-bold" className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Seat Meter Card */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isNearLimit ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
            }`}>
              <Icon icon="solar:users-group-two-rounded-bold" className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-base-content flex items-center gap-2">
                <span>Team Seat Allocation</span>
                <span className="text-xs font-bold text-base-content/60">
                  ({seatsUsed} of {seatLimit} seats occupied)
                </span>
              </div>
              <p className="text-xs text-base-content/60">
                {seatLimit === 1
                  ? "You are currently on the Free plan with 1 seat (Owner only). Upgrade to invite team members."
                  : `Your plan allows up to ${seatLimit} active members and pending invitations.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
              isNearLimit ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
            }`}>
              {percentUsed}% Used
            </span>
            {seatLimit <= 5 && (
              <Link to="/pricing" className="btn btn-xs btn-primary rounded-lg font-bold text-white">
                Add More Seats
              </Link>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isNearLimit ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
            <Icon icon="solar:shield-user-bold" className="h-5 w-5 text-primary" />
            <span>Active Team Members</span>
          </h3>
          <span className="text-xs font-bold text-base-content/50">
            {1 + (summary?.members.length ?? 0)} Total
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-base-200">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="border-b border-base-200 bg-base-200/40 text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                <th>Member</th>
                <th>Role & Permissions</th>
                <th>Project Scope</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Owner Row */}
              <tr className="hover:bg-base-200/30 transition-colors font-medium">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                      👑
                    </div>
                    <div>
                      <div className="font-extrabold text-base-content flex items-center gap-2">
                        <span>Organization Owner</span>
                        <span className="badge badge-warning badge-xs font-bold text-[9px]">
                          PRIMARY
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/50">Primary Account Holder</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-warning badge-sm font-bold uppercase text-[10px]">
                    OWNER
                  </span>
                </td>
                <td>
                  <span className="text-base-content/70 font-bold">All Projects (Full Access)</span>
                </td>
                <td>
                  <span className="text-base-content/50 text-[11px]">Primary</span>
                </td>
                <td className="text-right">
                  <span className="text-[10px] text-base-content/40 font-bold">Immutable</span>
                </td>
              </tr>

              {/* Members Rows */}
              {summary?.members.map((member) => (
                <tr key={member.id} className="hover:bg-base-200/30 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {member.memberName.charAt(0) || member.memberEmail.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-base-content">{member.memberName}</div>
                        <span className="text-[10px] text-base-content/50">{member.memberEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                      member.role === "admin"
                        ? "badge-primary text-white"
                        : member.role === "editor"
                        ? "badge-info text-white"
                        : "badge-ghost"
                    }`}>
                      {member.role.toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <span className="text-base-content/70">
                      {member.assignedProjectIds.length === 0
                        ? "All Projects"
                        : `${member.assignedProjectIds.length} Assigned Project(s)`}
                    </span>
                  </td>

                  <td>
                    <span className="text-base-content/60 text-[11px]">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember({
                            id: member.id,
                            name: member.memberName,
                            email: member.memberEmail,
                            role: member.role,
                          });
                          setEditRole(member.role === "owner" ? "admin" : member.role);
                        }}
                        className="btn btn-ghost btn-xs rounded-lg font-bold hover:text-primary"
                      >
                        Edit Role
                      </button>
                      <button
                        type="button"
                        disabled={removeMemberMutation.isPending}
                        onClick={() => {
                          if (confirm(`Remove ${member.memberEmail} from your team?`)) {
                            removeMemberMutation.mutate(member.id);
                          }
                        }}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {summary && summary.invitations.length > 0 && (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
              <Icon icon="solar:letter-unread-bold" className="h-5 w-5 text-amber-500" />
              <span>Pending Invitations ({summary.invitations.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-base-200">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="border-b border-base-200 bg-base-200/40 text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                  <th>Invited Email</th>
                  <th>Assigned Role</th>
                  <th>Sent Date</th>
                  <th>Expires In</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <span className="font-bold text-base-content">{inv.email}</span>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm font-bold uppercase text-[10px]">
                        {inv.role}
                      </span>
                    </td>
                    <td>
                      <span className="text-base-content/60">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="text-amber-600 font-bold text-[11px]">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        disabled={revokeInviteMutation.isPending}
                        onClick={() => revokeInviteMutation.mutate(inv.id)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg font-bold"
                      >
                        Revoke Invite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl border border-base-300 bg-base-100 max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                <Icon icon="solar:user-plus-bold-duotone" className="h-5 w-5 text-primary" />
                <span>Invite New Team Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-base-content/70 mb-1">
                  Team Member Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="specialist@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input input-bordered input-sm w-full rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-2">
                  Select Permission Role
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      role: "admin",
                      title: "Admin",
                      desc: "Can manage projects, trigger audits, add keywords, and invite members (no billing access).",
                      icon: "solar:shield-check-bold",
                    },
                    {
                      role: "editor",
                      title: "Editor / SEO Specialist",
                      desc: "Can optimize content, track keywords, run audits, and use SAM AI Copilot.",
                      icon: "solar:pen-new-square-bold",
                    },
                    {
                      role: "viewer",
                      title: "Client / Viewer (Read-Only)",
                      desc: "Can only view dashboards, rank tracking, and download client PDF reports.",
                      icon: "solar:eye-bold",
                    },
                  ].map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        inviteRole === r.role
                          ? "border-primary bg-primary/5 text-base-content"
                          : "border-base-200 hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="teamRole"
                        value={r.role}
                        checked={inviteRole === r.role}
                        onChange={() => setInviteRole(r.role as "admin" | "editor" | "viewer")}
                        className="radio radio-primary radio-xs mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5 text-xs">
                          <Icon icon={r.icon} className="h-3.5 w-3.5 text-primary" />
                          <span>{r.title}</span>
                        </div>
                        <p className="text-[11px] text-base-content/60 leading-tight">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-action border-t border-base-200 pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2"
                >
                  <Icon icon="solar:letter-bold" className="h-4 w-4" />
                  <span>{inviteMutation.isPending ? "Sending Invite..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl border border-base-300 bg-base-100 max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <h3 className="font-bold text-sm text-base-content">
                Change Role for {editingMember.name || editingMember.email}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-base-content/70">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as "admin" | "editor" | "viewer")}
                className="select select-bordered select-sm w-full rounded-xl font-bold"
              >
                <option value="admin">Admin (Manage SEO, audits & members)</option>
                <option value="editor">Editor (SEO Specialist & content tools)</option>
                <option value="viewer">Viewer (Read-only reports & dashboards)</option>
              </select>
            </div>

            <div className="modal-action border-t border-base-200 pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updateRoleMutation.isPending}
                onClick={() => updateRoleMutation.mutate()}
                className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-xs"
              >
                {updateRoleMutation.isPending ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
