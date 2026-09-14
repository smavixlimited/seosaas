import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Link2,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  RefreshCw,
  Mail,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Globe,
  Award,
  ChevronRight,
  Filter,
  Users,
  Clock,
  ThumbsUp,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBacklinkProspects,
  generateOutreachPitch,
  updateProspectStatus,
  deleteProspect,
} from "@/serverFunctions/backlink-prospecting";
import type {
  ProspectItem,
  GeneratedPitchResult,
  OutreachAngleCategory,
} from "@/services/backlink-prospecting.service";
import { FeatureUpgradeGate } from "@/client/components/billing/FeatureUpgradeGate";

const ANGLE_LABELS: Record<
  OutreachAngleCategory,
  { label: string; bg: string; text: string; icon: string }
> = {
  resource_inclusion: {
    label: "Resource Inclusion",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "📚",
  },
  competitor_alternative: {
    label: "Competitor Alternative",
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: "⚔️",
  },
  expert_quote: {
    label: "Expert Quote / Benchmark",
    bg: "bg-purple-500/10 border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    icon: "💡",
  },
  broken_link: {
    label: "Broken Link Replacement",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: "🔗",
  },
  guest_post: {
    label: "Guest Authority Contribution",
    bg: "bg-rose-500/10 border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    icon: "✍️",
  },
};

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "NG", label: "Nigeria" },
  { code: "DE", label: "Germany" },
  { code: "IN", label: "India" },
];

