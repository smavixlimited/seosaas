import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { AppError } from "@/server/lib/errors";
import {
  isUserSuperAdmin,
  isSuperAdminEmail,
  getAdminOverviewMetrics,
  getAdminPlans,
  upsertAdminPlan,
  getAdminGateways,
  updateAdminGateway,
  getAdminManualPayments,
  reviewManualPayment,
  getAdminUsersList,
} from "@/services/admin.service";

async function assertSuperAdmin(userId: string, email: string) {
  const isSuper = isSuperAdminEmail(email) || (await isUserSuperAdmin(userId));
  if (!isSuper) {
    throw new AppError("FORBIDDEN", "Unauthorized: Superadmin access required");
  }
}

export const getAdminMetricsServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return getAdminOverviewMetrics();
  });

export const getAdminPlansServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return getAdminPlans();
  });

const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceUsd: z.number(),
  priceNgn: z.number(),
  billingInterval: z.string(),
  isActive: z.boolean(),
  limitsJson: z.string(),
  featuresJson: z.string(),
});

export const upsertAdminPlanServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => planSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return upsertAdminPlan(data);
  });

export const getAdminGatewaysServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return getAdminGateways();
  });

const gatewaySchema = z.object({
  gatewayId: z.string(),
  isEnabled: z.boolean(),
  publicKey: z.string().optional().nullable(),
  secretKey: z.string().optional().nullable(),
  manualInstructions: z.string().optional().nullable(),
});

export const updateAdminGatewayServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => gatewaySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return updateAdminGateway(data);
  });

export const getAdminManualPaymentsServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return getAdminManualPayments();
  });

const reviewPaymentSchema = z.object({
  paymentId: z.string(),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const reviewManualPaymentServerFn = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator((d: unknown) => reviewPaymentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return reviewManualPayment({
      ...data,
      reviewerId: context.userId,
    });
  });

export const getAdminUsersServerFn = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId, context.userEmail);
    return getAdminUsersList();
  });
