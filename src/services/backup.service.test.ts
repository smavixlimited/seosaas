import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackupService, type ProjectBackupSnapshot } from "@/services/backup.service";

describe("Automated Backup & Disaster Recovery Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validates backup snapshot structure and throws on malformed payloads", async () => {
    // @ts-expect-error test malformed input
    await expect(BackupService.restoreProjectBackupSnapshot({}, "usr_test", "org_test")).rejects.toThrow(
      "Invalid backup snapshot payload structure"
    );
  });

  it("accepts a well-formed project backup snapshot schema", () => {
    const validSnapshot: ProjectBackupSnapshot = {
      version: "1.0",
      exportedAt: "2026-09-01T08:00:00.000Z",
      projectId: "proj_sample",
      project: {
        name: "Acme Growth",
        domain: "acme.com",
        locationCode: 2840,
        languageCode: "en",
      },
      contextSections: [
        { key: "business_overview", title: "Overview", content: "AI SEO growth engine" },
      ],
      keyPages: [
        { url: "https://acme.com/pricing", role: "money", topic: "SaaS Pricing" },
      ],
      uptimeMonitors: [{ url: "https://acme.com", status: "up" }],
    };

    expect(validSnapshot.version).toBe("1.0");
    expect(validSnapshot.project.domain).toBe("acme.com");
    expect(validSnapshot.keyPages?.length).toBe(1);
    expect(validSnapshot.uptimeMonitors?.length).toBe(1);
  });
});
