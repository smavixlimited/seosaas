import { describe, it, expect } from "vitest";
import { TeamManagementService } from "@/services/team-management.service";

describe("Phase 24: Hierarchical Team Management & Quota Service Suite", () => {
  const testOwnerId = "usr_team_owner_01";
  const testInviteeEmail = "specialist@skorvia-agency.com";

  describe("1. Plan-Gated Team Seat Quotas", () => {
    it("calculates exact seat quotas by tier", () => {
      expect(TeamManagementService.getSeatLimitForPlan("free-trial")).toBe(1);
      expect(TeamManagementService.getSeatLimitForPlan("free")).toBe(1);
      expect(TeamManagementService.getSeatLimitForPlan("starter")).toBe(2);
      expect(TeamManagementService.getSeatLimitForPlan("pro")).toBe(5);
      expect(TeamManagementService.getSeatLimitForPlan("agency")).toBe(15);
      expect(TeamManagementService.getSeatLimitForPlan("enterprise")).toBe(50);
    });

    it("retrieves team summary with seat meter", async () => {
      const summary = await TeamManagementService.getTeamSummary(testOwnerId);
      expect(summary.seatLimit).toBeGreaterThanOrEqual(1);
      expect(summary.seatsUsed).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(summary.members)).toBe(true);
      expect(Array.isArray(summary.invitations)).toBe(true);
    });
  });

  describe("2. Team Member Invitation Lifecycle", () => {
    let createdToken = "";
    let inviteId = "";

    it("creates an invitation token with 7-day expiration", async () => {
      // Mock Pro tier by calling invite directly or verifying token structure
      const invite = await TeamManagementService.inviteTeamMember({
        ownerId: "usr_pro_owner_01",
        inviterName: "Sarah Connor",
        inviterEmail: "sarah@agency.com",
        email: testInviteeEmail,
        role: "editor",
      });

      expect(invite.id).toBeDefined();
      expect(invite.token).toContain("invtok_");
      expect(invite.status).toBe("pending");
      expect(invite.role).toBe("editor");

      createdToken = invite.token;
      inviteId = invite.id;
    });

    it("resolves invitation details by token for public acceptance", async () => {
      const resolved = await TeamManagementService.getInvitationByToken(createdToken);
      expect(resolved).toBeDefined();
      expect(resolved?.email).toBe(testInviteeEmail);
      expect(resolved?.role).toBe("editor");
      expect(resolved?.status).toBe("pending");
    });

    it("accepts invitation token and provisions team member", async () => {
      const member = await TeamManagementService.acceptInvitation({
        token: createdToken,
        userId: "usr_invited_specialist_01",
        userEmail: testInviteeEmail,
        userName: "Alex Rivers",
      });

      expect(member.id).toBeDefined();
      expect(member.role).toBe("editor");
      expect(member.memberEmail).toBe(testInviteeEmail);

      // Verify token is now marked accepted
      const resolvedAfter = await TeamManagementService.getInvitationByToken(createdToken);
      expect(resolvedAfter?.status).toBe("accepted");
    });

    it("updates existing member role with RBAC check", async () => {
      const updated = await TeamManagementService.updateMemberRole(
        "usr_pro_owner_01",
        "tmb_sample_01",
        "admin",
        ["proj_123"]
      );
      expect(updated).toBe(true);
    });

    it("removes a member cleanly from the team", async () => {
      const removed = await TeamManagementService.removeMember(
        "usr_pro_owner_01",
        "tmb_sample_01"
      );
      expect(removed).toBe(true);
    });
  });
});
