import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { SecurityAuditService } from "@/services/security-audit.service";
import { AppError } from "@/server/lib/errors";

const filterAuditLogsSchema = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  adminEmail: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

const updateSecurityPoliciesSchema = z.object({
  forceMfaForAdmins: z.boolean(),
  sessionTimeoutMinutes: z.number().int().positive(),
  requirePasswordSpecialChars: z.boolean(),
  minPasswordLength: z.number().int().min(6).max(32),
  ipAllowlist: z.string(),
});

export const getAuditLogsPaginatedServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(filterAuditLogsSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SecurityAuditService.getAuditLogs(data);
  });

export const getSecurityPoliciesServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SecurityAuditService.getSecurityPolicies();
  });

export const updateSecurityPoliciesServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateSecurityPoliciesSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return SecurityAuditService.setSecurityPolicies(
      data,
      context.userId,
      context.userEmail,
    );
  });
