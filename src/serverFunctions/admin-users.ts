import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { isUserSuperAdmin } from "@/services/admin.service";
import { UserManagementService } from "@/services/user-management.service";
import { AppError } from "@/server/lib/errors";

const filterUsersSchema = z.object({
  search: z.string().optional(),
  planId: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(["createdAt", "creditsUsed", "name", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

const adjustQuotaSchema = z.object({
  userId: z.string().min(1),
  monthlyCreditsLimit: z.number().int().nonnegative(),
  planId: z.string().min(1),
});

const impersonationSchema = z.object({
  targetUserId: z.string().min(1),
});

const endImpersonationSchema = z.object({
  token: z.string().min(1),
});

const deleteUserSchema = z.object({
  userId: z.string().min(1),
});

export const getAdminUsersPaginatedServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(filterUsersSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return UserManagementService.getAdminUsers(data);
  });

export const adjustUserQuotaServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(adjustQuotaSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return UserManagementService.adjustUserQuota({
      ...data,
      adminId: context.userId,
    });
  });

export const startUserImpersonationServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(impersonationSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return UserManagementService.startImpersonation(
      data.targetUserId,
      context.userId,
      context.userEmail,
    );
  });

export const endUserImpersonationServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(endImpersonationSchema)
  .handler(async ({ data }) => {
    return UserManagementService.endImpersonation(data.token);
  });

export const deleteUserAccountServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(deleteUserSchema)
  .handler(async ({ data, context }) => {
    const isSuper = await isUserSuperAdmin(context.userId);
    if (!isSuper) throw new AppError("FORBIDDEN", "Superadmin access required");

    return UserManagementService.deleteUserAccount(data.userId);
  });
