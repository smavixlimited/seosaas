import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getBrandMentionsHub,
  generateMentionPitch,
  updateMentionClaimStatus,
  getAeoSentiment,
  refreshAeoSentimentScan,
} from "@/serverFunctions/brand-mentions";
import type {
  BrandMentionItem,
  AeoSentimentItem,
  MentionType,
  ClaimStatus,
} from "@/services/brand-mentions.service";

interface BrandMentionsPageProps {
  projectId: string;
}

export function BrandMentionsPage({ projectId }: BrandMentionsPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeMainTab, setActiveMainTab] = React.useState<"mentions" | "aeo">("mentions");
  const [mentionTypeFilter, setMentionTypeFilter] = React.useState<"all" | MentionType>("all");
  const [selectedPitch, setSelectedPitch] = React.useState<{
    mention: BrandMentionItem;
    subject: string;
    body: string;
  } | null>(null);

  const hubQuery = useQuery({
    queryKey: ["brandMentionsHub", projectId],
    queryFn: () => getBrandMentionsHub({}),
    staleTime: 60 * 1000,
  });

  const aeoQuery = useQuery({
    queryKey: ["aeoSentiment", projectId],
    queryFn: () => getAeoSentiment({}),
    staleTime: 5 * 60 * 1000,
  });

  const pitchMutation = useMutation({
    mutationFn: (vars: { mention: BrandMentionItem }) =>
      generateMentionPitch({
        data: { mentionId: vars.mention.id },
      }),
    onSuccess: (pitch, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["brandMentionsHub", projectId] });
      setSelectedPitch({
        mention: vars.mention,
        subject: pitch.subject,
        body: pitch.body,
      });
      toast.success("Outreach pitch generated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate outreach pitch");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { mentionId: string; status: ClaimStatus }) =>
      updateMentionClaimStatus({
        data: {
          mentionId: vars.mentionId,
          claimStatus: vars.status,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brandMentionsHub", projectId] });
      toast.success("Mention status updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const refreshAeoMutation = useMutation({
    mutationFn: () => refreshAeoSentimentScan({}),
    onSuccess: (data) => {
      queryClient.setQueryData(["aeoSentiment", projectId], data);
      toast.success("Multi-engine AI search sentiment refreshed!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to refresh AI sentiment");
    },
  });

  const handleLaunchSamForAeo = (item: AeoSentimentItem) => {
    if (typeof window !== "undefined") {
      const prompt = `Act as an Elite AEO & Entity Optimization Specialist. We need to bridge entity citation gaps on ${item.aiEngine.toUpperCase()} for brand "${item.targetBrandName}". Identified gaps: ${item.keyMissingGaps.join("; ")}. Provide step-by-step schema markup, SameAs entity linkages, and a press release outline to secure consistent entity recognition.`;
      sessionStorage.setItem("sam_pending_prompt", prompt);
    }

    toast.success(`Launching SAM AI for ${item.aiEngine.toUpperCase()} optimization...`);

    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: { s: undefined },
    });
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const mentions = hubQuery.data?.mentions || [];
  const metrics = hubQuery.data?.metrics;
  const aeoItems = aeoQuery.data || [];

  const filteredMentions = mentions.filter((m) => {
    if (mentionTypeFilter === "all") return true;
    return m.mentionType === mentionTypeFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              Brand Credibility &amp; AEO
            </span>
            <span className="text-xs text-slate-400 font-mono">Listening Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Brand Mentions &amp; AEO Listening Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Claim high-authority unlinked backlinks across the web and monitor brand sentiment across conversational AI search engines.
          </p>
        </div>

        {/* Top-Level Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMainTab("mentions")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeMainTab === "mentions"
                ? "bg-white dark:bg-slate-700 text-primary shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="solar:link-circle-bold-duotone" className="h-4 w-4" />
            <span>Unlinked Mentions ({mentions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab("aeo")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeMainTab === "aeo"
                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon icon="solar:stars-bold-duotone" className="h-4 w-4" />
            <span>AEO &amp; AI Sentiment ({aeoItems.length})</span>
          </button>
        </div>
      </div>

      {/* Listening Metric Banner */}
      {metrics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">Unlinked Claim Opportunities</span>
            <div className="flex items-baseline justify-between">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
                {metrics.unlinkedMentionsCount} Mentions
              </h4>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                High Value
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Ready for 1-click outreach</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">High Authority Sites (DA 40+)</span>
            <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.highAuthorityCount} Sites
            </h4>
            <span className="text-[11px] text-slate-400">Prime ranking power</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">Recoverable Link Value</span>
            <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${metrics.estimatedLinkValueUsd.toLocaleString()} USD
            </h4>
            <span className="text-[11px] text-slate-400">Est. organic backlink value</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-400 font-medium">Avg. AEO Search Sentiment</span>
            <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">
              {metrics.averageAeoSentimentScore} / 100
            </h4>
            <span className="text-[11px] text-slate-400">Across 4 AI engines</span>
          </div>
        </div>
      ) : null}

      {/* TAB 1: UNLINKED MENTIONS & BACKLINK CLAIM */}
      {activeMainTab === "mentions" ? (
        <div className="space-y-6">
          {/* Sub-Filters */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
            <button
              type="button"
              onClick={() => setMentionTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mentionTypeFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All Mentions ({mentions.length})
            </button>
            <button
              type="button"
              onClick={() => setMentionTypeFilter("unlinked")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mentionTypeFilter === "unlinked"
                  ? "bg-white dark:bg-slate-700 text-amber-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Unlinked (Claim Opportunity)
            </button>
            <button
              type="button"
              onClick={() => setMentionTypeFilter("linked_dofollow")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mentionTypeFilter === "linked_dofollow"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Linked (Dofollow)
            </button>
            <button
              type="button"
              onClick={() => setMentionTypeFilter("ai_citation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mentionTypeFilter === "ai_citation"
                  ? "bg-white dark:bg-slate-700 text-purple-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              AI Citations
            </button>
          </div>

          {/* Mentions Feed */}
          {filteredMentions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
              <Icon icon="solar:document-text-bold-duotone" className="h-8 w-8 mx-auto text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Mentions in this Filter</h4>
              <p className="text-xs text-slate-400">All brand mentions are organized by link type and claim lifecycle.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMentions.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs hover:border-primary/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 font-mono">
                        DA {m.domainAuthority}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.mentionType === "unlinked"
                            ? "bg-amber-500/10 text-amber-600"
                            : m.mentionType === "ai_citation"
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {m.mentionType === "unlinked"
                          ? "Unlinked Mention"
                          : m.mentionType === "ai_citation"
                          ? "AI Overview Citation"
                          : "Linked Dofollow"}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.sentiment === "positive"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : m.sentiment === "critical"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}
                      >
                        {m.sentiment.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Claim Status:</span>
                      <select
                        value={m.claimStatus}
                        onChange={(e) =>
                          statusMutation.mutate({
                            mentionId: m.id,
                            status: e.target.value as ClaimStatus,
                          })
                        }
                        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 text-[10px] font-bold"
                      >
                        <option value="unclaimed">Unclaimed</option>
                        <option value="pitch_generated">Pitch Ready</option>
                        <option value="outreach_sent">Outreach Sent</option>
                        <option value="claimed">Claimed</option>
                        <option value="ignored">Ignored</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <a
                      href={m.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <span>{m.sourceTitle}</span>
                      <Icon icon="solar:arrow-right-up-bold" className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                    <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{m.sourceDomain}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Mention Context Snippet:</span>
                    &ldquo;{m.mentionContext}&rdquo;
                  </div>

                  {/* Pitch / Action Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Discovered: {new Date(m.discoveredAt).toLocaleDateString()}
                    </span>

                    {m.mentionType === "unlinked" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (m.generatedPitchBody && m.generatedPitchSubject) {
                            setSelectedPitch({
                              mention: m,
                              subject: m.generatedPitchSubject,
                              body: m.generatedPitchBody,
                            });
                          } else {
                            pitchMutation.mutate({ mention: m });
                          }
                        }}
                        disabled={pitchMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Icon icon="solar:letter-bold" className="h-4 w-4" />
                        <span>{m.generatedPitchBody ? "View Outreach Pitch" : "Generate Claim Pitch"}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: AEO & AI ENGINE SENTIMENT HUB */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Multi-Model Conversational Search Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How LLMs and Generative Search Engines perceive, rank, and cite your brand entity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshAeoMutation.mutate()}
              disabled={refreshAeoMutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
            >
              <Icon icon="solar:refresh-circle-bold" className={`h-4 w-4 ${refreshAeoMutation.isPending ? "animate-spin" : ""}`} />
              <span>{refreshAeoMutation.isPending ? "Scanning Models..." : "Refresh Scan"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aeoItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                        <Icon icon="solar:stars-bold-duotone" className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                          {item.aiEngine === "google_aio" ? "Google AI Overviews" : item.aiEngine.toUpperCase()}
                        </h4>
                        <span className="text-[10px] text-slate-400">Engine Index Signal</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">
                        {item.sentimentScore}/100
                      </span>
                      <span className="text-[10px] text-slate-400 block">Sentiment</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {item.sentimentSummary}
                  </div>

                  {/* Entity Citation Status */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-400">Entity Citation Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.entityCitationStatus === "present"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : item.entityCitationStatus === "ambiguous"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {item.entityCitationStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Recognized Entity Strengths:
                    </span>
                    {item.keyStrengthsHighlighted.map((str, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <Icon icon="solar:check-circle-bold-duotone" className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>

                  {/* Gaps */}
                  <div className="space-y-1 text-xs pt-1">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Missing Entity Gaps:
                    </span>
                    {item.keyMissingGaps.map((gap, gIdx) => (
                      <div key={gIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchSamForAeo(item)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon icon="solar:bolt-bold-duotone" className="h-4 w-4" />
                  <span>Fix Entity Gaps with SAM AI</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach Pitch Modal */}
      {selectedPitch ? (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  1-Click Backlink Claim Pitch
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  Outreach to {selectedPitch.mention.sourceDomain}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPitch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Email Subject:
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between">
                  <span>{selectedPitch.subject}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedPitch.subject)}
                    className="text-slate-400 hover:text-primary"
                  >
                    <Icon icon="solar:copy-bold" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Email Pitch Body:
                </label>
                <div className="relative">
                  <textarea
                    rows={8}
                    readOnly
                    value={selectedPitch.body}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans text-xs text-slate-800 dark:text-slate-100 leading-relaxed focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedPitch.body)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-600 shadow-2xs"
                  >
                    <Icon icon="solar:copy-bold" className="h-3.5 w-3.5" />
                    <span>Copy Pitch</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`mailto:?subject=${encodeURIComponent(selectedPitch.subject)}&body=${encodeURIComponent(selectedPitch.body)}`}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5"
              >
                <Icon icon="solar:letter-opened-bold" className="h-4 w-4" />
                <span>Open in Mail Client</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    statusMutation.mutate({
                      mentionId: selectedPitch.mention.id,
                      status: "outreach_sent",
                    });
                    setSelectedPitch(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1"
                >
                  <Icon icon="solar:check-circle-bold" className="h-4 w-4" />
                  <span>Mark Outreach Sent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
