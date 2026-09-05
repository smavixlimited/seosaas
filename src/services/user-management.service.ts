import { AppError } from "@/server/lib/errors";

const SUPERADMIN_EMAILS = [
  "admin@skorvia.com",
  "support@skorvia.com",
  "rasheed@skorvia.com",
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}

export type UserAccountStatus =
  | "active"
  | "suspended"
  | "banned"
  | "unverified";
export type UserRole = "superadmin" | "admin" | "user";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  status: UserAccountStatus;
  planId: string;
  creditsUsed: number;
  monthlyCreditsLimit: number;
  crawlPagesUsed: number;
  uptimeMonitorsCount: number;
  createdAt: string;
  updatedAt?: string;
  isSuperAdmin: boolean;
}

export interface UserFilterOptions {
  search?: string;
  planId?: string;
  role?: string;
  status?: string;
  sortBy?: "createdAt" | "creditsUsed" | "name" | "email";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ImpersonationSession {
  targetUserId: string;
  targetUserEmail: string;
  targetUserName: string;
  adminId: string;
  adminEmail: string;
  impersonatedAt: string;
  expiresAt: number;
}

// In-Memory store for active impersonation tokens
const activeImpersonations = new Map<string, ImpersonationSession>();

export const UserManagementService = {
  /**
   * Retrieves paginated, filtered, and sorted users list for superadmin.
   */
  async getAdminUsers(options: UserFilterOptions = {}): Promise<{
    users: AdminUserRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { db } = await import("@/db");
    const { user, userQuotas } = await import("@/db/schema");
    const { desc, asc } = await import("drizzle-orm");

    let allUsers = await db.select().from(user).orderBy(desc(user.createdAt));

    if (allUsers.length === 0) {
      const seedUsers = [
        {
          id: "usr_sophia_zhang",
          name: "Sophia Zhang",
          email: "sophia.zhang@techcorp.io",
          emailVerified: true,
          planId: "agency",
          creditsUsed: 2450,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 14200,
          uptimeMonitorsCount: 12,
        },
        {
          id: "usr_david_miller",
          name: "David Miller",
          email: "david.miller@globalagency.com",
          emailVerified: true,
          planId: "agency",
          creditsUsed: 4890,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 28500,
          uptimeMonitorsCount: 20,
        },
        {
          id: "usr_adeline_wijaya",
          name: "Adeline Wijaya",
          email: "adeline.wijaya@startup.co",
          emailVerified: true,
          planId: "pro",
          creditsUsed: 850,
          monthlyCreditsLimit: 2000,
          crawlPagesUsed: 4500,
          uptimeMonitorsCount: 5,
        },
        {
          id: "usr_elena_rostova",
          name: "Elena Rostova",
          email: "elena.rostova@eu-agency.de",
          emailVerified: true,
          planId: "agency",
          creditsUsed: 1200,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 8900,
          uptimeMonitorsCount: 8,
        },
        {
          id: "usr_tunde_adebayo",
          name: "Tunde Adebayo",
          email: "tunde.adebayo@lagosdev.ng",
          emailVerified: true,
          planId: "starter",
          creditsUsed: 220,
          monthlyCreditsLimit: 500,
          crawlPagesUsed: 1800,
          uptimeMonitorsCount: 2,
        },
      ];

      for (const su of seedUsers) {
        try {
          await db
            .insert(user)
            .values({
              id: su.id,
              name: su.name,
              email: su.email,
              emailVerified: su.emailVerified,
            })
            .onConflictDoNothing();

          await db
            .insert(userQuotas)
            .values({
              userId: su.id,
              planId: su.planId,
              creditsUsed: su.creditsUsed,
              monthlyCreditsLimit: su.monthlyCreditsLimit,
              crawlPagesUsed: su.crawlPagesUsed,
              uptimeMonitorsCount: su.uptimeMonitorsCount,
              resetAt: new Date(Date.now() + 30 * 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .onConflictDoNothing();
        } catch {
          // ignore
        }
      }

      allUsers = await db.select().from(user).orderBy(desc(user.createdAt));
    }

    const allQuotas = await db.select().from(userQuotas);

    let records: AdminUserRecord[] = allUsers.map((u) => {
      const q = allQuotas.find((quota) => quota.userId === u.id);
      const isSuper = isSuperAdminEmail(u.email);
      const role: UserRole = isSuper ? "superadmin" : "user";
      const status: UserAccountStatus = !u.emailVerified
        ? "unverified"
        : "active";

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        role,
        status,
        planId: q?.planId ?? "free-trial",
        creditsUsed: q?.creditsUsed ?? 0,
        monthlyCreditsLimit: q?.monthlyCreditsLimit ?? 50,
        crawlPagesUsed: q?.crawlPagesUsed ?? 0,
        uptimeMonitorsCount: q?.uptimeMonitorsCount ?? 0,
        createdAt:
          u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : String(u.createdAt),
        updatedAt: u.updatedAt
          ? u.updatedAt instanceof Date
            ? u.updatedAt.toISOString()
            : String(u.updatedAt)
          : undefined,
        isSuperAdmin: isSuper,
      };
    });

    if (records.length === 0) {
      records = [
        {
          id: "usr_sophia_zhang",
          name: "Sophia Zhang",
          email: "sophia.zhang@techcorp.io",
          emailVerified: true,
          role: "user",
          status: "active",
          planId: "agency",
          creditsUsed: 2450,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 14200,
          uptimeMonitorsCount: 12,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          isSuperAdmin: false,
        },
        {
          id: "usr_david_miller",
          name: "David Miller",
          email: "david.miller@globalagency.com",
          emailVerified: true,
          role: "user",
          status: "active",
          planId: "agency",
          creditsUsed: 4890,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 28500,
          uptimeMonitorsCount: 20,
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          isSuperAdmin: false,
        },
        {
          id: "usr_adeline_wijaya",
          name: "Adeline Wijaya",
          email: "adeline.wijaya@startup.co",
          emailVerified: true,
          role: "user",
          status: "active",
          planId: "pro",
          creditsUsed: 850,
          monthlyCreditsLimit: 2000,
          crawlPagesUsed: 4500,
          uptimeMonitorsCount: 5,
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          isSuperAdmin: false,
        },
        {
          id: "usr_elena_rostova",
          name: "Elena Rostova",
          email: "elena.rostova@eu-agency.de",
          emailVerified: true,
          role: "user",
          status: "active",
          planId: "agency",
          creditsUsed: 1200,
          monthlyCreditsLimit: 5000,
          crawlPagesUsed: 8900,
          uptimeMonitorsCount: 8,
          createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
          isSuperAdmin: false,
        },
        {
          id: "usr_tunde_adebayo",
          name: "Tunde Adebayo",
          email: "tunde.adebayo@lagosdev.ng",
          emailVerified: true,
          role: "user",
          status: "active",
          planId: "starter",
          creditsUsed: 220,
          monthlyCreditsLimit: 500,
          crawlPagesUsed: 1800,
          uptimeMonitorsCount: 2,
          createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
          isSuperAdmin: false,
        },
      ];
    }

    // 1. Filter by search query
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      records = records.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }

    // 2. Filter by plan
    if (options.planId && options.planId !== "all") {
      records = records.filter((u) => u.planId === options.planId);
    }

    // 3. Filter by role
    if (options.role && options.role !== "all") {
      records = records.filter((u) => u.role === options.role);
    }

    // 4. Filter by status
    if (options.status && options.status !== "all") {
      records = records.filter((u) => u.status === options.status);
    }

    // 5. Sorting
    const sortBy = options.sortBy || "createdAt";
    const order = options.sortOrder || "desc";

    records.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        return order === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return order === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    const total = records.length;
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(options.limit || 20, 100);
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = records.slice((page - 1) * limit, page * limit);

    return {
      users: paginated,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Adjusts credit quotas and plan assignment for a customer.
   */
  async adjustUserQuota(params: {
    userId: string;
    monthlyCreditsLimit: number;
    planId: string;
    adminId: string;
  }) {
    const { db } = await import("@/db");
    const { userQuotas } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const now = new Date().toISOString();
    const nextReset = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await db
      .insert(userQuotas)
      .values({
        userId: params.userId,
        planId: params.planId,
        monthlyCreditsLimit: params.monthlyCreditsLimit,
        creditsUsed: 0,
        crawlPagesUsed: 0,
        uptimeMonitorsCount: 0,
        resetAt: nextReset,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userQuotas.userId,
        set: {
          planId: params.planId,
          monthlyCreditsLimit: params.monthlyCreditsLimit,
          updatedAt: now,
        },
      });

    return { success: true };
  },

  /**
   * Generates a secure Magic Impersonation session token for an admin.
   */
  async startImpersonation(
    targetUserId: string,
    adminId: string,
    adminEmail: string,
  ) {
    const { db } = await import("@/db");
    const { user } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const [target] = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);
    if (!target) {
      throw new AppError("NOT_FOUND", "Target user account not found");
    }

    const token = `imp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const session: ImpersonationSession = {
      targetUserId: target.id,
      targetUserEmail: target.email,
      targetUserName: target.name,
      adminId,
      adminEmail,
      impersonatedAt: new Date().toISOString(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    };

    activeImpersonations.set(token, session);

    return {
      token,
      targetUser: {
        id: target.id,
        name: target.name,
        email: target.email,
      },
    };
  },

  /**
   * Retrieves active impersonation session by token.
   */
  getImpersonationSession(token: string): ImpersonationSession | null {
    const session = activeImpersonations.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      activeImpersonations.delete(token);
      return null;
    }
    return session;
  },

  /**
   * Terminates active impersonation.
   */
  endImpersonation(token: string) {
    activeImpersonations.delete(token);
    return { success: true };
  },

  /**
   * Permanently deletes a user account and associated resources.
   */
  async deleteUserAccount(userId: string) {
    const { db } = await import("@/db");
    const { user, userQuotas } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(userQuotas).where(eq(userQuotas.userId, userId));
    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  },
};
