import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { RoadmapService } from "@/services/roadmap.service";

const roadmapQuerySchema = z
  .object({
    projectId: z.string().optional(),
  })
  .optional();

const updateTaskStatusSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().min(1),
  status: z.enum(["todo", "in_progress", "completed", "dismissed"]),
  verificationType: z
    .enum(["manual", "ai_generated", "live_crawled"])
    .optional(),
});

const generateAiFixSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().min(1),
});

const createCustomTaskSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  category: z.enum([
    "quick_win",
    "high_impact",
    "technical",
    "content_gap",
    "growth",
  ]),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  targetUrl: z.string().url().optional().or(z.literal("")),
  aiPrompt: z.string().optional(),
});

/**
 * Fetch all tasks and metrics for a project's Action Roadmap.
 */
export const getProjectRoadmap = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(roadmapQuerySchema)
  .handler(async ({ context }) => {
    const tasks = await RoadmapService.getRoadmapTasks(
      context.projectId,
      context.project.domain || undefined,
    );
    const metrics = await RoadmapService.getRoadmapMetrics(
      context.projectId,
      context.project.domain || undefined,
    );

    return {
      tasks,
      metrics,
    };
  });

/**
 * Update a task's status with 3-way verification logging.
 */
export const updateRoadmapTask = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(updateTaskStatusSchema)
  .handler(async ({ data, context }) => {
    return RoadmapService.updateTaskStatus(
      data.taskId,
      data.status,
      context.userId,
      data.verificationType || "manual",
    );
  });

/**
 * 1-Click AI Fix: Generates Schema JSON-LD, meta tags, or redirect directives.
 */
export const generateRoadmapAiFix = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(generateAiFixSchema)
  .handler(async ({ data, context }) => {
    return RoadmapService.generateAiFix(data.taskId, context.userId);
  });

/**
 * Creates a custom task in the Action Roadmap.
 */
export const createRoadmapTask = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(createCustomTaskSchema)
  .handler(async ({ data, context }) => {
    return RoadmapService.createCustomTask(context.projectId, {
      ...data,
      targetUrl: data.targetUrl || undefined,
    });
  });

/**
 * Autonomous Live Crawl Sync: checks recent audit fixes and auto-verifies roadmap tasks.
 */
export const syncRoadmapLiveCrawl = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(roadmapQuerySchema)
  .handler(async ({ context }) => {
    return RoadmapService.syncAuditIssuesToRoadmap(context.projectId);
  });
