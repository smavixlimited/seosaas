import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getViralOpportunities,
  generateViralOpportunities,
  updateViralOpportunityStatus,
} from "@/serverFunctions/viral-content";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { BrandSettingsCompletenessReminder } from "@/client/components/BrandSettingsCompletenessReminder";
import type {
  ViralPlatform,
  ViralOpportunityItem,
} from "@/services/viral-content.service";

interface ViralContentOpportunityDetectorProps {
  projectId: string;
}

export function ViralContentOpportunityDetector({
  projectId,
}: ViralContentOpportunityDetectorProps) {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = React.useState<
    ViralPlatform | "all"
  >("all");
  const [customTopic, setCustomTopic] = React.useState("");
  const [teleprompterItem, setTeleprompterItem] =
    React.useState<ViralOpportunityItem | null>(null);

  const opportunitiesQuery = useQuery({
    queryKey: ["viralOpportunities", projectId, selectedPlatform],
    queryFn: () =>
      getViralOpportunities({
        data: {
          projectId,
          platform: selectedPlatform === "all" ? undefined : selectedPlatform,
        },
      }),
  });

  const generateMutation = useMutation({
    mutationFn: (topicOverride?: string | void) =>
      generateViralOpportunities({
        data: {
          projectId,
          platform: selectedPlatform === "all" ? undefined : selectedPlatform,
          customTopic: topicOverride ?? (customTopic.trim() || undefined),
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["viralOpportunities", projectId, selectedPlatform],
        data,
      );
      toast.success("Generated fresh viral hooks & scripts!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate viral opportunities");
    },
  });

  const handleQuickTopic = (topic: string) => {
    setCustomTopic(topic);
    generateMutation.mutate(topic);
  };


  const addRoadmapMutation = useMutation({
    mutationFn: (item: ViralOpportunityItem) =>
      createRoadmapTask({
        data: {
          projectId,
          title: `Create Viral Content: "${item.title}" (${item.platform.toUpperCase()})`,
          description: `Hook:\n"${item.hookText}"\n\nOutline:\n${item.scriptOutline}\n\nTarget Audience: ${item.targetAudience}`,
          category: "growth",
          priority: "high",
        },
      }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added viral content task to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add task to roadmap");
    },
  });

  const opportunities = opportunitiesQuery.data ?? [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const getPlatformIcon = (platform: ViralPlatform) => {
    switch (platform) {
      case "tiktok":
        return "solar:music-notes-bold-duotone";
      case "instagram":
        return "solar:camera-bold-duotone";
      case "youtube":
        return "solar:videocamera-bold-duotone";
      case "x":
        return "solar:hashtag-bold-duotone";
      case "linkedin":
        return "solar:case-bold-duotone";
      default:
        return "solar:share-circle-bold-duotone";
    }
  };

  const getPlatformColor = (platform: ViralPlatform) => {
    switch (platform) {
      case "tiktok":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "instagram":
        return "text-pink-500 bg-pink-500/10 border-pink-500/20";
      case "youtube":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "x":
        return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      case "linkedin":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Brand Settings Completeness Reminder */}
      <BrandSettingsCompletenessReminder projectId={projectId} />

      {/* Top Banner with Quick Actions */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-base-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Icon icon="solar:fire-bold" className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-base-content">
                Viral Content &amp; Hook Discovery
              </h2>
              <span className="badge badge-primary badge-xs font-bold uppercase tracking-wider">
                High CTR Angles
              </span>
            </div>
            <p className="text-xs text-base-content/70 mt-0.5">
              Discover high-converting video hooks, contrarian threads, and
              viral frameworks engineered from trending market stories in your
              target country and industry.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={generateMutation.isPending || opportunitiesQuery.isFetching}
          onClick={() => generateMutation.mutate(undefined)}
          className="btn btn-primary rounded-2xl h-11 px-6 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <Icon
            icon="solar:magic-stick-3-bold"
            className={`h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`}
          />
          <span>
            {generateMutation.isPending
              ? "Scanning Trends..."
              : "Generate Fresh Hooks"}
          </span>
        </button>
      </div>

      {/* Custom Topic / Angle Input Bar */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customTopic.trim()) {
                  generateMutation.mutate(customTopic.trim());
                }
              }}
              placeholder="e.g. Why our automated site audit saves 10 hours a week, or Ahrefs vs OpenSEO..."
              className="input input-bordered w-full rounded-2xl text-xs pl-9 pr-4 font-medium"
            />
            <Icon
              icon="solar:magnifer-linear"
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />
          </div>

          <button
            type="button"
            disabled={generateMutation.isPending || !customTopic.trim()}
            onClick={() => generateMutation.mutate(customTopic.trim())}
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white gap-1.5 shrink-0 px-4"
          >
            <Icon icon="solar:stars-bold" className="h-4 w-4" />
            <span>Generate Custom Angle</span>
          </button>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-extrabold uppercase text-base-content/50 mr-1">
            Try Angle:
          </span>
          {[
            "⚡ Why our pricing beats legacy tools",
            "🚀 Google AI Overviews traffic recovery",
            "💡 3 fatal SEO mistakes in 2026",
            "🔥 1-Click site audit teardown",
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => handleQuickTopic(promptText)}
              className="badge badge-sm badge-ghost border border-base-300/80 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-[11px] font-semibold cursor-pointer py-2 px-2.5"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-base-300 pb-3">
        {[
          {
            id: "all",
            label: "All Platforms",
            icon: "solar:widget-bold-duotone",
          },
          {
            id: "tiktok",
            label: "TikTok",
            icon: "solar:music-notes-bold-duotone",
          },
          {
            id: "instagram",
            label: "Instagram Reels",
            icon: "solar:camera-bold-duotone",
          },
          {
            id: "youtube",
            label: "YouTube Shorts",
            icon: "solar:videocamera-bold-duotone",
          },
          { id: "x", label: "X (Twitter)", icon: "solar:hashtag-bold-duotone" },
          {
            id: "linkedin",
            label: "LinkedIn",
            icon: "solar:case-bold-duotone",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedPlatform(tab.id as any)}
            className={`btn btn-sm rounded-2xl text-xs font-bold gap-1.5 transition-all ${
              selectedPlatform === tab.id
                ? "btn-primary text-white shadow-sm shadow-primary/20"
                : "btn-ghost text-base-content/70 hover:text-base-content"
            }`}
          >
            <Icon icon={tab.icon} className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      {opportunitiesQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-64 rounded-3xl" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-base-200 text-base-content/40 flex items-center justify-center">
            <Icon icon="solar:fire-bold" className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-base-content">
            No Viral Opportunities Found
          </h3>
          <p className="text-xs text-base-content/60 max-w-md mx-auto">
            Click &quot;Generate Fresh Hooks&quot; to discover high-converting
            content formats for your brand.
          </p>
          <button
            type="button"
            onClick={() => generateMutation.mutate(undefined)}
            className="btn btn-primary btn-sm rounded-xl font-bold"
          >
            Generate Viral Hooks Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {opportunities.map((item) => {
            const platformColor = getPlatformColor(item.platform);
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Platform & Potential Score */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${platformColor}`}>
                        <Icon
                          icon={getPlatformIcon(item.platform)}
                          className="h-4 w-4"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-base-content block">
                          {item.platform}
                        </span>
                        <span className="text-[10px] text-base-content/50 font-bold capitalize">
                          {item.opportunityType.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-600 dark:text-amber-400 font-black text-xs">
                      <Icon icon="solar:fire-bold" className="h-3.5 w-3.5" />
                      <span>{item.viralPotentialScore}/100 Potential</span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-base-content">
                    {item.title}
                  </h3>

                  {/* Hook Text Display */}
                  <div className="rounded-2xl bg-base-200/50 p-4 border border-base-300/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">
                        High-Converting Opening Hook
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(item.hookText, "Hook Text")
                        }
                        className="btn btn-ghost btn-xs text-primary font-bold gap-1 p-1 hover:bg-primary/10 rounded-lg"
                      >
                        <Icon icon="solar:copy-bold" className="h-3.5 w-3.5" />
                        Copy Hook
                      </button>
                    </div>
                    <p className="font-black text-sm text-base-content leading-snug">
                      &ldquo;{item.hookText}&rdquo;
                    </p>
                  </div>

                  {/* Script Outline Breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-base-content/60 block">
                      Video Script &amp; Structure Outline
                    </span>
                    <pre className="text-xs text-base-content/80 font-mono bg-base-200/30 p-3 rounded-2xl border border-base-300/40 whitespace-pre-wrap leading-relaxed font-medium">
                      {item.scriptOutline}
                    </pre>
                  </div>

                  {/* Target Audience & Hashtags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-base-content/70">
                      Audience:{" "}
                      <strong className="text-base-content">
                        {item.targetAudience}
                      </strong>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="badge badge-xs badge-neutral text-[10px] font-mono py-1 px-1.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-base-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTeleprompterItem(item)}
                      className="btn btn-outline btn-sm rounded-xl text-xs font-bold gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Icon icon="solar:videocamera-record-bold" className="h-3.5 w-3.5" />
                      <span>Teleprompter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Hook:\n"${item.hookText}"\n\nOutline:\n${item.scriptOutline}\n\nTarget Audience: ${item.targetAudience}\nTags: ${item.tags.join(" ")}`,
                          "Full Script",
                        )
                      }
                      className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border-base-300 hover:bg-base-200"
                    >
                      <Icon icon="solar:copy-bold" className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={addRoadmapMutation.isPending}
                    onClick={() => addRoadmapMutation.mutate(item)}
                    className="btn btn-primary btn-sm rounded-xl text-xs font-bold text-white shadow-md shadow-primary/20 gap-1.5"
                  >
                    <Icon icon="solar:rocket-bold" className="h-3.5 w-3.5" />
                    <span>Add to Roadmap</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Teleprompter / Creator Script Modal */}
      {teleprompterItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-base-100 border border-base-300 p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon icon="solar:videocamera-record-bold" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-base-content">
                    Teleprompter &amp; Spoken Script Mode
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Optimized for {teleprompterItem.platform.toUpperCase()} short-form recording (~35-45s)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTeleprompterItem(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {/* Speaking Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">Speaking Time</span>
                <span className="text-sm font-black text-primary">~35 - 45 sec</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">Viral Score</span>
                <span className="text-sm font-black text-amber-500">{teleprompterItem.viralPotentialScore}/100</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">Target Audience</span>
                <span className="text-xs font-black text-base-content truncate block">{teleprompterItem.targetAudience}</span>
              </div>
            </div>

            {/* Hook Highlight */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider flex items-center gap-1">
                <Icon icon="solar:fire-bold" className="h-3.5 w-3.5" />
                0-3s Opening Hook (Say with intense energy):
              </span>
              <p className="text-base font-black text-base-content leading-snug">
                &ldquo;{teleprompterItem.hookText}&rdquo;
              </p>
            </div>

            {/* Full Script Text */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-base-content/60 block">Full Teleprompter Breakdown:</span>
              <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 whitespace-pre-wrap font-sans text-sm leading-relaxed text-base-content/90 font-medium">
                {teleprompterItem.scriptOutline}
              </div>
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-bold text-base-content/60 mr-1">Recommended Tags:</span>
              {teleprompterItem.tags.map((tag, tIdx) => (
                <span key={tIdx} className="badge badge-neutral text-xs font-mono py-1 px-2">
                  {tag}
                </span>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-base-200">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${teleprompterItem.hookText}\n\n${teleprompterItem.scriptOutline}\n\n${teleprompterItem.tags.join(" ")}`,
                    "Full Script & Caption",
                  )
                }
                className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
              >
                <Icon icon="solar:copy-bold" className="h-4 w-4" />
                <span>Copy Caption + Script</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addRoadmapMutation.mutate(teleprompterItem);
                  setTeleprompterItem(null);
                }}
                className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
              >
                <Icon icon="solar:rocket-bold" className="h-4 w-4" />
                <span>Add to Action Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
