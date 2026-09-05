import { describe, it, expect } from "vitest";
import { RoadmapService } from "@/services/roadmap.service";

describe("RoadmapService (Actionable Growth Engine & 3-Way Verification)", () => {
  it("seeds a rich, prioritized SEO sprint when project roadmap is empty", async () => {
    const tasks = await RoadmapService.seedInitialRoadmap(
      "test-proj-777",
      "example-saas.com",
    );
    expect(tasks).toBeDefined();
    expect(tasks.length).toBeGreaterThanOrEqual(7);

    // Verify categories
    const categories = tasks.map((t) => t.category);
    expect(categories).toContain("quick_win");
    expect(categories).toContain("high_impact");
    expect(categories).toContain("technical");
    expect(categories).toContain("content_gap");
    expect(categories).toContain("growth");

    // Verify properties
    tasks.forEach((task) => {
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.description).toBeDefined();
      expect(task.estimatedMinutes).toBeGreaterThan(0);
      expect(["todo", "in_progress", "completed", "dismissed"]).toContain(
        task.status,
      );
    });
  });

  it("calculates accurate roadmap metrics and health score boost", async () => {
    const metrics = await RoadmapService.getRoadmapMetrics(
      "test-proj-777",
      "example-saas.com",
    );
    expect(metrics).toBeDefined();
    expect(metrics.totalTasks).toBeGreaterThan(0);
    expect(typeof metrics.completionRate).toBe("number");
    expect(typeof metrics.estimatedMinutesSaved).toBe("number");
    expect(typeof metrics.healthScoreBoost).toBe("number");
    expect(metrics.byCategory).toBeDefined();
    expect(metrics.byCategory.quick_win).toBeDefined();
  });

  it("creates custom growth roadmap tasks", async () => {
    const custom = await RoadmapService.createCustomTask("test-proj-777", {
      title: "Set up GSC automated monthly audit email digest",
      description:
        "Notify growth team on first of the month with ranking shifts.",
      category: "growth",
      priority: "high",
      estimatedMinutes: 10,
    });

    expect(custom).toBeDefined();
    expect(custom.title).toBe(
      "Set up GSC automated monthly audit email digest",
    );
    expect(custom.category).toBe("growth");
    expect(custom.status).toBe("todo");
    expect(custom.verificationType).toBe("manual");
  });
});
