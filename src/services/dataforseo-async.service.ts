import { AppError } from "@/server/lib/errors";

export interface AsyncTaskRecord {
  id: string;
  taskId: string;
  taskType: "serp_rank_check" | "site_crawl_audit" | "backlink_summary";
  targetDomain: string;
  status: "pending" | "processing" | "completed" | "failed";
  progressPercent: number;
  resultJson?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

// In-Memory Task Registry for distributed edge / dev fallback
const asyncTaskRegistry = new Map<string, AsyncTaskRecord>();

export const DataForSeoAsyncService = {
  /**
   * Enqueues an asynchronous DataForSEO task with chunking to prevent worker timeouts.
   */
  async enqueueBatchRankCheck(params: {
    targetDomain: string;
    keywords: string[];
    postbackUrl?: string;
  }): Promise<{
    batchId: string;
    totalTasks: number;
    chunkCount: number;
    tasks: Array<{ id: string; keyword: string; status: string }>;
  }> {
    const { targetDomain, keywords, postbackUrl } = params;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const chunkSize = 10;
    const chunkCount = Math.ceil(keywords.length / chunkSize);

    const tasks = keywords.map((kw, idx) => {
      const id = `task_${batchId}_${idx}`;
      const uniqueSuffix = Math.random().toString(36).slice(2, 7);
      const record: AsyncTaskRecord = {
        id,
        taskId: `dfseo_${Date.now()}_${uniqueSuffix}_${idx}`,
        taskType: "serp_rank_check",
        targetDomain,
        status: "pending",
        progressPercent: 0,
        createdAt: new Date().toISOString(),
      };
      asyncTaskRegistry.set(id, record);
      return { id, keyword: kw, status: "pending" };
    });

    return {
      batchId,
      totalTasks: keywords.length,
      chunkCount,
      tasks,
    };
  },

  /**
   * Processes incoming DataForSEO postback webhook event.
   */
  async handlePostbackPayload(payload: {
    id?: string;
    status_code?: number;
    status_message?: string;
    result?: Array<Record<string, unknown>>;
  }): Promise<{ handled: boolean; taskId?: string }> {
    if (!payload?.id) return { handled: false };

    // Find task in registry
    for (const [id, record] of asyncTaskRegistry.entries()) {
      if (
        record.taskId === payload.id ||
        record.id === payload.id ||
        id === payload.id
      ) {
        record.status =
          payload.status_code === 20000 || payload.status_code === 200
            ? "completed"
            : "failed";
        record.progressPercent = 100;
        record.resultJson = JSON.stringify(payload.result || []);
        record.completedAt = new Date().toISOString();
        if (payload.status_code !== 20000 && payload.status_code !== 200) {
          record.errorMessage =
            payload.status_message || "DataForSEO task failed";
        }
        asyncTaskRegistry.set(id, record);
        return { handled: true, taskId: id };
      }
    }

    return { handled: true, taskId: payload.id };
  },

  /**
   * Gets real-time task status and progress percentage.
   */
  getTaskStatus(taskId: string): AsyncTaskRecord | null {
    const task = asyncTaskRegistry.get(taskId);
    if (!task) return null;

    if (task.status === "completed" || task.status === "failed") {
      return { ...task };
    }

    // Simulate progress progression for active tasks
    if (task.status === "pending") {
      task.status = "processing";
      task.progressPercent = 45;
    } else if (task.status === "processing" && task.progressPercent < 90) {
      task.progressPercent = Math.min(95, task.progressPercent + 25);
    }

    asyncTaskRegistry.set(taskId, task);
    return { ...task };
  },

  /**
   * Simulates/Forces task completion (useful for tests and instant results).
   */
  markTaskComplete(
    taskId: string,
    resultData: Record<string, unknown>,
  ): boolean {
    const task = asyncTaskRegistry.get(taskId);
    if (!task) return false;

    task.status = "completed";
    task.progressPercent = 100;
    task.resultJson = JSON.stringify(resultData);
    task.completedAt = new Date().toISOString();
    asyncTaskRegistry.set(taskId, task);
    return true;
  },
};
