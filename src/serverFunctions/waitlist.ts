import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { AppError } from "@/server/lib/errors";
import { isUserSuperAdmin, isSuperAdminEmail } from "@/services/admin.service";
import { WaitlistService } from "@/services/waitlist.service";
import { SystemSettingsService } from "@/services/system-settings.service";

async function assertSuperAdmin(userId: string, email: string) {
  const isSuper = isSuperAdminEmail(email) || (await isUserSuperAdmin(userId));
  if (!isSuper) {
    throw new AppError("FORBIDDEN", "Unauthorized: Superadmin access required");
  }
}

/**
 * Public endpoint to fetch auth & registration configuration
 */
export const getPublicAuthSettingsServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const branding = await SystemSettingsService.getBranding();
  const authApis = await SystemSettingsService.getAuthSecurityApis();

  // Google login is enabled if admin configured Google client ID or enabled it
  const isGoogleConfigured = Boolean(
    authApis.googleClientId && authApis.googleClientId.trim().length > 0,
  );

  return {
    publicRegistrationEnabled: branding.publicRegistrationEnabled ?? true,
    googleAuthEnabled: isGoogleConfigured,
    siteTitle: branding.siteTitle || "Skorvia",
  };
});

/**
 * Public endpoint to join the waitlist
 */
export const joinWaitlistServerFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
      company: z.string().optional(),
      website: z.string().optional(),
      useCase: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return WaitlistService.joinWaitlist(data);
  });

/**
 * Admin endpoint to list all waitlist users & stats
 */
export const getAdminWaitlistServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .validator(
    z
      .object({
        search: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
      .optional(),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    const [listResult, stats] = await Promise.all([
      WaitlistService.listWaitlist(data || {}),
      WaitlistService.getStats(),
    ]);

    return {
      ...listResult,
      stats,
    };
  });

/**
 * Admin endpoint to update waitlist entry status
 */
export const updateAdminWaitlistStatusServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireAuthenticatedContext)
  .validator(
    z.object({
      id: z.string(),
      status: z.enum(["pending", "invited", "approved", "rejected"]),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return WaitlistService.updateStatus(data.id, data.status, data.notes);
  });

/**
 * Admin endpoint to delete a waitlist entry
 */
export const deleteAdminWaitlistServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return WaitlistService.deleteEntry(data.id);
  });
