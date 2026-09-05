import { SystemSettingsService } from "@/services/system-settings.service";

export type AuditAction =
  | "USER_QUOTA_ADJUSTED"
  | "USER_DELETED"
  | "USER_STATUS_CHANGED"
  | "API_KEY_UPDATED"
  | "BRANDING_UPDATED"
  | "IMPERSONATION_STARTED"
  | "SECURITY_POLICY_UPDATED"
  | "PLAN_PRICE_CHANGED"
  | "MANUAL_PAYMENT_APPROVED"
  | "MANUAL_PAYMENT_REJECTED";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  ipAddress: string | null;
  metadata: Record<string, JsonValue> | null;
  createdAt: string;
}

export interface SecurityPolicies {
  forceMfaForAdmins: boolean;
  sessionTimeoutMinutes: number;
  requirePasswordSpecialChars: boolean;
  minPasswordLength: number;
  ipAllowlist: string;
}

export interface AuditLogFilterOptions {
  search?: string;
  action?: string;
  adminEmail?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_SECURITY_POLICIES: SecurityPolicies = {
  forceMfaForAdmins: false,
  sessionTimeoutMinutes: 120,
  requirePasswordSpecialChars: true,
  minPasswordLength: 8,
  ipAllowlist: "",
};

export const SecurityAuditService = {
  /**
   * Logs an immutable admin action to the audit_logs table.
   */
  async recordAuditLog(params: {
    adminId: string;
    adminEmail: string;
    action: AuditAction | string;
    targetId?: string | null;
    targetType?: string | null;
    ipAddress?: string | null;
    metadata?: Record<string, JsonValue> | null;
  }): Promise<AuditLogEntry> {
    const id = `aud_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const metadataJson = params.metadata
      ? JSON.stringify(params.metadata)
      : null;

    try {
      const { db } = await import("@/db");
      const { auditLogs } = await import("@/db/schema");

      await db.insert(auditLogs).values({
        id,
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        action: params.action,
        targetId: params.targetId ?? null,
        targetType: params.targetType ?? null,
        ipAddress: params.ipAddress ?? null,
        metadataJson,
        createdAt: now,
      });
    } catch (err) {
      console.warn("Failed to persist audit log to DB:", err);
    }

    return {
      id,
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.action,
      targetId: params.targetId ?? null,
      targetType: params.targetType ?? null,
      ipAddress: params.ipAddress ?? null,
      metadata: params.metadata ?? null,
      createdAt: now,
    };
  },

  /**
   * Retrieves paginated audit logs with search and filtering.
   */
  async getAuditLogs(options: AuditLogFilterOptions = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let allLogs: AuditLogEntry[] = [];

    try {
      const { db } = await import("@/db");
      const { auditLogs } = await import("@/db/schema");
      const { desc } = await import("drizzle-orm");

      const rows = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(500);

      allLogs = rows.map((r) => {
        let metadata = null;
        if (r.metadataJson) {
          try {
            metadata = JSON.parse(r.metadataJson);
          } catch {}
        }

        return {
          id: r.id,
          adminId: r.adminId,
          adminEmail: r.adminEmail,
          action: r.action,
          targetId: r.targetId,
          targetType: r.targetType,
          ipAddress: r.ipAddress,
          metadata,
          createdAt: r.createdAt
            ? String(r.createdAt)
            : new Date().toISOString(),
        };
      });
    } catch {
      // Fallback on in-memory / testing
    }

    // 1. Search Query
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      allLogs = allLogs.filter(
        (l) =>
          l.adminEmail.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.targetId && l.targetId.toLowerCase().includes(q)) ||
          (l.targetType && l.targetType.toLowerCase().includes(q)),
      );
    }

    // 2. Action Filter
    if (options.action && options.action !== "all") {
      allLogs = allLogs.filter((l) => l.action === options.action);
    }

    // 3. Admin Email Filter
    if (options.adminEmail && options.adminEmail !== "all") {
      allLogs = allLogs.filter(
        (l) => l.adminEmail.toLowerCase() === options.adminEmail?.toLowerCase(),
      );
    }

    const total = allLogs.length;
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(options.limit || 20, 100);
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = allLogs.slice((page - 1) * limit, page * limit);

    return {
      logs: paginated,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Retrieves security enforcement policies.
   */
  async getSecurityPolicies(): Promise<SecurityPolicies> {
    return SystemSettingsService.getSetting<SecurityPolicies>(
      "security_policies",
      DEFAULT_SECURITY_POLICIES,
    );
  },

  /**
   * Updates security enforcement policies and writes an audit log.
   */
  async setSecurityPolicies(
    policies: Partial<SecurityPolicies>,
    adminId: string,
    adminEmail: string,
  ): Promise<SecurityPolicies> {
    const current = await this.getSecurityPolicies();
    const updated = { ...current, ...policies };

    await SystemSettingsService.setSetting<SecurityPolicies>(
      "security_policies",
      updated,
      adminId,
    );

    // Audit log
    await this.recordAuditLog({
      adminId,
      adminEmail,
      action: "SECURITY_POLICY_UPDATED",
      targetId: "security_policies",
      targetType: "system_settings",
      metadata: {
        previous: current as unknown as JsonValue,
        updated: updated as unknown as JsonValue,
      },
    });

    return updated;
  },
};
