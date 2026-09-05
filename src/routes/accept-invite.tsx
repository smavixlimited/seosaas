import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";
import { useSession } from "@/lib/auth-client";
import {
  getInvitationByTokenServerFn,
  acceptTeamInviteServerFn,
} from "@/serverFunctions/team-management";

const acceptInviteSearchSchema = z.object({
  token: z.string().optional().default(""),
});

export const Route = createFileRoute("/accept-invite")({
  validateSearch: acceptInviteSearchSchema,
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const token = search.token || "";
  const { data: session } = useSession();

  const inviteQuery = useQuery({
    queryKey: ["inviteTokenData", token],
    queryFn: () => getInvitationByTokenServerFn({ data: { token } }),
    enabled: Boolean(token),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptTeamInviteServerFn({ data: { token } }),
    onSuccess: () => {
      toast.success(
        "Welcome to the team! You now have access to the workspace.",
      );
      void navigate({ to: "/projects" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to accept team invitation");
    },
  });

  const invite = inviteQuery.data;
  const isExpired = invite && new Date(invite.expiresAt).getTime() < Date.now();

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 rounded-3xl border border-base-300 shadow-xl p-8 space-y-6 text-center">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon
              icon="solar:users-group-two-rounded-bold-duotone"
              className="h-8 w-8"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content">
            Team Workspace Invitation
          </h1>
          <p className="text-xs text-base-content/60">
            Collaborate on SEO campaigns, keyword intelligence, and site audits
            on {BRAND_CONFIG.name}.
          </p>
        </div>

        {/* Loading State */}
        {inviteQuery.isLoading && (
          <div className="py-8 text-xs text-base-content/60 animate-pulse">
            Verifying invitation token...
          </div>
        )}

        {/* Invalid or Missing Token */}
        {!inviteQuery.isLoading &&
          (!invite || isExpired || invite.status !== "pending") && (
            <div className="p-5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs space-y-3">
              <Icon
                icon="solar:danger-triangle-bold"
                className="h-6 w-6 mx-auto"
              />
              <p className="font-bold">
                {isExpired
                  ? "This invitation token has expired."
                  : invite?.status === "accepted"
                    ? "This invitation has already been accepted."
                    : invite?.status === "revoked"
                      ? "This invitation was revoked by the workspace owner."
                      : "Invalid or missing invitation token."}
              </p>
              <Link
                to="/sign-in"
                className="btn btn-sm btn-ghost text-primary font-bold"
              >
                Return to Sign In &rarr;
              </Link>
            </div>
          )}

        {/* Valid Invite Details */}
        {invite && invite.status === "pending" && !isExpired && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Invited Email:</span>
                <span className="font-bold text-base-content">
                  {invite.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Assigned Role:</span>
                <span className="badge badge-primary badge-sm font-bold uppercase">
                  {invite.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Expires On:</span>
                <span className="text-base-content font-bold">
                  {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {session?.user ? (
              <button
                type="button"
                disabled={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate()}
                className="btn btn-primary w-full rounded-2xl font-bold text-white shadow-lg shadow-primary/25 gap-2"
              >
                <Icon icon="solar:check-circle-bold" className="h-5 w-5" />
                <span>
                  {acceptMutation.isPending
                    ? "Joining Workspace..."
                    : "Accept Invitation & Join Team"}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-base-content/70">
                  Please sign in or create an account to accept this team
                  invitation.
                </p>
                <Link
                  to="/sign-in"
                  search={{ redirect: `/accept-invite?token=${token}` }}
                  className="btn btn-primary w-full rounded-2xl font-bold text-white shadow-md shadow-primary/20"
                >
                  Sign In to Accept &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-base-200 pt-4 text-[11px] text-base-content/40">
          Powered by{" "}
          <strong className="text-primary">{BRAND_CONFIG.name}</strong>{" "}
          Enterprise SEO
        </div>
      </div>
    </div>
  );
}
