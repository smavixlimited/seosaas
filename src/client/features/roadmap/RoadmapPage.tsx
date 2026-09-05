import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getProjectRoadmap,
  updateRoadmapTask,
  generateRoadmapAiFix,
  createRoadmapTask,
  syncRoadmapLiveCrawl,
} from "@/serverFunctions/roadmap";
import type {
  RoadmapTaskItem,
  RoadmapCategory,
  RoadmapStatus,
} from "@/services/roadmap.service";

interface RoadmapPageProps {
  projectId: string;
}

export function RoadmapPage({ projectId }: RoadmapPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<"all" | RoadmapCategory>(
    "all",
  );
  const [statusFilter, setStatusFilter] = React.useState<
    "active" | "completed"
  >("active");
  const [selectedSnippet, setSelectedSnippet] = React.useState<{
    title: string;
    snippet: string;
  } | null>(null);

  const roadmapQuery = useQuery({
    queryKey: ["projectRoadmap", projectId],
    queryFn: () => getProjectRoadmap({}),
    staleTime: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { taskId: string; status: RoadmapStatus }) =>
      updateRoadmapTask({
        data: {
          taskId: vars.taskId,
          status: vars.status,
          verificationType: "manual",
        },
      }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      if (updated?.status === "completed") {
        toast.success("Task completed & verified!");
      } else {
        toast.info("Task moved back to active sprint");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update task status");
    },
  });

  const aiFixMutation = useMutation({
    mutationFn: (vars: { taskId: string }) =>
      generateRoadmapAiFix({
        data: { taskId: vars.taskId },
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      setSelectedSnippet({ title: res.task.title, snippet: res.codeSnippet });
      toast.success("AI Fix generated & task auto-verified!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate AI fix");
    },
  });

  const syncCrawlMutation = useMutation({
    mutationFn: () => syncRoadmapLiveCrawl({}),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      if (res.newlyVerifiedCount > 0) {
        toast.success(
          `Live crawl verified ${res.newlyVerifiedCount} fixed issues!`,
        );
      } else {
        toast.info(
          "Live crawl sync complete. All active tasks remain in queue.",
        );
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to sync with live crawl");
    },
  });

  const handleLaunchSam = (task: RoadmapTaskItem) => {
    if (typeof window !== "undefined" && task.aiPrompt) {
      sessionStorage.setItem("sam_pending_prompt", task.aiPrompt);
    }
    toast.success("Opening SAM AI with task context...");
    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: { s: undefined },
    });
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Code snippet copied to clipboard!");
  };

  const data = roadmapQuery.data;
  const tasks = data?.tasks || [];
  const metrics = data?.metrics;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = activeTab === "all" || t.category === activeTab;
    const matchesStatus =
      statusFilter === "active"
        ? t.status !== "completed"
        : t.status === "completed";
    return matchesCategory && matchesStatus;
  });

  const quickWinsCount = tasks.filter(
    (t) => t.category === "quick_win" && t.status !== "completed",
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            SEO &amp; Growth Roadmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Your automated path to higher rankings and traffic. Prioritize
            high-impact search fixes discovered from your audits, generate
            instant 1-click solutions with Skorvia AI, and track verified SEO
            growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => syncCrawlMutation.mutate()}
            disabled={syncCrawlMutation.isPending}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Icon
              icon="solar:refresh-circle-bold"
              className={`h-4 w-4 text-primary ${syncCrawlMutation.isPending ? "animate-spin" : ""}`}
            />
            <span>
              {syncCrawlMutation.isPending
                ? "Checking Crawl..."
                : "Sync Live Crawl"}
            </span>
          </button>
        </div>
      </div>

      {/* Sprint Health Scorecard */}
      {metrics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">
              Sprint Completion
            </span>
            <div className="flex items-baseline justify-between">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
                {metrics.completionRate}%
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {metrics.completedTasks} / {metrics.totalTasks} Tasks
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">
              Est. Time Saved
            </span>
            <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.estimatedMinutesSaved} mins
            </h4>
            <span className="text-[11px] text-slate-400">
              Via AI &amp; automated fixes
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">
              SEO Health Score Boost
            </span>
            <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              +{metrics.healthScoreBoost} pts
            </h4>
            <span className="text-[11px] text-slate-400">
              Projected crawl recovery
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">
              Open Quick Wins (&lt; 5m)
            </span>
            <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
              {quickWinsCount} items
            </h4>
            <span className="text-[11px] text-slate-400">
              Immediate top-tier gains
            </span>
          </div>
        </div>
      ) : null}

      {/* Smart Priority Filter Tabs & Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quick_win")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "quick_win"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Quick Wins (&lt; 5m)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("high_impact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "high_impact"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            High Impact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("technical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "technical"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Technical Health
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content_gap")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "content_gap"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Content &amp; Gaps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("growth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "growth"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Growth Plays
          </button>
        </div>

        {/* Active vs Completed Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === "active"
                ? "bg-white dark:bg-slate-700 text-primary shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Active Tasks
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === "completed"
                ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Completed &amp; Verified ({metrics?.completedTasks || 0})
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      {roadmapQuery.isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Icon
              icon="solar:checklist-minimalistic-bold-duotone"
              className="h-5 w-5 animate-spin"
            />
          </div>
          <p className="text-xs text-slate-500">
            Loading action roadmap sprint...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
            <Icon
              icon="solar:shield-check-bold-duotone"
              className="h-6 w-6 text-emerald-500"
            />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {statusFilter === "active"
              ? "No Active Tasks in this Category"
              : "No Completed Tasks Yet"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter === "active"
              ? "All prioritized items in this category are completed. Add a custom task or check another category."
              : "Complete tasks using the checkboxes, 1-Click AI fixes, or live crawl sync to build your verified record."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all duration-150 ${
                  isCompleted
                    ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-80"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox Trigger */}
                  <button
                    type="button"
                    onClick={() =>
                      updateMutation.mutate({
                        taskId: task.id,
                        status: isCompleted ? "todo" : "completed",
                      })
                    }
                    className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary"
                    }`}
                  >
                    {isCompleted ? (
                      <Icon
                        icon="solar:check-read-bold"
                        className="h-3.5 w-3.5"
                      />
                    ) : null}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.category === "quick_win"
                            ? "bg-amber-500/10 text-amber-600"
                            : task.category === "high_impact"
                              ? "bg-rose-500/10 text-rose-600"
                              : task.category === "technical"
                                ? "bg-blue-500/10 text-blue-600"
                                : task.category === "content_gap"
                                  ? "bg-purple-500/10 text-purple-600"
                                  : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {task.impactBadge}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Est. {task.estimatedMinutes}m
                      </span>

                      {/* 3-Way Verification Status Badge */}
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1 font-mono">
                          <Icon
                            icon={
                              task.verificationType === "ai_generated"
                                ? "solar:bolt-bold-duotone"
                                : task.verificationType === "live_crawled"
                                  ? "solar:refresh-circle-bold"
                                  : "solar:check-circle-bold"
                            }
                            className="h-3 w-3"
                          />
                          <span>
                            {task.verificationType === "ai_generated"
                              ? "AI Fix Verified"
                              : task.verificationType === "live_crawled"
                                ? "Live Crawl Verified"
                                : "Manual Verified"}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {task.targetUrl ? (
                      <a
                        href={task.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
                      >
                        <span>{task.targetUrl}</span>
                        <Icon
                          icon="solar:arrow-right-up-bold"
                          className="h-3 w-3"
                        />
                      </a>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {task.aiFixCodeSnippet ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSnippet({
                              title: task.title,
                              snippet: task.aiFixCodeSnippet!,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Icon
                            icon="solar:code-bold-duotone"
                            className="h-3.5 w-3.5"
                          />
                          <span>View Code Snippet</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            aiFixMutation.mutate({ taskId: task.id })
                          }
                          disabled={aiFixMutation.isPending}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Icon
                            icon="solar:bolt-bold-duotone"
                            className="h-3.5 w-3.5 text-primary"
                          />
                          <span>Generate 1-Click Fix</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleLaunchSam(task)}
                        className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Icon
                          icon="solar:chat-round-line-bold"
                          className="h-3.5 w-3.5"
                        />
                        <span>Fix with SAM AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Code Snippet Modal */}
      {selectedSnippet ? (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  1-Click AI Solution Snippet
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedSnippet.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnippet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
                <code>{selectedSnippet.snippet}</code>
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(selectedSnippet.snippet)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs"
              >
                <Icon icon="solar:copy-bold" className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSnippet(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(selectedSnippet.snippet);
                  setSelectedSnippet(null);
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1"
              >
                <Icon icon="solar:check-circle-bold" className="h-4 w-4" />
                <span>Copy &amp; Done</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
