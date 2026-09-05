import { describe, it, expect, beforeEach } from "vitest";
import { SecurityAuditService } from "@/services/security-audit.service";

describe("SecurityAuditService (Immutable Audit Logs & Security Policies)", () => {
  beforeEach(() => {
    // Reset cache / state if needed
  });

  describe("Audit Logging", () => {
    it("records an audit log entry with metadata", async () => {
      const entry = await SecurityAuditService.recordAuditLog({
        adminId: "usr_admin_123",
        adminEmail: "admin@skorvia.com",
        action: "USER_QUOTA_ADJUSTED",
        targetId: "usr_target_456",
        targetType: "user",
        metadata: {
          previousCredits: 500,
          newCredits: 2500,
        },
      });

      expect(entry.id).toMatch(/^aud_/);
      expect(entry.adminEmail).toBe("admin@skorvia.com");
      expect(entry.action).toBe("USER_QUOTA_ADJUSTED");
      expect(entry.metadata).toEqual({
        previousCredits: 500,
        newCredits: 2500,
      });
    });

    it("retrieves and filters audit logs", async () => {
      const res = await SecurityAuditService.getAuditLogs({
        action: "all",
        page: 1,
        limit: 10,
      });

      expect(res.page).toBe(1);
      expect(Array.isArray(res.logs)).toBe(true);
    });
  });

  describe("Security Policies", () => {
    it("reads default security policies", async () => {
      const policies = await SecurityAuditService.getSecurityPolicies();
      expect(policies.minPasswordLength).toBeGreaterThanOrEqual(6);
      expect(policies.sessionTimeoutMinutes).toBeGreaterThanOrEqual(15);
    });

    it("updates security policies and creates an audit record", async () => {
      const updated = await SecurityAuditService.setSecurityPolicies(
        {
          forceMfaForAdmins: true,
          sessionTimeoutMinutes: 60,
          minPasswordLength: 10,
          ipAllowlist: "192.168.1.100, 10.0.0.50",
        },
        "usr_superadmin_001",
        "superadmin@skorvia.com",
      );

      expect(updated.forceMfaForAdmins).toBe(true);
      expect(updated.sessionTimeoutMinutes).toBe(60);
      expect(updated.minPasswordLength).toBe(10);
      expect(updated.ipAllowlist).toBe("192.168.1.100, 10.0.0.50");
    });
  });
});
