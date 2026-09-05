import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  getConversionReadiness,
  runConversionReadinessAudit,
} from "@/serverFunctions/conversion-readiness";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import type {
  RecommendedFixItem,
  ConversionAuditResult,
} from "@/services/conversion-ad-readiness.service";

interface ConversionReadinessPageProps {
  projectId: string;
}

export function ConversionReadinessPage({
  projectId,
}: ConversionReadinessPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [targetUrl, setTargetUrl] = React.useState("");

  const auditQuery = useQuery<ConversionAuditResult>({
    queryKey: ["conversionReadiness", projectId],
    queryFn: () => getConversionReadiness({ data: {} }),
    staleTime: 5 * 60 * 1000,
  });

  const audit = auditQuery.data;

  const addRoadmapTaskMutation = useMutation({
    mutationFn: (fix: RecommendedFixItem) =>
      createRoadmapTask({
        data: {
          title: fix.title,
          description: fix.action,
          category:
            fix.priority === "HIGH"
              ? "high_impact"
              : fix.priority === "QUICK_WIN"
                ? "quick_win"
                : "growth",
          priority: fix.priority === "HIGH" ? "critical" : "high",
          aiPrompt: fix.suggestedPromptForSam,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added fix to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add fix to roadmap");
    },
  });

  const exportAllToRoadmapMutation = useMutation({
    mutationFn: async (fixes: RecommendedFixItem[]) => {
      for (const fix of fixes) {
        await createRoadmapTask({
          data: {
            title: fix.title,
            description: fix.action,
            category:
              fix.priority === "HIGH"
                ? "high_impact"
                : fix.priority === "QUICK_WIN"
                  ? "quick_win"
                  : "growth",
            priority: fix.priority === "HIGH" ? "critical" : "high",
            aiPrompt: fix.suggestedPromptForSam,
          },
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Exported all optimization fixes to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to export fixes to roadmap");
    },
  });

  const runAuditMutation = useMutation({
    mutationFn: () =>
      runConversionReadinessAudit({
        data: {
          targetUrl: targetUrl
            ? targetUrl.startsWith("http")
              ? targetUrl
              : `https://${targetUrl}`
            : audit?.targetUrl || "https://example.com",
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["conversionReadiness", projectId], data);
      toast.success("Conversion & Ad Readiness Audit completed!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to run conversion audit");
    },
  });

  const handleLaunchSamForFix = (fix: RecommendedFixItem) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sam_pending_prompt", fix.suggestedPromptForSam);
    }
    toast.success("Opening Skorvia AI with conversion optimization prompt...");
    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: { s: undefined },
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500";
    if (score >= 60) return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-xs uppercase tracking-wider">
              Ad Spend Protection &amp; CRO
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              Conversion Scorecard
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content mt-1">
            Conversion &amp; Ad Readiness Audit (0–100)
          </h1>
          <p className="text-xs text-base-content/60">
            Diagnose landing page conversion leaks, audit trust signals, and
            optimize for paid ad ROI before spending budget.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAuditMutation.mutate();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={audit?.targetUrl || "https://yourwebsite.com"}
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="input input-bordered input-sm rounded-xl text-xs w-56 font-mono"
            />
            <button
              type="submit"
              disabled={runAuditMutation.isPending}
              className="btn btn-sm btn-primary rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
            >
              <Icon
                icon="solar:refresh-circle-bold"
                className={`h-4 w-4 ${runAuditMutation.isPending ? "animate-spin" : ""}`}
              />
              <span>
                {runAuditMutation.isPending ? "Auditing Page..." : "Run Audit"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {audit && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div
                className={`h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center font-mono ${getScoreColor(audit.overallScore)}`}
              >
                <span className="text-3xl font-black">
                  {audit.overallScore}
                </span>
                <span className="text-[10px] font-bold uppercase text-base-content/60">
                  Score
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-lg font-black text-sm bg-base-200">
                    Grade: {audit.grade}
                  </span>
                  <span
                    className={`badge badge-sm font-bold text-[10px] ${
                      audit.adWastedSpendRisk === "low"
                        ? "badge-success text-white"
                        : audit.adWastedSpendRisk === "moderate"
                          ? "badge-warning"
                          : "badge-error text-white"
                    }`}
                  >
                    {audit.adWastedSpendRisk.toUpperCase()} AD LEAKAGE RISK
                  </span>
                </div>
                <h3 className="text-base font-bold text-base-content">
                  Audited Target:{" "}
                  <span className="font-mono text-primary">
                    {audit.targetUrl}
                  </span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Last scanned: {new Date(audit.auditedAt).toLocaleDateString()}{" "}
                  at {new Date(audit.auditedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    "sam_pending_prompt",
                    `Act as a Top 1% Conversion Rate Optimization (CRO) and Paid Traffic Expert. Audit my landing page (${audit.targetUrl}) which scored ${audit.overallScore}/100. Critical issues: ${audit.criticalFrictionPoints.map((f) => f.title).join("; ")}. Provide immediate copy rewrites, trust badges placement, and CTA adjustments.`,
                  );
                }
                void navigate({
                  to: "/p/$projectId/sam",
                  params: { projectId },
                  search: { s: undefined },
                });
              }}
              className="btn btn-outline btn-primary rounded-2xl px-6 font-bold gap-2 shrink-0"
            >
              <Icon icon="solar:stars-bold" className="h-4 w-4" />
              <span>Fix with Skorvia AI</span>
            </button>
          </div>

          {/* 6 Core Sub-Pillar Breakdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Ad Pixels & Tracking",
                score: audit.trackingPixelScore ?? 85,
                icon: "solar:radar-bold",
                highlight: true,
              },
              {
                label: "Trust & Credibility",
                score: audit.trustAndCredibilityScore,
                icon: "solar:shield-check-bold",
              },
              {
                label: "CTA & Offer Clarity",
                score: audit.ctaAndOfferClarityScore,
                icon: "solar:target-bold",
              },
              {
                label: "Mobile Speed & Vitals",
                score: audit.pageSpeedAndMobileScore,
                icon: "solar:smartphone-bold",
              },
              {
                label: "Social Proof & Reviews",
                score: audit.socialProofAndReviewsScore,
                icon: "solar:star-bold",
              },
              {
                label: "Checkout Friction",
                score: audit.frictionAndFormLengthScore,
                icon: "solar:card-bold",
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className={`rounded-3xl border p-4 shadow-sm space-y-2 ${
                  pillar.highlight
                    ? "border-primary/40 bg-primary/5"
                    : "border-base-300 bg-base-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-base-content/70 line-clamp-1">
                    {pillar.label}
                  </span>
                  <Icon
                    icon={pillar.icon}
                    className={`h-4 w-4 shrink-0 ${pillar.highlight ? "text-primary" : "text-base-content/40"}`}
                  />
                </div>
                <div className="text-xl font-black font-mono text-base-content">
                  {pillar.score}/100
                </div>
                <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(pillar.score)} rounded-full`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Ad Tracking & Pixel Health Diagnostic Card */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:radar-bold"
                    className="h-5 w-5 text-primary"
                  />
                  <h3 className="text-base font-black text-base-content">
                    Ad Tracking &amp; Conversion Pixel Health
                  </h3>
                  <span className="badge badge-sm badge-outline text-[10px] font-bold text-primary">
                    Ad Spend Security
                  </span>
                </div>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Detects whether ad network pixels (Meta, Google Ads, TikTok,
                  GTM) are firing to prevent wasted ad budget.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {audit.hasAdPixelInstalled ? (
                  <span className="badge badge-success text-white font-bold text-xs gap-1 py-3 px-3">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="h-3.5 w-3.5"
                    />
                    <span>Ad Pixels Active</span>
                  </span>
                ) : (
                  <span className="badge badge-error text-white font-bold text-xs gap-1 py-3 px-3 animate-pulse">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="h-3.5 w-3.5"
                    />
                    <span>No Ad Pixel Detected (High Risk)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pixel Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {audit.detectedPixels?.map((pixel) => {
                const isActive = pixel.status === "active";
                return (
                  <div
                    key={pixel.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isActive
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-base-200/40 border-base-300 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-base-content flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-base-content/30"}`}
                        />
                        <span>{pixel.name}</span>
                      </span>
                      <span
                        className={`badge badge-xs font-bold font-mono ${
                          isActive ? "badge-success text-white" : "badge-ghost"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "MISSING"}
                      </span>
                    </div>

                    <p className="text-[11px] text-base-content/70 leading-snug">
                      {pixel.details}
                    </p>

                    {pixel.pixelId && (
                      <div className="text-[10px] text-base-content/50 font-mono flex items-center gap-1">
                        <span>ID:</span>
                        <span className="font-bold text-base-content">
                          {pixel.pixelId}
                        </span>
                      </div>
                    )}

                    {pixel.eventsDetected &&
                      pixel.eventsDetected.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-base-200">
                          <span className="text-[9px] text-base-content/50 font-bold uppercase">
                            Events:
                          </span>
                          {pixel.eventsDetected.map((ev, eIdx) => (
                            <span
                              key={eIdx}
                              className="badge badge-xs badge-neutral text-[9px] font-mono"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Friction Points & 1-Click Fixes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-base-content flex items-center gap-2">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="h-5 w-5 text-rose-500"
                />
                <span>Identified Conversion Leaks</span>
              </h3>
              <div className="space-y-2">
                {audit.criticalFrictionPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 font-medium"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{point.title}</span>
                      <span className="badge badge-xs badge-error text-white font-mono">
                        {point.severity.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-base-content/70">{point.issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-base-content flex items-center gap-2">
                <Icon
                  icon="solar:check-circle-bold"
                  className="h-5 w-5 text-emerald-500"
                />
                <span>Passing Trust &amp; Conversion Signals</span>
              </h3>
              <div className="space-y-2">
                {audit.checksPassed.map((check, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4 text-emerald-500 shrink-0"
                      />
                      <span>{check.label}</span>
                    </div>
                    <span className="text-base-content/70 pl-6">
                      {check.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Fixes with 1-Click Roadmap Export & SAM Action */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-3">
              <div>
                <h3 className="text-base font-black text-base-content flex items-center gap-2">
                  <Icon
                    icon="solar:bolt-bold"
                    className="h-5 w-5 text-amber-500"
                  />
                  <span>Recommended Optimization Actions</span>
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Actionable CRO tasks prioritized by estimated conversion lift.
                </p>
              </div>

              {audit.recommendedFixes && audit.recommendedFixes.length > 0 && (
                <button
                  type="button"
                  disabled={exportAllToRoadmapMutation.isPending}
                  onClick={() =>
                    exportAllToRoadmapMutation.mutate(audit.recommendedFixes)
                  }
                  className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white shadow-md shadow-primary/20 gap-1.5"
                >
                  <Icon icon="solar:rocket-bold" className="h-4 w-4" />
                  <span>
                    {exportAllToRoadmapMutation.isPending
                      ? "Exporting to Roadmap..."
                      : "Export All to Action Roadmap"}
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {audit.recommendedFixes.map((fix, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-base-200/40 border border-base-300 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`badge badge-xs font-bold ${
                          fix.priority === "HIGH"
                            ? "badge-error text-white"
                            : fix.priority === "MEDIUM"
                              ? "badge-warning"
                              : "badge-success text-white"
                        }`}
                      >
                        {fix.priority} PRIORITY
                      </span>
                      <span className="text-[10px] text-base-content/50 font-mono">
                        {fix.estimatedConversionLift} Lift
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-base-content">
                      {fix.title}
                    </h4>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {fix.action}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-base-300/60">
                    <button
                      type="button"
                      onClick={() => addRoadmapTaskMutation.mutate(fix)}
                      className="btn btn-xs btn-outline rounded-xl font-bold text-[11px] gap-1 hover:bg-primary hover:text-white"
                    >
                      <Icon icon="solar:rocket-bold" className="h-3 w-3" />
                      <span>Roadmap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchSamForFix(fix)}
                      className="btn btn-xs btn-primary rounded-xl font-bold text-[11px] text-white shadow-xs gap-1"
                    >
                      <Icon icon="solar:stars-bold" className="h-3 w-3" />
                      <span>AI Fix</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
