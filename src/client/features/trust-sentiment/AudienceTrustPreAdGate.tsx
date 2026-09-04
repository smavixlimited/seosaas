import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getAudienceTrustAudit,
  runAudienceTrustAudit,
} from "@/serverFunctions/audience-trust";
import { createRoadmapTask } from "@/serverFunctions/roadmap";

interface AudienceTrustPreAdGateProps {
  projectId: string;
}

export function AudienceTrustPreAdGate({ projectId }: AudienceTrustPreAdGateProps) {
  const queryClient = useQueryClient();

  const auditQuery = useQuery({
    queryKey: ["audienceTrustAudit", projectId],
    queryFn: () => getAudienceTrustAudit({ data: {} }),
  });

  const runAuditMutation = useMutation({
    mutationFn: () => runAudienceTrustAudit({ data: {} }),
    onSuccess: (data) => {
      queryClient.setQueryData(["audienceTrustAudit", projectId], data);
      toast.success("Fresh Audience Trust & Pre-Ad Gate verification completed!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to run trust verification");
    },
  });

  const addRoadmapTaskMutation = useMutation({
    mutationFn: (task: { title: string; description: string }) =>
      createRoadmapTask({
        data: {
          title: task.title,
          description: task.description,
          category: "high_impact",
          priority: "high",
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projectRoadmap", projectId] });
      toast.success("Added pre-ad trust task to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add task to roadmap");
    },
  });

  const audit = auditQuery.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Notice */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-base-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Icon icon="solar:shield-check-bold" className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-base-content">
                Pre-Ad Verification Gate
              </h2>
              <span className="badge badge-primary badge-xs font-bold uppercase tracking-wider">
                Ad-Spend Security
              </span>
            </div>
            <p className="text-xs text-base-content/70 mt-0.5">
              Verify customer sentiment, testimonial proof, and trust signals before launching paid Meta, Google, or TikTok campaigns.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={runAuditMutation.isPending || auditQuery.isFetching}
          onClick={() => runAuditMutation.mutate()}
          className="btn btn-primary rounded-2xl h-11 px-6 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <Icon
            icon="solar:radar-bold"
            className={`h-4 w-4 ${runAuditMutation.isPending ? "animate-spin" : ""}`}
          />
          <span>{runAuditMutation.isPending ? "Verifying Signals..." : "Run Pre-Ad Scan"}</span>
        </button>
      </div>

      {auditQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-56 rounded-3xl" />
          ))}
        </div>
      ) : !audit ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center space-y-3">
          <p className="text-xs text-base-content/60">No audience trust scan found.</p>
          <button
            type="button"
            onClick={() => runAuditMutation.mutate()}
            className="btn btn-primary btn-sm rounded-xl font-bold"
          >
            Run First Pre-Ad Gate Scan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status & Gauge Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gate Status Card */}
            <div className="lg:col-span-8 rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                    Campaign Gate Verdict
                  </span>
                  <span className="text-xs text-base-content/50 font-mono">
                    Updated: {new Date(audit.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {audit.preAdGateStatus === "approved" ? (
                    <div className="badge badge-lg badge-success text-white font-black text-sm px-4 py-4 gap-2 rounded-2xl shadow-sm">
                      <Icon icon="solar:check-circle-bold" className="h-5 w-5" />
                      <span>GATE APPROVED &bull; AD-READY</span>
                    </div>
                  ) : audit.preAdGateStatus === "caution" ? (
                    <div className="badge badge-lg badge-warning text-slate-900 font-black text-sm px-4 py-4 gap-2 rounded-2xl shadow-sm">
                      <Icon icon="solar:danger-triangle-bold" className="h-5 w-5" />
                      <span>CAUTION &bull; MINOR TRUST FRICTION</span>
                    </div>
                  ) : (
                    <div className="badge badge-lg badge-error text-white font-black text-sm px-4 py-4 gap-2 rounded-2xl shadow-sm">
                      <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
                      <span>GATE BLOCKED &bull; HIGH CHURN RISK</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-base-content/80 font-medium leading-relaxed bg-base-200/40 p-3.5 rounded-2xl border border-base-300/50">
                  {audit.recommendedAction}
                </p>
              </div>

              {/* Sentiment Distribution Bars */}
              <div className="space-y-2 pt-3 border-t border-base-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-base-content/70">Audience Sentiment Distribution</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-emerald-600 font-bold">
                      {audit.sentimentDistribution.positive}% Positive
                    </span>
                    <span className="text-slate-500 font-bold">
                      {audit.sentimentDistribution.neutral}% Neutral
                    </span>
                    <span className="text-rose-600 font-bold">
                      {audit.sentimentDistribution.negative}% Negative
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full rounded-full bg-base-200 flex overflow-hidden">
                  <div
                    style={{ width: `${audit.sentimentDistribution.positive}%` }}
                    className="bg-emerald-500 h-full transition-all"
                  />
                  <div
                    style={{ width: `${audit.sentimentDistribution.neutral}%` }}
                    className="bg-slate-400 h-full transition-all"
                  />
                  <div
                    style={{ width: `${audit.sentimentDistribution.negative}%` }}
                    className="bg-rose-500 h-full transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Trust Index Radial Gauge */}
            <div className="lg:col-span-4 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Audience Trust Index
              </span>

              <div className="relative flex items-center justify-center">
                <div
                  className="radial-progress text-primary font-black font-mono text-3xl"
                  style={{
                    ["--value" as any]: audit.trustScore,
                    ["--size" as any]: "9rem",
                    ["--thickness" as any]: "10px",
                  }}
                  role="progressbar"
                >
                  {audit.trustScore}
                  <span className="text-xs text-base-content/50 block font-normal">/100</span>
                </div>
              </div>

              <div className="text-xs font-bold text-base-content">
                {audit.trustScore >= 80
                  ? "Superior Brand Trust"
                  : audit.trustScore >= 60
                  ? "Moderate Brand Trust"
                  : "Needs Optimization"}
              </div>
            </div>
          </div>

          {/* Pre-Ad Checklist & Risk Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pre-Ad Launch Checklist */}
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Icon icon="solar:checklist-minimalistic-bold-duotone" className="h-6 w-6" />
                <h3 className="text-base font-black text-base-content">
                  Pre-Campaign Launch Checklist
                </h3>
              </div>

              <div className="space-y-2.5">
                {audit.preAdChecklist?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between gap-3 p-3 rounded-2xl border text-xs font-medium transition-all ${
                      item.passed
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        icon={item.passed ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          item.passed ? "text-emerald-500" : "text-rose-500"
                        }`}
                      />
                      <span className={item.passed ? "text-base-content" : "text-rose-600 font-bold"}>
                        {item.item}
                      </span>
                    </div>

                    {!item.passed && (
                      <button
                        type="button"
                        onClick={() =>
                          addRoadmapTaskMutation.mutate({
                            title: `Resolve Pre-Ad Friction: ${item.item}`,
                            description: `Complete the pre-ad checklist item before increasing ad spend: ${item.item}.`,
                          })
                        }
                        className="badge badge-outline badge-xs text-[10px] text-primary hover:bg-primary hover:text-white cursor-pointer py-2"
                      >
                        + Roadmap
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alerts & Ad Comment Toxicity */}
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <Icon icon="solar:danger-triangle-bold-duotone" className="h-6 w-6" />
                <h3 className="text-base font-black text-base-content">
                  Ad Comment &amp; Brand Risk Alerts
                </h3>
              </div>

              <div className="space-y-3">
                {audit.riskAlerts?.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-base-300 bg-base-200/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base-content flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${
                            alert.severity === "high"
                              ? "bg-rose-500"
                              : alert.severity === "moderate"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {alert.title}
                      </h4>
                      <span className="badge badge-xs font-mono uppercase font-bold text-[9px]">
                        {alert.severity} Risk
                      </span>
                    </div>

                    <p className="text-base-content/70 font-medium leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="bg-base-100 p-2.5 rounded-xl border border-base-300/60 text-[11px] text-primary font-medium">
                      💡 <strong>Action:</strong> {alert.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Passing Trust Signals */}
          <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Icon icon="solar:verified-check-bold" className="h-6 w-6" />
              <h3 className="text-base font-black text-base-content">
                Verified Social Proof &amp; Trust Footprint
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {audit.trustSignals?.map((sig, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-base-300 bg-base-200/30 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base-content flex items-center gap-1.5">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-emerald-500" />
                      {sig.title}
                    </span>
                    <span className="badge badge-xs badge-neutral text-[9px] font-mono">
                      {sig.source}
                    </span>
                  </div>
                  <p className="text-base-content/70 font-medium">{sig.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
