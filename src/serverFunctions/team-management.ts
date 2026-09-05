import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import {
  TeamManagementService,
  type TeamRole,
} from "@/services/team-management.service";

const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "editor", "viewer"]),
  assignedProjectIds: z.array(z.string()).optional(),
});

const updateRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["admin", "editor", "viewer"]),
  assignedProjectIds: z.array(z.string()).optional(),
});

const memberIdSchema = z.object({
  memberId: z.string().min(1),
});

const inviteIdSchema = z.object({
  inviteId: z.string().min(1),
});

const tokenSchema = z.object({
  token: z.string().min(1),
});

/**
 * Returns team members, pending invites, and seat meter quota for the logged-in owner.
 */
export const getTeamSummaryServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return TeamManagementService.getTeamSummary(context.userId);
  });

/**
 * Dispatches an email invitation to join the team.
 */
export const inviteTeamMemberServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(inviteSchema)
  .handler(async ({ data, context }) => {
    return TeamManagementService.inviteTeamMember({
      ownerId: context.userId,
      inviterName: context.userEmail.split("@")[0],
      inviterEmail: context.userEmail,
      email: data.email,
      role: data.role as TeamRole,
      assignedProjectIds: data.assignedProjectIds,
    });
  });

/**
 * Updates a team member's role or assigned projects.
 */
export const updateMemberRoleServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateRoleSchema)
  .handler(async ({ data, context }) => {
    return TeamManagementService.updateMemberRole(
      context.userId,
      data.memberId,
      data.role as TeamRole,
      data.assignedProjectIds,
      context.userEmail,
    );
  });

/**
 * Removes a member from the team.
 */
export const removeMemberServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(memberIdSchema)
  .handler(async ({ data, context }) => {
    return TeamManagementService.removeMember(
      context.userId,
      data.memberId,
      context.userEmail,
    );
  });

/**
 * Revokes a pending invitation.
 */
export const revokeInvitationServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(inviteIdSchema)
  .handler(async ({ data, context }) => {
    return TeamManagementService.revokeInvitation(
      context.userId,
      data.inviteId,
      context.userEmail,
    );
  });

/**
 * Retrieves public invitation details by token for `/accept-invite`.
 */
export const getInvitationByTokenServerFn = createServerFn({ method: "POST" })
  .validator(tokenSchema)
  .handler(async ({ data }) => {
    return TeamManagementService.getInvitationByToken(data.token);
  });

/**
 * Accepts an invitation token for the logged-in user.
 */
export const acceptTeamInviteServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(tokenSchema)
  .handler(async ({ data, context }) => {
    return TeamManagementService.acceptInvitation({
      token: data.token,
      userId: context.userId,
      userEmail: context.userEmail,
      userName: context.userEmail.split("@")[0],
    });
  });