export function BacklinkProspectorStudio({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeModalProspect, setActiveModalProspect] =
    useState<ProspectItem | null>(null);
  const [customAngle, setCustomAngle] = useState<
    OutreachAngleCategory | undefined
  >(undefined);
  const [customNotes, setCustomNotes] = useState("");
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "followup" | "social">(
    "email",
  );

  // 1. Query prospects
  const prospectsQuery = useQuery({
    queryKey: ["backlink-prospects", projectId, selectedCountry],
    queryFn: () =>
      getBacklinkProspects({
        data: { projectId, countryCode: selectedCountry },
      }),
  });

  // 2. Mutation to refresh scan
  const refreshMutation = useMutation({
    mutationFn: () =>
      getBacklinkProspects({
        data: {
          projectId,
          countryCode: selectedCountry,
          refresh: true,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["backlink-prospects", projectId, selectedCountry],
        data,
      );
      toast.success("Discovered fresh high-authority backlink prospects!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to scan backlink prospects");
    },
  });

  // 3. Mutation to generate AI pitch
  const generatePitchMutation = useMutation({
    mutationFn: (prospect: ProspectItem) =>
      generateOutreachPitch({
        data: {
          projectId,
          prospectId: prospect.id,
          prospectDomain: prospect.prospectDomain,
          prospectName: prospect.prospectName,
          angle: customAngle || prospect.recommendedAngle,
          customNotes,
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["backlink-prospects", projectId],
      });
      toast.success("AI Outreach pitch generated successfully!");
      if (activeModalProspect) {
        setActiveModalProspect({
          ...activeModalProspect,
          subjectLines: data.subjectLines,
          pitchBody: data.pitchBody,
          followUpBody: data.followUpBody,
          socialDmBody: data.socialDmBody,
          recommendedAngle: data.recommendedAngle,
        });
      }
    },
    onError: (err: any) => {
      if (
        err.message?.includes("Upgrade") ||
        err.message?.includes("plan") ||
        err.message?.includes("entitlement") ||
        err.status === 403
      ) {
        setShowUpgradeGate(true);
      } else {
        toast.error(err.message || "Failed to generate AI pitch");
      }
    },
  });

  // 4. Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (vars: {
      prospectId: string;
      status: "suggested" | "contacted" | "responded" | "won" | "dismissed";
      contactEmail?: string;
      notes?: string;
    }) =>
      updateProspectStatus({
        data: {
          projectId,
          prospectId: vars.prospectId,
          status: vars.status,
          contactEmail: vars.contactEmail,
          notes: vars.notes,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backlink-prospects", projectId],
      });
      toast.success("Prospect updated!");
    },
  });

  // 5. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (prospectId: string) =>
      deleteProspect({ data: { projectId, prospectId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backlink-prospects", projectId],
      });
      toast.success("Prospect removed");
      if (activeModalProspect) setActiveModalProspect(null);
    },
  });

  const prospects = prospectsQuery.data || [];
  const filteredProspects = prospects.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  const stats = {
    total: prospects.length,
    avgDr:
      prospects.length > 0
        ? Math.round(
            prospects.reduce((acc, p) => acc + p.domainRating, 0) /
              prospects.length,
          )
        : 85,
    contacted: prospects.filter((p) => p.status === "contacted").length,
    won: prospects.filter((p) => p.status === "won").length,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Feature Intro */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-base-100 to-base-200/50 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
              <span>Semrush-Style Authority Prospecting & Pitch Studio</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              AI Backlink Prospector & Outreach Pitch Studio
            </h2>
            <p className="text-sm md:text-base text-base-content/80 leading-relaxed">
              Scan high-ranking authority brands in your niche, identify winning
              link angles (competitor alternatives, resource lists, expert
              benchmarks), and generate tailored cold email pitches that
              actually convert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur border border-base-300 rounded-xl px-3 py-1.5 shadow-sm">
              <Globe className="w-4 h-4 text-base-content/60" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="btn btn-primary btn-sm md:btn-md gap-2 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
              />
              <span>
                {refreshMutation.isPending
                  ? "Scanning Leaders..."
                  : "Discover Authority Leads"}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-base-content/10">
          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Avg Authority Score</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-primary">
              DR {stats.avgDr}
            </div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <Users className="w-4 h-4 text-blue-500" />
              <span>High-DR Prospects</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total} Targets</div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <Send className="w-4 h-4 text-purple-500" />
              <span>Contacted</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.contacted} Pitched
            </div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Links Won</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">
              {stats.won} Active
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-base-200/70 rounded-xl border border-base-300 w-fit">
          {["all", "suggested", "contacted", "responded", "won"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              {st === "all" ? `All (${prospects.length})` : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-base-content/60">
          Showing {filteredProspects.length} high-authority link prospects in{" "}
          {selectedCountry}
        </span>
      </div>

      {/* Prospects List / Cards */}
      {prospectsQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-base-100 rounded-2xl border border-base-200 gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-base-content/80">
            Scanning industry leaders and calculating link intersect angles...
          </p>
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="text-center p-12 bg-base-100 rounded-2xl border border-dashed border-base-300 space-y-4">
          <Link2 className="w-12 h-12 text-base-content/40 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-semibold text-base">No Prospects Found</h4>
            <p className="text-xs text-base-content/70">
              Click &quot;Discover Authority Leads&quot; above to scan top
              ranking domains in your industry and country.
            </p>
          </div>
          <button
            onClick={() => refreshMutation.mutate()}
            className="btn btn-primary btn-sm"
          >
            Discover Prospects Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProspects.map((prospect) => {
            const angleMeta =
              ANGLE_LABELS[prospect.recommendedAngle] ||
              ANGLE_LABELS.resource_inclusion;
            const hasPitch = Boolean(prospect.pitchBody);

            return (
              <div
                key={prospect.id}
                className="bg-base-100 rounded-2xl border border-base-200 hover:border-primary/40 transition-all p-5 md:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  {/* Title & Domain */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {prospect.prospectName.charAt(0)}
                      </span>
                      <h3 className="text-base md:text-lg font-bold">
                        {prospect.prospectName}
                      </h3>
                    </div>

                    <a
                      href={
                        prospect.prospectUrl ||
                        `https://${prospect.prospectDomain}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20"
                    >
                      <span>{prospect.prospectDomain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Authority badges */}
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-sm badge-success font-bold gap-1 text-[11px]">
                        <Award className="w-3 h-3" /> DR {prospect.domainRating}
                      </span>
                      <span className="badge badge-sm badge-ghost text-[11px]">
                        {prospect.organicTraffic.toLocaleString()} Mo. Traffic
                      </span>
                      <span className="badge badge-sm badge-outline text-[11px] text-emerald-600">
                        {prospect.spamScore}% Spam
                      </span>
                    </div>
                  </div>

                  {/* Pitch Angle & Match Reason */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1.5 ${angleMeta.bg} ${angleMeta.text}`}
                      >
                        <span>{angleMeta.icon}</span>
                        <span>{angleMeta.label}</span>
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-base-content/80">
                      {prospect.matchReason}
                    </p>
                  </div>
                </div>

                {/* Action Buttons & Status */}
                <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-3 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <select
                      value={prospect.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          prospectId: prospect.id,
                          status: e.target.value as any,
                        })
                      }
                      className="select select-bordered select-xs text-xs font-semibold rounded-lg"
                    >
                      <option value="suggested">Suggested</option>
                      <option value="contacted">Contacted</option>
                      <option value="responded">Responded</option>
                      <option value="won">Link Won 🏆</option>
                      <option value="dismissed">Dismissed</option>
                    </select>

                    <button
                      onClick={() => deleteMutation.mutate(prospect.id)}
                      className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
                      title="Remove Prospect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveModalProspect(prospect);
                      if (!hasPitch) {
                        generatePitchMutation.mutate(prospect);
                      }
                    }}
                    className={`btn btn-sm w-full gap-2 rounded-xl shadow-sm ${
                      hasPitch ? "btn-outline btn-primary" : "btn-primary"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {hasPitch
                        ? "View / Edit Pitch Kit"
                        : "Draft AI Outreach Pitch"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outreach Pitch Studio Modal */}
      {activeModalProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-base-200 flex items-center justify-between bg-base-200/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm font-semibold">
                    Pitch Studio
                  </span>
                  <h3 className="font-bold text-lg md:text-xl">
                    Outreach Kit for {activeModalProspect.prospectName}
                  </h3>
                </div>
                <p className="text-xs text-base-content/70">
                  Target: {activeModalProspect.prospectDomain} • Authority DR{" "}
                  {activeModalProspect.domainRating}
                </p>
              </div>

              <button
                onClick={() => setActiveModalProspect(null)}
                className="btn btn-ghost btn-sm btn-square rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
              {generatePitchMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  <p className="text-sm font-medium text-base-content/80">
                    AI Copywriter is crafting personalized high-converting cold
                    outreach assets...
                  </p>
                </div>
              ) : (
                <>
                  {/* Angle Selector & Re-generate */}
                  <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-base-content/70">
                        Outreach Strategy Angle:
                      </label>
                      <select
                        value={
                          customAngle || activeModalProspect.recommendedAngle
                        }
                        onChange={(e) =>
                          setCustomAngle(
                            e.target.value as OutreachAngleCategory,
                          )
                        }
                        className="select select-bordered select-xs w-full sm:w-auto text-xs font-medium rounded-lg"
                      >
                        <option value="resource_inclusion">
                          Resource List Inclusion
                        </option>
                        <option value="competitor_alternative">
                          Competitor Alternative Comparison
                        </option>
                        <option value="expert_quote">
                          Expert Quote / Benchmark
                        </option>
                        <option value="broken_link">
                          Broken Link Replacement
                        </option>
                        <option value="guest_post">
                          Guest Authority Contribution
                        </option>
                      </select>
                    </div>

                    <button
                      onClick={() =>
                        generatePitchMutation.mutate(activeModalProspect)
                      }
                      disabled={generatePitchMutation.isPending}
                      className="btn btn-outline btn-xs md:btn-sm gap-1.5 self-end sm:self-auto"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${generatePitchMutation.isPending ? "animate-spin" : ""}`}
                      />
                      <span>Regenerate Angle</span>
                    </button>
                  </div>

                  {/* Subject Lines */}
                  {activeModalProspect.subjectLines &&
                    activeModalProspect.subjectLines.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Tested High-Open Subject Lines (Choose One):
                          </span>
                        </label>
                        <div className="space-y-2">
                          {activeModalProspect.subjectLines.map((subj, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl bg-base-200/40 border border-base-300 text-xs md:text-sm font-medium group hover:border-primary/50 transition-all"
                            >
                              <span>{subj}</span>
                              <button
                                onClick={() =>
                                  copyToClipboard(subj, "Subject Line")
                                }
                                className="btn btn-ghost btn-xs gap-1 text-primary"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Channel Tab Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-base-300 pb-2">
                      <button
                        onClick={() => setActiveTab("email")}
                        className={`btn btn-xs rounded-lg font-semibold gap-1.5 ${
                          activeTab === "email"
                            ? "btn-primary"
                            : "btn-ghost text-base-content/70"
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>1. Cold Email Pitch</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("followup")}
                        className={`btn btn-xs rounded-lg font-semibold gap-1.5 ${
                          activeTab === "followup"
                            ? "btn-primary"
                            : "btn-ghost text-base-content/70"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>2. 3-Day Follow-Up</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("social")}
                        className={`btn btn-xs rounded-lg font-semibold gap-1.5 ${
                          activeTab === "social"
                            ? "btn-primary"
                            : "btn-ghost text-base-content/70"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>3. LinkedIn / DM</span>
                      </button>
                    </div>

                    {/* Tab 1: Cold Email Body */}
                    {activeTab === "email" && (
                      <div className="space-y-2">
                        <div className="relative">
                          <textarea
                            readOnly
                            value={activeModalProspect.pitchBody || ""}
                            className="textarea textarea-bordered w-full h-48 text-xs md:text-sm font-mono leading-relaxed p-4 bg-base-200/20"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(
                                activeModalProspect.pitchBody || "",
                                "Email Body",
                              )
                            }
                            className="absolute top-3 right-3 btn btn-primary btn-xs gap-1 shadow-sm"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Email</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Follow-up */}
                    {activeTab === "followup" && (
                      <div className="space-y-2">
                        <div className="relative">
                          <textarea
                            readOnly
                            value={activeModalProspect.followUpBody || ""}
                            className="textarea textarea-bordered w-full h-36 text-xs md:text-sm font-mono leading-relaxed p-4 bg-base-200/20"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(
                                activeModalProspect.followUpBody || "",
                                "Follow-up Email",
                              )
                            }
                            className="absolute top-3 right-3 btn btn-primary btn-xs gap-1 shadow-sm"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Follow-Up</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Social DM */}
                    {activeTab === "social" && (
                      <div className="space-y-2">
                        <div className="relative">
                          <textarea
                            readOnly
                            value={activeModalProspect.socialDmBody || ""}
                            className="textarea textarea-bordered w-full h-32 text-xs md:text-sm font-mono leading-relaxed p-4 bg-base-200/20"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(
                                activeModalProspect.socialDmBody || "",
                                "Social DM",
                              )
                            }
                            className="absolute top-3 right-3 btn btn-primary btn-xs gap-1 shadow-sm"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy DM</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Outreach Contact Email & Status Bar */}
                  <div className="p-4 bg-base-200/40 rounded-xl border border-base-300 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                      Outreach Progress & Tracking
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-base-content/70 block mb-1">
                          Contact Email:
                        </label>
                        <input
                          type="email"
                          defaultValue={
                            activeModalProspect.contactEmail ||
                            `editor@${activeModalProspect.prospectDomain}`
                          }
                          onBlur={(e) =>
                            updateStatusMutation.mutate({
                              prospectId: activeModalProspect.id,
                              status: activeModalProspect.status,
                              contactEmail: e.target.value,
                            })
                          }
                          placeholder="editor@domain.com"
                          className="input input-bordered input-sm w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-base-content/70 block mb-1">
                          Outreach Status:
                        </label>
                        <select
                          value={activeModalProspect.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            updateStatusMutation.mutate({
                              prospectId: activeModalProspect.id,
                              status: newStatus,
                            });
                            setActiveModalProspect({
                              ...activeModalProspect,
                              status: newStatus,
                            });
                          }}
                          className="select select-bordered select-sm w-full text-xs font-semibold"
                        >
                          <option value="suggested">Suggested</option>
                          <option value="contacted">Mark as Contacted</option>
                          <option value="responded">Responded</option>
                          <option value="won">Link Won 🏆</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-5 border-t border-base-200 flex items-center justify-between bg-base-200/20">
              <button
                onClick={() => setActiveModalProspect(null)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeModalProspect.contactEmail || `editor@${activeModalProspect.prospectDomain}`}?subject=${encodeURIComponent(activeModalProspect.subjectLines?.[0] || "")}&body=${encodeURIComponent(activeModalProspect.pitchBody || "")}`}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in Email Client</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Gate Modal */}
      {showUpgradeGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowUpgradeGate(false)}
              className="absolute top-4 right-4 z-10 btn btn-ghost btn-sm btn-square rounded-full"
            >
              ✕
            </button>
            <FeatureUpgradeGate
              featureTitle="AI Backlink Prospector & Pitch Studio"
              featureDescription="AI Backlink discovery and high-converting cold email pitch generation are available on Pro and Agency plans."
              requiredPlanName="Pro or Agency Plan"
              bullets={[
                "Unrestricted high-authority link prospect discovery",
                "Automated multi-angle pitch generation (cold email, follow-up, social DMs)",
                "Full prospect tracking and export to outreach campaigns",
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
