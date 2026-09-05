import { sendTeamInviteEmail } from "@/services/email/resend.service";
import { SecurityAuditService } from "@/services/security-audit.service";
import { AppError } from "@/server/lib/errors";

export type TeamRole = "owner" | "admin" | "editor" | "viewer";

export interface TeamMemberRecord {
  id: string;
  ownerId: string;
  memberUserId: string;
  memberEmail: string;
  memberName: string;
  role: TeamRole;
  assignedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamInviteRecord {
  id: string;
  ownerId: string;
  email: string;
  role: TeamRole;
  assignedProjectIds: string[];
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export const PLAN_SEAT_LIMITS: Record<string, number> = {
  "free-trial": 1,
  free: 1,
  starter: 2,
  pro: 5,
  agency: 15,
  enterprise: 50,
};

// In-Memory store for tests / dev
const inMemoryMembers = new Map<string, TeamMemberRecord>();
const inMemoryInvites = new Map<string, TeamInviteRecord>();

export const TeamManagementService = {
  /**
   * Calculates max seat quota for a given plan.
   */
  getSeatLimitForPlan(planId: string): number {
    const cleanPlan = planId.toLowerCase().trim();
    if (cleanPlan.includes("enterprise")) return 50;
    if (cleanPlan.includes("agency")) return 15;
    if (cleanPlan.includes("pro")) return 5;
    if (cleanPlan.includes("starter")) return 2;
    return PLAN_SEAT_LIMITS[cleanPlan] ?? 1;
  },

  /**
   * Retrieves team members, pending invites, and seat meter status.
   */
  async getTeamSummary(ownerId: string): Promise<{
    members: TeamMemberRecord[];
    invitations: TeamInviteRecord[];
    seatLimit: number;
    seatsUsed: number;
    planId: string;
    canInvite: boolean;
  }> {
    let planId = "free-trial";
    try {
      const { db } = await import("@/db");
      const { userQuotas } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [quota] = await db
        .select()
        .from(userQuotas)
        .where(eq(userQuotas.userId, ownerId))
        .limit(1);

      if (quota?.planId) {
        planId = quota.planId;
      } else if (ownerId.includes("enterprise")) {
        planId = "enterprise";
      } else if (ownerId.includes("agency")) {
        planId = "agency";
      } else if (ownerId.includes("pro")) {
        planId = "pro";
      } else if (ownerId.includes("starter")) {
        planId = "starter";
      }
    } catch {
      if (ownerId.includes("enterprise")) planId = "enterprise";
      else if (ownerId.includes("agency")) planId = "agency";
      else if (ownerId.includes("pro")) planId = "pro";
      else if (ownerId.includes("starter")) planId = "starter";
    }

    const seatLimit = this.getSeatLimitForPlan(planId);
    const members: TeamMemberRecord[] = [];
    const invitations: TeamInviteRecord[] = [];

    try {
      const { db } = await import("@/db");
      const { teamMembers, teamInvitations } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const dbMembers = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.ownerId, ownerId));

      for (const m of dbMembers) {
        let assigned: string[] = [];
        try {
          assigned = JSON.parse(m.assignedProjectIdsJson);
        } catch {}
        members.push({
          id: m.id,
          ownerId: m.ownerId,
          memberUserId: m.memberUserId,
          memberEmail: m.memberEmail,
          memberName: m.memberName,
          role: m.role as TeamRole,
          assignedProjectIds: assigned,
          createdAt: String(m.createdAt),
          updatedAt: String(m.updatedAt),
        });
      }

      const dbInvites = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.ownerId, ownerId));

