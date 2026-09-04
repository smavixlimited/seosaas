import { AppError } from "@/server/lib/errors";

export interface ProjectBackupSnapshot {
  version: "1.0";
  exportedAt: string;
  projectId: string;
  project: {
    name: string;
    domain: string;
    locationCode?: number;
    languageCode?: string;
  };
  contextSections?: Array<{
    key: string;
    title?: string | null;
    content: string;
  }>;
  keyPages?: Array<{
    url: string;
    role?: "other" | "hub" | "spoke" | "money";
    topic?: string | null;
    notes?: string | null;
  }>;
  uptimeMonitors?: Array<{
    url: string;
    status: string;
  }>;
  indexingSubmissions?: Array<{
    host: string;
    urlCount: number;
    urls: string[];
    createdAt: string;
  }>;
}

export const BackupService = {
  /**
   * Generates a portable JSON backup snapshot of a project.
   */
  async createProjectBackupSnapshot(
    projectId: string
  ): Promise<ProjectBackupSnapshot> {
    const { db } = await import("@/db");
    const {
      projects,
      projectContextSections,
      projectKeyPages,
      uptimeMonitors,
      indexingSubmissions,
    } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    // Fetch project
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      throw new AppError("NOT_FOUND", "Project not found");
    }

    // Fetch project context sections
    const sections = await db
      .select()
      .from(projectContextSections)
      .where(eq(projectContextSections.projectId, projectId));

    // Fetch key pages
    const pages = await db
      .select()
      .from(projectKeyPages)
      .where(eq(projectKeyPages.projectId, projectId));

    // Fetch uptime monitors
    const monitors = await db
      .select()
      .from(uptimeMonitors)
      .where(eq(uptimeMonitors.projectId, projectId));

    // Fetch indexing submissions
    const submissions = await db
      .select()
      .from(indexingSubmissions)
      .where(eq(indexingSubmissions.projectId, projectId));

    const snapshot: ProjectBackupSnapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      projectId: project.id,
      project: {
        name: project.name,
        domain: project.domain || "example.com",
        locationCode: project.locationCode,
        languageCode: project.languageCode,
      },
      contextSections: sections.map((s) => ({
        key: s.key,
        title: s.title,
        content: s.content,
      })),
      keyPages: pages.map((p) => ({
        url: p.url,
        role: p.role,
        topic: p.topic,
        notes: p.notes,
      })),
      uptimeMonitors: monitors.map((m) => ({
        url: m.url,
        status: m.status,
      })),
      indexingSubmissions: submissions.map((s) => ({
        host: s.host,
        urlCount: s.urlCount,
        urls: JSON.parse(s.urlsJson || "[]"),
        createdAt: s.createdAt,
      })),
    };

    return snapshot;
  },

  /**
   * Validates and restores a project backup snapshot into the user's active organization.
   */
  async restoreProjectBackupSnapshot(
    snapshot: ProjectBackupSnapshot,
    userId: string,
    organizationId: string
  ) {
    if (!snapshot || snapshot.version !== "1.0" || !snapshot.project?.domain) {
      throw new AppError("VALIDATION_ERROR", "Invalid backup snapshot payload structure");
    }

    const { db } = await import("@/db");
    const {
      projects,
      projectContextSections,
      projectKeyPages,
      uptimeMonitors,
    } = await import("@/db/schema");

    const restoredProjectId = `proj_restored_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    await db.insert(projects).values({
      id: restoredProjectId,
      organizationId,
      name: `${snapshot.project.name} (Restored)`,
      domain: snapshot.project.domain,
      locationCode: snapshot.project.locationCode || 2840,
      languageCode: snapshot.project.languageCode || "en",
      createdAt: now,
    });

    // Restore context sections
    if (snapshot.contextSections && snapshot.contextSections.length > 0) {
      for (const section of snapshot.contextSections) {
        await db.insert(projectContextSections).values({
          projectId: restoredProjectId,
          key: section.key,
          title: section.title || null,
          content: section.content,
          updatedAt: now,
          updatedBy: "user",
        });
      }
    }

    // Restore key pages
    if (snapshot.keyPages && snapshot.keyPages.length > 0) {
      for (const page of snapshot.keyPages) {
        const pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await db.insert(projectKeyPages).values({
          id: pageId,
          projectId: restoredProjectId,
          url: page.url,
          role: page.role || "other",
          topic: page.topic || null,
          notes: page.notes || null,
          updatedAt: now,
          updatedBy: "user",
        });
      }
    }

    // Restore uptime monitors
    if (snapshot.uptimeMonitors && snapshot.uptimeMonitors.length > 0) {
      for (const mon of snapshot.uptimeMonitors) {
        const monId = `mon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await db.insert(uptimeMonitors).values({
          id: monId,
          userId,
          projectId: restoredProjectId,
          url: mon.url,
          status: mon.status as "up" | "down" | "degraded",
          createdAt: now,
        });
      }
    }

    return {
      success: true,
      restoredProjectId,
      projectName: `${snapshot.project.name} (Restored)`,
      restoredPagesCount: snapshot.keyPages?.length || 0,
      restoredMonitorsCount: snapshot.uptimeMonitors?.length || 0,
    };
  },
};
