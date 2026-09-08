import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getBrandAnalysisSummary,
  runBrandAnalysis,
} from "@/serverFunctions/brand-competitor";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { BrandSettingsCompletenessReminder } from "@/client/components/BrandSettingsCompletenessReminder";

interface BrandAnalysisPageProps {
  projectId: string;
}

export function BrandAnalysisPage({ projectId }: BrandAnalysisPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const analysisQuery = useQuery({
    queryKey: ["brandAnalysisSummary", projectId],
    queryFn: () => getBrandAnalysisSummary({ data: { projectId } }),
  });

  const reanalyzeMutation = useMutation({
    mutationFn: () => runBrandAnalysis({ data: { projectId } }),
    onSuccess: (freshData) => {
      queryClient.setQueryData(["brandAnalysisSummary", projectId], freshData);
      toast.success("Fresh 360° Brand Strategy Teardown completed!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to re-run brand analysis");
    },
  });

  const data = analysisQuery.data;
  const profile = data?.profile;
  const score = data?.score || 60;
  const strengths = data?.strengths || [];
  const weaknesses = data?.weaknesses || [];
  const opportunities = data?.opportunities || [];

  const addRoadmapTaskMutation = useMutation({
    mutationFn: (item: {
      title: string;
      action: string;
      priority: string;
      suggestedPromptForSam?: string;
    }) =>
      createRoadmapTask({
        data: {
          projectId,
          title: item.title,
          description: item.action,
          category: item.priority === "CRITICAL" ? "high_impact" : "growth",
          priority: item.priority === "CRITICAL" ? "critical" : "high",
          aiPrompt: item.suggestedPromptForSam,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added brand optimization to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add task to roadmap");
    },
  });

  const exportAllWeaknessesMutation = useMutation({
    mutationFn: async () => {
      for (const w of weaknesses) {
        await createRoadmapTask({
          data: {
            projectId,
            title: w.title,
            description: w.action,
            category: w.priority === "CRITICAL" ? "high_impact" : "growth",
            priority: w.priority === "CRITICAL" ? "critical" : "high",
            aiPrompt: `Brand weakness to fix: ${w.title} - ${w.description}. Proposed action: ${w.action}`,
          },
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success(`Exported ${weaknesses.length} items to Action Roadmap!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to export weaknesses");
    },
  });


  const socialLinks = (profile?.socialLinks || {}) as Record<
    string,
    string | undefined
  >;

  const socialChannels = [
    {
      id: "twitter",
      name: "Twitter / X",
      icon: "logos:twitter",
      handle: socialLinks.twitter,
      placeholder: "twitter.com/yourbrand",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "logos:linkedin-icon",
      handle: socialLinks.linkedin,
      placeholder: "linkedin.com/company/yourbrand",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "logos:youtube-icon",
      handle: socialLinks.youtube,
      placeholder: "youtube.com/@yourbrand",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "logos:instagram-icon",
      handle: socialLinks.instagram,
      placeholder: "instagram.com/yourbrand",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "logos:tiktok-icon",
      handle: socialLinks.tiktok,
      placeholder: "tiktok.com/@yourbrand",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "logos:facebook",
      handle: socialLinks.facebook,
      placeholder: "facebook.com/yourbrand",
    },
  ];

  if (analysisQuery.isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-base-300 rounded-lg w-1/4" />
          <div className="h-4 bg-base-300 rounded-lg w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-base-300 rounded-2xl" />
            <div className="h-40 bg-base-300 rounded-2xl" />
            <div className="h-40 bg-base-300 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Brand Settings Completeness Reminder */}
      <BrandSettingsCompletenessReminder projectId={projectId} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 border border-base-300/80 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
              Brand Analysis &amp; Health Hub
            </h1>
            <span className="badge badge-primary badge-sm font-bold">
              360° Teardown
            </span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70">
            Comprehensive audit of your brand identity, market positioning, social distribution, and authority signals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={reanalyzeMutation.isPending || analysisQuery.isFetching}
            onClick={() => reanalyzeMutation.mutate()}
            className="btn btn-primary btn-sm rounded-xl font-bold text-white gap-1.5 shadow-md shadow-primary/20"
          >
            <Icon
              icon="solar:restart-bold"
              className={`size-4 ${reanalyzeMutation.isPending ? "animate-spin" : ""}`}
            />
            <span>
              {reanalyzeMutation.isPending
                ? "Teardown in Progress..."
                : "Re-run 360° Analysis"}
            </span>
          </button>
          <Link
            to="/p/$projectId/settings"
            params={{ projectId }}
            className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
          >
            <Icon icon="solar:pen-2-bold" className="size-4" />
            <span>Edit Brand Profile</span>
          </Link>
          <Link
            to="/p/$projectId/ad-readiness"
            params={{ projectId }}
            className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5 shadow-xs"
          >
            <Icon icon="solar:target-bold-duotone" className="size-4" />
            <span>Landing Page Ad Audit</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Brand Strength Score */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Brand Authority Score
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-primary font-mono">
                {score}
              </span>
              <span className="text-xs text-base-content/50 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] text-base-content/70 mt-1 font-medium">
              {score >= 80 ? "Strong Market Presence" : score >= 60 ? "Moderate Authority" : "Emerging Brand"}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon="solar:shield-star-bold-duotone" className="size-6" />
          </div>
        </div>

        {/* Social Distribution */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Active Social Channels
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-base-content font-mono">
                {data?.activeSocialCount || 0}
              </span>
              <span className="text-xs text-base-content/50 font-bold">/ 6 Verified</span>
            </div>
            <p className="text-[11px] text-base-content/70 mt-1 font-medium">
              {data?.activeSocialCount ? `${data.activeSocialCount} official profiles connected` : "Connect social channels"}
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-info/10 flex items-center justify-center text-info">
            <Icon icon="solar:share-circle-bold-duotone" className="size-6" />
          </div>
        </div>

        {/* Tracked Competitors */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Rival Benchmark Radar
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-base-content font-mono">
                {data?.trackedCompetitorCount || 0}
              </span>
              <span className="text-xs text-base-content/50 font-bold">Rivals</span>
            </div>
            <p className="text-[11px] text-base-content/70 mt-1 font-medium">
              <Link to="/p/$projectId/competitors" params={{ projectId }} className="text-primary hover:underline font-bold">
                View Competitors Directory &rarr;
              </Link>
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
            <Icon icon="solar:users-group-two-rounded-bold-duotone" className="size-6" />
          </div>
        </div>

        {/* Competitor Ad Spying Quick Link */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-base-100 to-base-200 border border-primary/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              Competitor Ad Spying
            </p>
            <p className="text-xs text-base-content/80 mt-1 font-medium leading-snug">
              Spy on winning Meta, Google &amp; TikTok ads
            </p>
            <Link
              to="/p/$projectId/competitor-ads"
              params={{ projectId }}
              className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline mt-2"
            >
              <span>Open Ad Spy Engine</span>
              <Icon icon="solar:arrow-right-linear" className="size-3.5" />
            </Link>
          </div>
          <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
            <Icon icon="solar:radar-bold" className="size-6" />
          </div>
        </div>
      </div>

      {/* Brand Identity & Core Value Proposition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Brand Core Positioning */}
        <div className="lg:col-span-7 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:crown-bold-duotone" className="size-5 text-primary" />
              <h2 className="text-base sm:text-lg font-black text-base-content">
                Brand Positioning &amp; Identity
              </h2>
            </div>
            <Link
              to="/p/$projectId/settings"
              params={{ projectId }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Edit in Settings
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                Brand Name
              </span>
              <span className="text-sm font-black text-base-content mt-0.5 block">
                {profile?.brandName || "My Brand"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                Official Domain
              </span>
              <a
                href={profile?.websiteUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-black text-primary hover:underline mt-0.5 block truncate"
              >
                {profile?.websiteUrl || "Not set"}
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                Industry &amp; Market
              </span>
              <span className="text-sm font-black text-base-content mt-0.5 block">
                {profile?.industry || "SaaS / Technology"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                Target Country &amp; Language
              </span>
              <span className="text-sm font-black text-base-content mt-0.5 block">
                {profile?.targetCountry || "US"} ({profile?.targetLanguage || "English"})
              </span>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Icon icon="solar:stars-minimalistic-bold" className="size-4" />
              <span>Unique Selling Proposition (USP)</span>
            </div>
            <p className="text-sm text-base-content font-medium leading-relaxed">
              {profile?.valueProposition ||
                "No Unique Selling Proposition defined yet. Add your core differentiation in Brand Settings to sharpen AI-generated recommendations and ad strategy."}
            </p>
          </div>

          {/* Brand Bio */}
          {profile?.brandDescription && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                Brand Overview &amp; Bio
              </span>
              <p className="text-xs text-base-content/80 leading-relaxed bg-base-200/40 p-3.5 rounded-xl border border-base-300/50">
                {profile.brandDescription}
              </p>
            </div>
          )}
        </div>

        {/* Right 5 cols: Official Social Channels Matrix */}
        <div className="lg:col-span-5 bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:share-circle-bold-duotone" className="size-5 text-primary" />
              <h2 className="text-base sm:text-lg font-black text-base-content">
                Official Social Channels
              </h2>
            </div>
            <span className="text-[11px] font-bold text-base-content/60 font-mono">
              {data?.activeSocialCount || 0} Connected
            </span>
          </div>

          <p className="text-xs text-base-content/70">
            Connected social handles allow search engines and AI agents to verify brand entity knowledge graph authority.
          </p>

          <div className="space-y-2">
            {socialChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 rounded-xl bg-base-200/40 border border-base-300/60 hover:bg-base-200/70 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon icon={channel.icon} className="size-5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-base-content block truncate">
                      {channel.name}
                    </span>
                    {channel.handle ? (
                      <a
                        href={channel.handle.startsWith("http") ? channel.handle : `https://${channel.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline truncate block"
                      >
                        {channel.handle}
                      </a>
                    ) : (
                      <span className="text-[11px] text-base-content/40 italic block">
                        Not connected
                      </span>
                    )}
                  </div>
                </div>

                {channel.handle ? (
                  <span className="badge badge-success badge-xs font-bold text-white shrink-0">
                    Active
                  </span>
                ) : (
                  <Link
                    to="/p/$projectId/settings"
                    params={{ projectId }}
                    className="btn btn-ghost btn-xs text-primary font-bold shrink-0"
                  >
                    + Add
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Scorecard: What You Are Doing Well At vs What You Need to Improve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: What you are doing well at (Strengths) */}
        <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-success/15 flex items-center justify-center text-success">
                <Icon icon="solar:check-circle-bold" className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-base-content">
                  What You Are Doing Well At
                </h3>
                <p className="text-[11px] text-base-content/60 font-medium">
                  Verified brand strengths &amp; authority anchors
                </p>
              </div>
            </div>
            <span className="badge badge-success badge-sm font-bold text-white">
              {strengths.length} Strengths
            </span>
          </div>

          <div className="space-y-3">
            {strengths.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-success/5 border border-success/20 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-base-content flex items-center gap-1.5">
                    <Icon icon="solar:verified-check-bold" className="size-3.5 text-success shrink-0" />
                    <span>{item.title}</span>
                  </h4>
                  <span className="badge badge-outline badge-xs font-bold text-success border-success/40 shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: What you need to improve (Weaknesses & Fixes) */}
        <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-error/15 flex items-center justify-center text-error">
                <Icon icon="solar:danger-triangle-bold" className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-base-content">
                  What You Need to Improve
                </h3>
                <p className="text-[11px] text-base-content/60 font-medium">
                  Actionable fixes with 1-Click Action Roadmap export
                </p>
              </div>
            </div>
            {weaknesses.length > 0 && (
              <button
                type="button"
                onClick={() => exportAllWeaknessesMutation.mutate()}
                disabled={exportAllWeaknessesMutation.isPending}
                className="btn btn-outline btn-xs rounded-lg font-bold gap-1"
              >
                <Icon icon="solar:export-bold" className="size-3" />
                <span>Export All</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {weaknesses.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-error/5 border border-error/20 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-base-content flex items-center gap-1.5">
                    <Icon icon="solar:info-circle-bold" className="size-3.5 text-error shrink-0" />
                    <span>{item.title}</span>
                  </h4>
                  <span
                    className={`badge badge-xs font-bold shrink-0 ${
                      item.priority === "CRITICAL"
                        ? "badge-error text-white"
                        : "badge-warning text-warning-content"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-error/15">
                  <span className="text-[11px] text-base-content/70 italic truncate">
                    👉 {item.action}
                  </span>
                  <button
                    type="button"
                    onClick={() => addRoadmapTaskMutation.mutate(item)}
                    disabled={addRoadmapTaskMutation.isPending}
                    className="btn btn-ghost btn-xs text-primary font-extrabold hover:bg-primary/10 shrink-0"
                  >
                    + Add to Roadmap
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Growth Opportunities */}
      <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-base-200 pb-3">
          <Icon icon="solar:lightbulb-bolt-bold-duotone" className="size-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-black text-base-content">
            Strategic Growth &amp; Expansion Opportunities
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-2xl bg-base-200/50 border border-base-300/80 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-base-content">
                  {opp.title}
                </h4>
                <span className="badge badge-primary badge-xs font-mono font-bold text-white shrink-0">
                  {opp.potentialGain}
                </span>
              </div>
              <p className="text-xs text-base-content/70 leading-relaxed">
                {opp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
