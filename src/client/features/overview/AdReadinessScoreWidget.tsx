import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getConversionReadiness,
  runConversionReadinessAudit,
} from "@/serverFunctions/conversion-readiness";
import { createSamSession } from "@/serverFunctions/sam";
import { invalidateSamSessions } from "@/client/features/sam/samQueries";
import type {
  ConversionAuditResult,
  RecommendedFixItem,
} from "@/services/conversion-ad-readiness.service";

interface AdReadinessScoreWidgetProps {
  projectId: string;
  targetDomain?: string;
}

export function AdReadinessScoreWidget({
  projectId,
  targetDomain,
}: AdReadinessScoreWidgetProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLaunchingAi, setIsLaunchingAi] = React.useState(false);

  const cleanDomain = (targetDomain || "yourdomain.com")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  const targetUrl = `https://${cleanDomain}`;

  const auditQuery = useQuery({
    queryKey: ["conversionReadiness", projectId, cleanDomain],
    queryFn: () =>
      getConversionReadiness({
        data: { projectId, targetUrl },
      }),
  });

  const runAuditMutation = useMutation({
    mutationFn: () =>
      runConversionReadinessAudit({
        data: { projectId, targetUrl },
      }),
    onSuccess: (freshData) => {
      queryClient.setQueryData(
        ["conversionReadiness", projectId, cleanDomain],
        freshData,
      );
      toast.success("Conversion & Ad Readiness Audit completed!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to run conversion audit");
    },
  });

  const handleLaunchSamForFix = async (fix: RecommendedFixItem) => {
    setIsLaunchingAi(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sam_pending_prompt", fix.suggestedPromptForSam);
    }
    toast.success("Starting new chat with Skorvia AI...");
    try {
      const { id: newSessionId } = await createSamSession({
        data: { projectId },
      });
      invalidateSamSessions(projectId);
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: { s: newSessionId },
      });
    } catch (err) {
      console.warn("Error creating chat session:", err);
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: { s: undefined },
      });
    } finally {
      setIsLaunchingAi(false);
    }
  };

  const report = auditQuery.data as ConversionAuditResult | undefined;
  const isLoading = auditQuery.isLoading || runAuditMutation.isPending;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Icon
              icon="solar:chart-2-bold-duotone"
              className="h-5 w-5 animate-spin"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Evaluating Conversion &amp; Ad Readiness...
            </h4>
            <p className="text-[11px] text-slate-400">
              Scanning credibility signals, CTA placement, and ROAS friction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const {
    overallScore,
    grade,
    adWastedSpendRisk,
    trustAndCredibilityScore,
    ctaAndOfferClarityScore,
    pageSpeedAndMobileScore,
    socialProofAndReviewsScore,
    frictionAndFormLengthScore,
    checksPassed,
    criticalFrictionPoints,
    recommendedFixes,
  } = report;

  return (
    <>
      {/* Dashboard KPI Banner Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {/* Radial Score Circle */}
          <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono leading-none">
              {overallScore}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              Grade {grade}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Conversion &amp; Ad Readiness Scorecard
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  adWastedSpendRisk === "low"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : adWastedSpendRisk === "moderate"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-600"
                }`}
              >
                {adWastedSpendRisk === "low"
                  ? "Low Risk: Ready to Scale"
                  : `${adWastedSpendRisk} Spend Risk`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates landing page credibility, trust signals, CTA scent, and
              purchase friction to prevent wasted ad budget.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Icon
              icon="solar:eye-bold-duotone"
              className="h-4 w-4 text-primary"
            />
            <span>View Full Teardown</span>
          </button>

          <button
            type="button"
            onClick={() => runAuditMutation.mutate()}
            disabled={runAuditMutation.isPending}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Icon
              icon="solar:refresh-circle-bold"
              className={`h-4 w-4 ${runAuditMutation.isPending ? "animate-spin" : ""}`}
            />
            <span>
              {runAuditMutation.isPending ? "Auditing..." : "Re-Scan"}
            </span>
          </button>
        </div>
      </div>

      {/* Full Breakdown Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary text-white shadow-sm">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Conversion &amp; Ad Readiness Audit Teardown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target:{" "}
                    <span className="font-mono">{report.targetUrl}</span>{" "}
                    (Score: {overallScore}/100, Grade {grade})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* 5 Sub-Score Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Trust &amp; Security
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono block">
                  {trustAndCredibilityScore}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${trustAndCredibilityScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  CTA &amp; Offer Clarity
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono block">
                  {ctaAndOfferClarityScore}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${ctaAndOfferClarityScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Page Speed &amp; Mobile
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono block">
                  {pageSpeedAndMobileScore}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${pageSpeedAndMobileScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Social Proof Signals
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono block">
                  {socialProofAndReviewsScore}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${socialProofAndReviewsScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Form &amp; Checkout Flow
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono block">
                  {frictionAndFormLengthScore}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${frictionAndFormLengthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Critical Friction Warnings */}
            <div className="rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="h-5 w-5 text-rose-600"
                />
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                  Identified Conversion &amp; Ad Budget Leakage Points (
                  {criticalFrictionPoints.length})
                </h4>
              </div>

              <div className="space-y-2">
                {criticalFrictionPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {pt.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 font-mono">
                        {pt.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pt.issue}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Fixes with 1-Click SAM AI Execution */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:bolt-bold-duotone"
                  className="h-5 w-5 text-primary"
                />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Prioritized Conversion Lift Plays (1-Click SAM AI Execution)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedFixes.map((fix) => (
                  <div
                    key={fix.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3 text-xs shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            fix.priority === "HIGH"
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {fix.priority}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {fix.estimatedConversionLift}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug">
                        {fix.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {fix.action}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLaunchingAi}
                      onClick={() => {
                        setIsModalOpen(false);
                        handleLaunchSamForFix(fix);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <Icon
                        icon="solar:bolt-circle-bold"
                        className="h-3.5 w-3.5"
                      />
                      <span>Fix with Skorvia AI</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Passed Checks */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verified Credibility Checks Passed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checksPassed.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <Icon
                      icon="solar:check-circle-bold-duotone"
                      className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {chk.label}:
                      </strong>{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        {chk.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close Teardown
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
