import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { BacklinkProspectingService } from "@/services/backlink-prospecting.service";

describe("BacklinkProspectingService", () => {
  it("generates an AI outreach pitch with 3 subject lines, email body, follow-up, and social DM", async () => {
    const pitch = await BacklinkProspectingService.generateOutreachPitch(
      "test-proj-123",
      {
        prospectDomain: "g2.com",
        prospectName: "G2 Reviews",
        angle: "competitor_alternative",
        customNotes: "Focus on automated AI workflows",
      },
    );

    expect(pitch).toBeDefined();
    expect(pitch.prospectDomain).toBe("g2.com");
    expect(pitch.recommendedAngle).toBe("competitor_alternative");
    expect(pitch.subjectLines.length).toBeGreaterThanOrEqual(2);
    expect(pitch.pitchBody).toContain("g2.com");
    expect(pitch.followUpBody).toBeDefined();
    expect(pitch.socialDmBody).toBeDefined();
    expect(pitch.strategicAngles.length).toBeGreaterThan(0);
  });

  it("handles resource inclusion outreach angle correctly", async () => {
    const pitch = await BacklinkProspectingService.generateOutreachPitch(
      "test-proj-123",
      {
        prospectDomain: "producthunt.com",
        prospectName: "Product Hunt",
        angle: "resource_inclusion",
      },
    );

    expect(pitch.recommendedAngle).toBe("resource_inclusion");
    expect(pitch.subjectLines.length).toBeGreaterThan(0);
    expect(typeof pitch.pitchBody).toBe("string");
  });
});
