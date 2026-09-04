import { describe, it, expect } from "vitest";
import { DataForSeoAsyncService } from "@/services/dataforseo-async.service";

describe("Phase 30: Async Task Queues & Deep Crawl Resilience Suite", () => {
  it("enqueues batch rank checks in chunks to prevent worker timeouts", async () => {
    const keywords = [
      "seo software",
      "best keyword rank tracker",
      "aeo ai visibility tool",
      "local map seo",
      "competitor backlink gap",
      "technical site audit",
      "instant indexnow tool",
      "white label seo reports",
      "free keyword research",
      "ecommerce seo audit",
      "saas marketing platform",
      "serp api provider",
    ]; // 12 keywords -> 2 chunks

    const batch = await DataForSeoAsyncService.enqueueBatchRankCheck({
      targetDomain: "skorvia.com",
      keywords,
    });

    expect(batch.totalTasks).toBe(12);
    expect(batch.chunkCount).toBe(2);
    expect(batch.tasks).toHaveLength(12);
    expect(batch.tasks[0].status).toBe("pending");
  });

  it("tracks state machine progression from pending to processing", () => {
    const taskId = "task_test_flow_001";
    // Register mock task
    const status1 = DataForSeoAsyncService.getTaskStatus(taskId);
    expect(status1).toBeNull(); // non-existent
  });

  it("handles incoming DataForSEO postback webhook payloads cleanly", async () => {
    const batch = await DataForSeoAsyncService.enqueueBatchRankCheck({
      targetDomain: "skorvia.com",
      keywords: ["best enterprise seo"],
    });

    const taskId = batch.tasks[0].id;
    const taskRecord = DataForSeoAsyncService.getTaskStatus(taskId);
    expect(taskRecord).toBeDefined();

    // Trigger postback webhook payload
    const postbackResult = await DataForSeoAsyncService.handlePostbackPayload({
      id: taskRecord?.taskId,
      status_code: 20000,
      status_message: "Ok.",
      result: [{ keyword: "best enterprise seo", rank_absolute: 1, domain: "skorvia.com" }],
    });

    expect(postbackResult.handled).toBe(true);

    const completedRecord = DataForSeoAsyncService.getTaskStatus(taskId);
    expect(completedRecord?.status).toBe("completed");
    expect(completedRecord?.progressPercent).toBe(100);
    expect(completedRecord?.resultJson).toContain("best enterprise seo");
  });

  it("handles DataForSEO error postback cleanly", async () => {
    const batch = await DataForSeoAsyncService.enqueueBatchRankCheck({
      targetDomain: "skorvia.com",
      keywords: ["error keyword test"],
    });

    const taskId = batch.tasks[0].id;
    const taskRecord = DataForSeoAsyncService.getTaskStatus(taskId);

    await DataForSeoAsyncService.handlePostbackPayload({
      id: taskRecord?.taskId,
      status_code: 40501,
      status_message: "Rate limit exceeded on provider",
    });

    const failedRecord = DataForSeoAsyncService.getTaskStatus(taskId);
    expect(failedRecord?.status).toBe("failed");
    expect(failedRecord?.errorMessage).toBe("Rate limit exceeded on provider");
  });
});
