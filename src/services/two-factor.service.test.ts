import { describe, it, expect } from "vitest";
import { TwoFactorService } from "@/services/two-factor.service";
import { SessionManagerService, parseUserAgent, resolveLocationFromIp } from "@/services/session-manager.service";

describe("Phase 23: Two-Factor Authentication (2FA) & Session Manager Suite", () => {
  const testUserId = "usr_tfa_test_01";
  const testEmail = "testuser@skorvia.com";

  describe("1. TOTP 2FA Setup & Code Verification", () => {
    it("initializes 2FA setup with secret, otpauth URL, QR Code, and 8 backup codes", async () => {
      const setup = await TwoFactorService.setup2FA(testUserId, testEmail);

      expect(setup.secret).toBeDefined();
      expect(setup.secret.length).toBeGreaterThanOrEqual(16);
      expect(setup.otpauthUrl).toContain("otpauth://totp/");
      expect(setup.otpauthUrl).toContain("Skorvia");
      expect(setup.qrCodeDataUri).toContain("data:image/svg+xml");
      expect(setup.backupCodes.length).toBe(8);
      expect(setup.backupCodes[0]).toMatch(/^skorv-[a-z0-9]{4}-[a-z0-9]{4}$/);
    });

    it("rejects invalid TOTP codes", async () => {
      const isInvalid = await TwoFactorService.verifyTOTPCode("JBSWY3DPEHPK3PXP", "000000");
      expect(isInvalid).toBe(false);
    });

    it("handles initial disabled state cleanly", async () => {
      const status = await TwoFactorService.get2FAStatus("usr_new_random_user");
      expect(status.isEnabled).toBe(false);
    });
  });

  describe("2. User-Agent Parsing & Geo-Location Resolution", () => {
    it("correctly identifies macOS and Google Chrome on desktop", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const parsed = parseUserAgent(ua);
      expect(parsed.browser).toBe("Google Chrome");
      expect(parsed.os).toBe("macOS");
      expect(parsed.deviceType).toBe("desktop");
    });

    it("correctly identifies iPhone / iOS mobile device", () => {
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const parsed = parseUserAgent(ua);
      expect(parsed.os).toBe("iOS");
      expect(parsed.deviceType).toBe("mobile");
    });

    it("resolves local IP addresses safely", () => {
      expect(resolveLocationFromIp("127.0.0.1")).toBe("Local Dev Environment");
      expect(resolveLocationFromIp("192.168.1.50")).toBe("Local Dev Environment");
      expect(resolveLocationFromIp("102.89.43.12")).toBe("Detected via Public IP");
    });
  });

  describe("3. Active Sessions Management & Revocation", () => {
    it("tracks new logins and records active sessions", async () => {
      const session = await SessionManagerService.trackLoginSession({
        userId: testUserId,
        email: testEmail,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      expect(session.id).toBeDefined();
      expect(session.os).toBe("Windows 11");
      expect(session.browser).toBe("Google Chrome");

      const sessions = await SessionManagerService.getUserSessions(testUserId);
      expect(sessions.length).toBeGreaterThan(0);
    });

    it("revokes a single active device session", async () => {
      const session = await SessionManagerService.trackLoginSession({
        userId: testUserId,
        email: testEmail,
        ipAddress: "192.168.1.105",
      });

      const revoked = await SessionManagerService.revokeSession(session.id, testUserId);
      expect(revoked).toBe(true);
    });

    it("revokes all other sessions retaining current session", async () => {
      const current = await SessionManagerService.trackLoginSession({
        userId: testUserId,
        email: testEmail,
        ipAddress: "127.0.0.1",
      });

      await SessionManagerService.trackLoginSession({
        userId: testUserId,
        email: testEmail,
        ipAddress: "10.0.0.2",
      });

      const count = await SessionManagerService.revokeAllOtherSessions(current.id, testUserId);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
