import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { TwoFactorService } from "@/services/two-factor.service";
import { SessionManagerService } from "@/services/session-manager.service";

const verifyCodeSchema = z.object({
  code: z.string().min(6).max(24),
});

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1),
});

const login2FASchema = z.object({
  userId: z.string().min(1),
  code: z.string().min(6).max(24),
});

/**
 * Returns 2FA activation status for current logged-in user.
 */
export const get2FAStatusServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return TwoFactorService.get2FAStatus(context.userId);
  });

/**
 * Initiates 2FA setup: generates secret, SVG QR Code, and 8 emergency backup codes.
 */
export const setup2FAServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return TwoFactorService.setup2FA(context.userId, context.userEmail);
  });

/**
 * Confirms 6-digit code and activates 2FA.
 */
export const enable2FAServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(verifyCodeSchema)
  .handler(async ({ data, context }) => {
    return TwoFactorService.verifyAndEnable2FA(
      context.userId,
      data.code,
      context.userEmail,
    );
  });

/**
 * Disables 2FA with verification code.
 */
export const disable2FAServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(verifyCodeSchema)
  .handler(async ({ data, context }) => {
    return TwoFactorService.disable2FA(
      context.userId,
      data.code,
      context.userEmail,
    );
  });

/**
 * Validates 2FA code or backup recovery code during login.
 */
export const verify2FALoginServerFn = createServerFn({ method: "POST" })
  .validator(login2FASchema)
  .handler(async ({ data }) => {
    const isValid = await TwoFactorService.verifyLogin2FA(
      data.userId,
      data.code,
    );
    return { isValid };
  });

/**
 * Retrieves all active sessions and device info for the current user.
 */
export const getUserSessionsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    return SessionManagerService.getUserSessions(context.userId);
  });

/**
 * Revokes a single session.
 */
export const revokeSessionServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(revokeSessionSchema)
  .handler(async ({ data, context }) => {
    return SessionManagerService.revokeSession(
      data.sessionId,
      context.userId,
      context.userEmail,
    );
  });

/**
 * Revokes all other sessions except current.
 */
export const revokeAllOtherSessionsServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(revokeSessionSchema)
  .handler(async ({ data, context }) => {
    return SessionManagerService.revokeAllOtherSessions(
      data.sessionId,
      context.userId,
      context.userEmail,
    );
  });