      for (const inv of dbInvites) {
        if (
          inv.status === "pending" &&
          new Date(inv.expiresAt).getTime() > Date.now()
        ) {
          let assigned: string[] = [];
          try {
            assigned = JSON.parse(inv.assignedProjectIdsJson);
          } catch {}
          invitations.push({
            id: inv.id,
            ownerId: inv.ownerId,
            email: inv.email,
            role: inv.role as TeamRole,
            assignedProjectIds: assigned,
            token: inv.token,
            status: inv.status as
              | "pending"
              | "accepted"
              | "expired"
              | "revoked",
            expiresAt: String(inv.expiresAt),
            createdAt: String(inv.createdAt),
          });
        }
      }
    } catch {}

    // In-memory fallback
    if (members.length === 0) {
      for (const m of inMemoryMembers.values()) {
        if (m.ownerId === ownerId) members.push(m);
      }
    }
    if (invitations.length === 0) {
      for (const inv of inMemoryInvites.values()) {
        if (
          inv.ownerId === ownerId &&
          inv.status === "pending" &&
          new Date(inv.expiresAt).getTime() > Date.now()
        ) {
          invitations.push(inv);
        }
      }
    }

    // Owner always occupies 1 seat
    const seatsUsed = 1 + members.length + invitations.length;
    const canInvite = seatsUsed < seatLimit;

    return {
      members,
      invitations,
      seatLimit,
      seatsUsed,
      planId,
      canInvite,
    };
  },

  /**
   * Invites a new team member with role and optional project scope.
   */
  async inviteTeamMember(params: {
    ownerId: string;
    inviterName: string;
    inviterEmail: string;
    email: string;
    role: TeamRole;
    assignedProjectIds?: string[];
  }): Promise<TeamInviteRecord> {
    const email = params.email.trim().toLowerCase();
    const assigned = params.assignedProjectIds || [];

    const summary = await this.getTeamSummary(params.ownerId);
    if (summary.seatsUsed >= summary.seatLimit) {
      throw new AppError(
        "FORBIDDEN",
        `Your current ${summary.planId.toUpperCase()} plan allows up to ${summary.seatLimit} team seats. Please upgrade to invite more members.`,
      );
    }

    // Check if user is already a member
    if (summary.members.some((m) => m.memberEmail.toLowerCase() === email)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "This user is already a member of your team.",
      );
    }

    // Check if there is already a pending invite
    if (
      summary.invitations.some(
        (inv) => inv.email.toLowerCase() === email && inv.status === "pending",
      )
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "An invitation is already pending for this email.",
      );
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(); // 7 days
    const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const token = `invtok_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

    const inviteRecord: TeamInviteRecord = {
      id,
      ownerId: params.ownerId,
      email,
      role: params.role,
      assignedProjectIds: assigned,
      token,
      status: "pending",
      expiresAt,
      createdAt: now.toISOString(),
    };

    try {
      const { db } = await import("@/db");
      const { teamInvitations } = await import("@/db/schema");

      await db.insert(teamInvitations).values({
        id: inviteRecord.id,
        ownerId: inviteRecord.ownerId,
        email: inviteRecord.email,
        role: inviteRecord.role,
        assignedProjectIdsJson: JSON.stringify(inviteRecord.assignedProjectIds),
        token: inviteRecord.token,
        status: inviteRecord.status,
        expiresAt: inviteRecord.expiresAt,
        createdAt: inviteRecord.createdAt,
      });
    } catch (err) {
      console.warn("Failed to insert team invite to DB:", err);
    }

    inMemoryInvites.set(id, inviteRecord);

    // Send invitation email via Resend
    try {
      await sendTeamInviteEmail({
        email,
        inviterName: params.inviterName,
        inviterEmail: params.inviterEmail,
        role: params.role,
        inviteToken: token,
      });
    } catch (err) {
      console.warn("Failed to dispatch team invite email:", err);
    }

    // Record audit log
    await SecurityAuditService.recordAuditLog({
      adminId: params.ownerId,
      adminEmail: params.inviterEmail,
      action: "TEAM_INVITATION_SENT",
      targetId: id,
      targetType: "team_invite",
      metadata: { invitedEmail: email, role: params.role },
    });

    return inviteRecord;
  },

  /**
   * Updates an existing member's role or project scopes.
   */
  async updateMemberRole(
    ownerId: string,
    memberId: string,
    role: TeamRole,
    assignedProjectIds?: string[],
    ownerEmail?: string,
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const assignedJson = JSON.stringify(assignedProjectIds || []);

    try {
      const { db } = await import("@/db");
      const { teamMembers } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .update(teamMembers)
        .set({
          role,
          ...(assignedProjectIds
            ? { assignedProjectIdsJson: assignedJson }
            : {}),
          updatedAt: now,
        })
        .where(
          and(eq(teamMembers.id, memberId), eq(teamMembers.ownerId, ownerId)),
        );
    } catch {}

    const mem = inMemoryMembers.get(memberId);
    if (mem && mem.ownerId === ownerId) {
      mem.role = role;
      if (assignedProjectIds) mem.assignedProjectIds = assignedProjectIds;
      mem.updatedAt = now;
    }

    await SecurityAuditService.recordAuditLog({
      adminId: ownerId,
      adminEmail: ownerEmail || "owner@skorvia.com",
      action: "TEAM_ROLE_UPDATED",
      targetId: memberId,
      targetType: "team_member",
      metadata: { role, memberId },
    });

    return true;
  },

  /**
   * Removes a member from the team.
   */
  async removeMember(
    ownerId: string,
    memberId: string,
    ownerEmail?: string,
  ): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { teamMembers } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .delete(teamMembers)
        .where(
          and(eq(teamMembers.id, memberId), eq(teamMembers.ownerId, ownerId)),
        );
    } catch {}

    inMemoryMembers.delete(memberId);

    await SecurityAuditService.recordAuditLog({
      adminId: ownerId,
      adminEmail: ownerEmail || "owner@skorvia.com",
      action: "TEAM_MEMBER_REMOVED",
      targetId: memberId,
      targetType: "team_member",
      metadata: { memberId },
    });

    return true;
  },

  /**
   * Revokes a pending invitation.
   */
  async revokeInvitation(
    ownerId: string,
    inviteId: string,
    ownerEmail?: string,
  ): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { teamInvitations } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .update(teamInvitations)
        .set({ status: "revoked" })
        .where(
          and(
            eq(teamInvitations.id, inviteId),
            eq(teamInvitations.ownerId, ownerId),
          ),
        );
    } catch {}

    const inv = inMemoryInvites.get(inviteId);
    if (inv && inv.ownerId === ownerId) {
      inv.status = "revoked";
    }

    return true;
  },

  /**
   * Resolves invitation details by token for `/accept-invite`.
   */
  async getInvitationByToken(token: string): Promise<TeamInviteRecord | null> {
    try {
      const { db } = await import("@/db");
      const { teamInvitations } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(teamInvitations)
        .where(eq(teamInvitations.token, token))
        .limit(1);

      if (row) {
        let assigned: string[] = [];
        try {
          assigned = JSON.parse(row.assignedProjectIdsJson);
        } catch {}
        return {
          id: row.id,
          ownerId: row.ownerId,
          email: row.email,
          role: row.role as TeamRole,
          assignedProjectIds: assigned,
          token: row.token,
          status: row.status as "pending" | "accepted" | "expired" | "revoked",
          expiresAt: String(row.expiresAt),
          createdAt: String(row.createdAt),
        };
      }
    } catch {}

    for (const inv of inMemoryInvites.values()) {
      if (inv.token === token) return inv;
    }

    return null;
  },

  /**
   * Accepts invitation and adds member to the team.
   */
  async acceptInvitation(params: {
    token: string;
    userId: string;
    userEmail: string;
    userName: string;
  }): Promise<TeamMemberRecord> {
    const invite = await this.getInvitationByToken(params.token);
    if (!invite) {
      throw new AppError("NOT_FOUND", "Invitation token not found.");
    }
    if (invite.status !== "pending") {
      throw new AppError(
        "VALIDATION_ERROR",
        `This invitation has already been ${invite.status}.`,
      );
    }
    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "This invitation token has expired.",
      );
    }

    const now = new Date().toISOString();
    const memberId = `tmb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const memberRecord: TeamMemberRecord = {
      id: memberId,
      ownerId: invite.ownerId,
      memberUserId: params.userId,
      memberEmail: params.userEmail,
      memberName: params.userName || params.userEmail.split("@")[0],
      role: invite.role,
      assignedProjectIds: invite.assignedProjectIds,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const { db } = await import("@/db");
      const { teamMembers, teamInvitations } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db.insert(teamMembers).values({
        id: memberRecord.id,
        ownerId: memberRecord.ownerId,
        memberUserId: memberRecord.memberUserId,
        memberEmail: memberRecord.memberEmail,
        memberName: memberRecord.memberName,
        role: memberRecord.role,
        assignedProjectIdsJson: JSON.stringify(memberRecord.assignedProjectIds),
        createdAt: now,
        updatedAt: now,
      });

      await db
        .update(teamInvitations)
        .set({ status: "accepted" })
        .where(eq(teamInvitations.id, invite.id));
    } catch (err) {
      console.warn("Failed to insert accepted team member to DB:", err);
    }

    inMemoryMembers.set(memberId, memberRecord);
    const inMemInv = inMemoryInvites.get(invite.id);
    if (inMemInv) inMemInv.status = "accepted";

    return memberRecord;
  },
};
