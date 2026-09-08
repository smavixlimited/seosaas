import { eq, desc, and, or, like, sql, count } from "drizzle-orm";
import { waitlistUsers } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

export interface WaitlistEntryInput {
  email: string;
  name?: string;
  company?: string;
  website?: string;
  useCase?: string;
  ipAddress?: string;
}

export interface WaitlistEntryRecord {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  website: string | null;
  useCase: string | null;
  status: string;
  ipAddress: string | null;
  notes: string | null;
  invitedAt: string | null;
  createdAt: string;
}

export interface WaitlistFilterOptions {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface WaitlistStats {
  total: number;
  pending: number;
  invited: number;
  approved: number;
  rejected: number;
}

export const WaitlistService = {
  /**
   * Submit an application to the waitlist
   */
  async joinWaitlist(input: WaitlistEntryInput): Promise<{
    success: boolean;
    isExisting: boolean;
    position: number;
    entry: WaitlistEntryRecord;
  }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new AppError("VALIDATION_ERROR", "A valid work email is required");
    }

    const { db } = await import("@/db");

    // Check if already on waitlist
    const [existing] = await db
      .select()
      .from(waitlistUsers)
      .where(eq(waitlistUsers.email, normalizedEmail))
      .limit(1);

    if (existing) {
      // Calculate position
      const [posResult] = await db
        .select({ count: count() })
        .from(waitlistUsers)
        .where(sql`${waitlistUsers.createdAt} <= ${existing.createdAt}`);

      return {
        success: true,
        isExisting: true,
        position: Number(posResult?.count ?? 1),
        entry: existing as WaitlistEntryRecord,
      };
    }

    const id =
      "wl_" +
      Math.random().toString(36).substring(2, 11) +
      Date.now().toString(36);
    const now = new Date().toISOString();

    const [created] = await db
      .insert(waitlistUsers)
      .values({
        id,
        email: normalizedEmail,
        name: input.name?.trim() || null,
        company: input.company?.trim() || null,
        website: input.website?.trim() || null,
        useCase: input.useCase?.trim() || null,
        status: "pending",
        ipAddress: input.ipAddress || null,
        createdAt: now,
      })
      .returning();

    const [totalCountResult] = await db
      .select({ count: count() })
      .from(waitlistUsers);

    return {
      success: true,
      isExisting: false,
      position: Number(totalCountResult?.count ?? 1),
      entry: (created || {
        id,
        email: normalizedEmail,
        name: input.name?.trim() || null,
        company: input.company?.trim() || null,
        website: input.website?.trim() || null,
        useCase: input.useCase?.trim() || null,
        status: "pending",
        ipAddress: input.ipAddress || null,
        notes: null,
        invitedAt: null,
        createdAt: now,
      }) as WaitlistEntryRecord,
    };
  },

  /**
   * List waitlist entries with pagination and search
   */
  async listWaitlist(options: WaitlistFilterOptions = {}): Promise<{
    entries: WaitlistEntryRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { db } = await import("@/db");
    const limit = Math.min(options.limit ?? 50, 200);
    const offset = options.offset ?? 0;

    const conditions = [];

    if (options.status && options.status !== "all") {
      conditions.push(eq(waitlistUsers.status, options.status));
    }

    if (options.search && options.search.trim()) {
      const q = `%${options.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${waitlistUsers.email})`, q),
          like(sql`lower(${waitlistUsers.name})`, q),
          like(sql`lower(${waitlistUsers.company})`, q),
          like(sql`lower(${waitlistUsers.website})`, q),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(waitlistUsers)
      .where(whereClause);

    const rows = await db
      .select()
      .from(waitlistUsers)
      .where(whereClause)
      .orderBy(desc(waitlistUsers.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      entries: rows as WaitlistEntryRecord[],
      total: Number(totalResult?.count ?? 0),
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  },

  /**
   * Update status of a waitlist user (pending, invited, approved, rejected)
   */
  async updateStatus(
    id: string,
    status: "pending" | "invited" | "approved" | "rejected",
    notes?: string,
  ): Promise<WaitlistEntryRecord> {
    const { db } = await import("@/db");
    const now = new Date().toISOString();

    const updatePayload: Record<string, unknown> = {
      status,
      notes: notes !== undefined ? notes : undefined,
    };

    if (status === "invited") {
      updatePayload.invitedAt = now;
    }

    const [updated] = await db
      .update(waitlistUsers)
      .set(updatePayload)
      .where(eq(waitlistUsers.id, id))
      .returning();

    if (!updated) {
      throw new AppError("NOT_FOUND", "Waitlist user not found");
    }

    return updated as WaitlistEntryRecord;
  },

  /**
   * Delete a waitlist entry
   */
  async deleteEntry(id: string): Promise<boolean> {
    const { db } = await import("@/db");
    await db.delete(waitlistUsers).where(eq(waitlistUsers.id, id));
    return true;
  },

  /**
   * Get stats for admin overview
   */
  async getStats(): Promise<WaitlistStats> {
    const { db } = await import("@/db");

    const all = await db.select().from(waitlistUsers);

    return {
      total: all.length,
      pending: all.filter((u) => u.status === "pending").length,
      invited: all.filter((u) => u.status === "invited").length,
      approved: all.filter((u) => u.status === "approved").length,
      rejected: all.filter((u) => u.status === "rejected").length,
    };
  },
};
