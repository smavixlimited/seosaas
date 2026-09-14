import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getCompetitorAdsServerFn,
  exportAdAngleToRoadmapServerFn,
} from "@/serverFunctions/competitor-ads";
import { listBrandCompetitors } from "@/serverFunctions/brand-competitor";
import { FeatureUpgradeGate } from "@/client/components/billing/FeatureUpgradeGate";
import type {
  AdPlatform,
  CompetitorAdItem,
  CompetitorAdsOverviewResult,
} from "@/services/competitor-ads.service";

interface CompetitorAdLibraryProps {
  projectId: string;
  initialDomain?: string;
}

const PLATFORM_CONFIG: Record<
  AdPlatform | "all",
  { label: string; icon: string; badgeColor: string; description: string }
> = {
  all: {
    label: "All Networks",
    icon: "solar:layers-bold-duotone",
    badgeColor: "badge-primary",
    description:
      "Multi-platform intelligence aggregate across all 4 major ad channels",
  },
  meta: {
    label: "Meta (FB & IG)",
    icon: "logos:meta-icon",
    badgeColor: "badge-info",
    description:
      "Live Facebook & Instagram Ad Library feeds, creative copy, and image/video angles",
  },
  google: {
    label: "Google Search Ads",
    icon: "logos:google-icon",
    badgeColor: "badge-warning",
    description:
      "Live DataForSEO Google Search SERP ads, sitelinks, headline variations & bid terms",
  },
  tiktok: {
    label: "TikTok Ads",
    icon: "logos:tiktok-icon",
    badgeColor: "badge-neutral",
    description:
      "TikTok Creative Center inspiration, high-CTR hook scripts, and trending formats",
  },
  linkedin: {
    label: "LinkedIn Ads",
    icon: "logos:linkedin-icon",
    badgeColor: "badge-info",
    description:
      "B2B enterprise sponsored updates, whitepaper leads, and decision-maker angles",
  },
};

export function CompetitorAdLibrary({
  projectId,
  initialDomain = "",
}: CompetitorAdLibraryProps) {
  const queryClient = useQueryClient();

  const competitorsQuery = useQuery({
    queryKey: ["brandCompetitors", projectId],
    queryFn: () => listBrandCompetitors({ data: { projectId } }),
  });

  const savedCompetitors = competitorsQuery.data ?? [];

  const [selectedDomain, setSelectedDomain] = React.useState(initialDomain);
  const [selectedPlatform, setSelectedPlatform] = React.useState<
    AdPlatform | "all"
  >("all");
  const [selectedAngleFilter, setSelectedAngleFilter] =
    React.useState<string>("all");
  const [activeAdDetail, setActiveAdDetail] =
    React.useState<CompetitorAdItem | null>(null);

  React.useEffect(() => {
    if (initialDomain) {
      setSelectedDomain(initialDomain);
    } else if (savedCompetitors.length > 0 && !selectedDomain) {
      setSelectedDomain(savedCompetitors[0].domain);
    }
  }, [initialDomain, savedCompetitors, selectedDomain]);

  const cleanDomain = selectedDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");

  // Query ads
  const adsQuery = useQuery<CompetitorAdsOverviewResult>({
    queryKey: ["competitorAds", projectId, cleanDomain, selectedPlatform],
    queryFn: () =>
      getCompetitorAdsServerFn({
        data: {
          projectId,
          competitorDomain: cleanDomain,
          platform: selectedPlatform,
          forceRefresh: false,
        },
      }) as Promise<CompetitorAdsOverviewResult>,
    enabled: Boolean(cleanDomain),
  });

  const refreshMutation = useMutation({
    mutationFn: () =>
      getCompetitorAdsServerFn({
        data: {
          projectId,
          competitorDomain: cleanDomain,
          platform: selectedPlatform,
          forceRefresh: true,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["competitorAds", projectId, cleanDomain, selectedPlatform],
        data,
      );
      toast.success("Live ad scan completed!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to scan competitor ads");
    },
  });

  const exportRoadmapMutation = useMutation({
    mutationFn: (vars: {
      platform: string;
      suggestedHook: string;
      counterPlaySummary: string;
      recommendedCta?: string;
    }) =>
      exportAdAngleToRoadmapServerFn({
        data: {
          projectId,
          competitorDomain: cleanDomain,
          platform: vars.platform,
          suggestedHook: vars.suggestedHook,
          counterPlaySummary: vars.counterPlaySummary,
          recommendedCta: vars.recommendedCta,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["actionRoadmap", projectId],
      });
      toast.success("🚀 Strategic Ad Counter-Play exported to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to export task to roadmap");
    },
  });

  const adData = adsQuery.data;
  const adsList = adData?.ads ?? [];

  const filteredAds = React.useMemo(() => {
    return adsList.filter((ad) => {
      const matchesPlatform =
        selectedPlatform === "all" || ad.platform === selectedPlatform;
      const matchesAngle =
        selectedAngleFilter === "all" ||
        ad.angleCategory === selectedAngleFilter;
      return matchesPlatform && matchesAngle;
    });
  }, [adsList, selectedPlatform, selectedAngleFilter]);

  if (
    adsQuery.error &&
    (adsQuery.error.message?.includes("not available on your current plan") ||
      adsQuery.error.message?.includes("FORBIDDEN_PLAN_FEATURE") ||
      adsQuery.error.message?.includes("upgrade your plan"))
  ) {
    return (
      <FeatureUpgradeGate
        featureTitle="Competitor Ad Spying"
        featureDescription="Unlock full multi-network competitor ad copy intelligence across Google Search Ads, Meta, TikTok, and LinkedIn."
        requiredPlanName="Starter or Pro Plan"
        bullets={[
          "Live competitor search ads & sitelinks",
          "Creative copy, winning angles & longevity analysis",
          "Automated strategic counter-plays into Action Roadmap",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Competitor & Platform Selector Bar */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-warning badge-sm font-bold uppercase tracking-wider text-xs">
                Ad Intelligence
              </span>
              <span className="text-xs text-base-content/60 font-medium">
                No User Ad Account Required
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-base-content">
              Competitor Ad Library &amp; Angles
            </h2>
            <p className="text-xs text-base-content/70">
              Spy on active competitor ad copy, creative angles, winning
              longevity, and exploit their messaging blind spots.
            </p>
          </div>

          {/* Competitor Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="form-control min-w-[240px]">
              <label className="label py-1 text-xs font-bold text-base-content/70">
                Select Competitor
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="select select-bordered select-sm md:select-md rounded-2xl font-bold bg-base-100 border-base-300"
              >
                {savedCompetitors.length === 0 && (
                  <option value={cleanDomain || "competitor.com"}>
                    {cleanDomain || "Select competitor"}
                  </option>
                )}
                {savedCompetitors.map((c) => (
                  <option key={c.id} value={c.domain}>
                    {c.name ? `${c.name} (${c.domain})` : c.domain}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending || !cleanDomain}
                className="btn btn-sm md:btn-md btn-primary rounded-2xl font-bold gap-2 text-white shadow-md shadow-primary/20"
              >
                <Icon
                  icon="solar:radar-2-bold"
                  className={`h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
                />
                <span>
                  {refreshMutation.isPending
                    ? "Scanning..."
                    : "Scan Active Ads"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="pt-3 border-t border-base-200">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
              Filter by Platform:
            </span>
            <span className="text-xs text-base-content/50">
              {PLATFORM_CONFIG[selectedPlatform].description}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "meta", "google", "tiktok", "linkedin"] as const).map(
              (plat) => {
                const config = PLATFORM_CONFIG[plat];
                const isSelected = selectedPlatform === plat;
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSelectedPlatform(plat)}
                    className={`btn btn-sm rounded-xl font-bold gap-1.5 transition-all ${
                      isSelected
                        ? "btn-primary text-white shadow-sm"
                        : "btn-outline border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                    }`}
                  >
                    <Icon icon={config.icon} className="h-4 w-4 shrink-0" />
                    <span>{config.label}</span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Metrics Header Summary */}
      {adData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 md:p-5 rounded-2xl bg-base-100 border border-base-300 shadow-sm space-y-1">
            <div className="text-xs font-bold text-base-content/60">
              Total Ads Tracked
            </div>
            <div className="text-2xl font-black text-base-content">
              {adData.totalAdsFound}
            </div>
            <div className="text-xs text-base-content/60 flex items-center gap-1">
              <Icon
                icon="solar:shield-check-bold"
                className="h-3.5 w-3.5 text-primary"
              />
              <span>Across {adData.activePlatforms.length} networks</span>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-base-100 border border-base-300 shadow-sm space-y-1">
            <div className="text-xs font-bold text-base-content/60">
              Winning Ads (30+ Days)
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {adData.winningAdsCount}
            </div>
            <div className="text-xs text-emerald-600/80 font-medium">
              🔥 High-converting angles
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-base-100 border border-base-300 shadow-sm space-y-1">
            <div className="text-xs font-bold text-base-content/60">
              Dominant Ad Hook
            </div>
            <div className="text-lg font-black text-primary capitalize truncate">
              {adData.dominantAngle.replace("_", " ")}
            </div>
            <div className="text-xs text-base-content/60">
              Primary conversion focus
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-base-100 border border-base-300 shadow-sm space-y-1">
            <div className="text-xs font-bold text-base-content/60">
              Est. Monthly Ad Burn
            </div>
            <div className="text-2xl font-black text-base-content">
              {adData.estimatedMonthlyAdBurn}
            </div>
            <div className="text-xs text-base-content/60">
              Estimated paid footprint
            </div>
          </div>
        </div>
      )}

      {/* Ads Feed & Creative Cards */}
      {adsQuery.isLoading ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center space-y-3">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm font-bold text-base-content/70">
            Scanning live competitor ad networks...
          </p>
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm font-bold text-base-content flex items-center gap-2">
              <Icon icon="solar:flame-bold" className="h-4 w-4 text-warning" />
              <span>Active Competitor Creatives ({filteredAds.length})</span>
            </div>

            {/* Angle Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-base-content/60 font-semibold mr-1">
                Angle:
              </span>
              {(
                [
                  "all",
                  "problem_solution",
                  "social_proof",
                  "discount_offer",
                  "fomo",
                  "educational",
                ] as const
              ).map((ang) => (
                <button
                  key={ang}
                  type="button"
                  onClick={() => setSelectedAngleFilter(ang)}
                  className={`btn btn-xs rounded-lg font-bold capitalize ${
                    selectedAngleFilter === ang
                      ? "btn-neutral text-white"
                      : "btn-ghost text-base-content/70"
                  }`}
                >
                  {ang.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAds.map((ad) => {
              const platConfig = PLATFORM_CONFIG[ad.platform];
              return (
                <div
                  key={ad.id}
                  className="rounded-3xl border border-base-300 bg-base-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Top Bar of Card */}
                  <div className="p-4 border-b border-base-200 bg-base-200/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon icon={platConfig.icon} className="h-4 w-4" />
                      <span className="text-xs font-black text-base-content uppercase tracking-wider">
                        {ad.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ad.isWinningAd && (
                        <span className="badge badge-xs badge-success text-white font-bold gap-1 py-2 px-2">
                          <Icon icon="solar:fire-bold" className="h-3 w-3" />
                          <span>Winning Ad</span>
                        </span>
                      )}
                      <span className="badge badge-xs badge-outline font-semibold py-2 px-2">
                        {ad.estimatedActiveDays}d active
                      </span>
                    </div>
                  </div>

                  {/* Media Preview if image/video */}
                  {ad.mediaUrl && (
                    <div className="relative aspect-video bg-neutral/10 overflow-hidden group">
                      <img
                        src={ad.mediaUrl}
                        alt={ad.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {ad.mediaType === "video" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="size-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg">
                            <Icon
                              icon="solar:play-bold"
                              className="h-5 w-5 ml-0.5"
                            />
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className="badge badge-sm badge-neutral bg-black/75 text-white backdrop-blur-md font-bold capitalize">
                          {ad.angleCategory.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {!ad.mediaUrl && (
                        <div className="flex items-center gap-1.5">
                          <span className="badge badge-sm badge-neutral font-bold capitalize">
                            {ad.angleCategory.replace("_", " ")}
                          </span>
                          {ad.metadata?.targetKeywords && (
                            <span className="text-xs text-base-content/50 font-mono truncate max-w-[150px]">
                              {ad.metadata.targetKeywords[0]}
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-sm font-black text-base-content leading-snug line-clamp-2">
                        {ad.headline}
                      </h3>

                      <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
                        {ad.bodyCopy}
                      </p>

                      {/* Google Ad Sitelinks */}
                      {ad.metadata?.sitelinks &&
                        ad.metadata.sitelinks.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {ad.metadata.sitelinks.map((s, idx) => (
                              <span
                                key={idx}
                                className="badge badge-xs badge-ghost text-[10px] text-primary font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-base-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-base-content/60 flex items-center gap-1">
                        <Icon
                          icon="solar:cursor-bold"
                          className="h-3 w-3 text-primary"
                        />
                        <span>{ad.ctaType}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          exportRoadmapMutation.mutate({
                            platform: ad.platform,
                            suggestedHook: `Counter-angle to ${ad.headline}`,
                            counterPlaySummary: `Competitor is actively running this ad angle for ${ad.estimatedActiveDays} days with copy: "${ad.bodyCopy}". Deploy a superior value proposition targeting this audience.`,
                            recommendedCta: ad.ctaType,
                          })
                        }
                        disabled={exportRoadmapMutation.isPending}
                        className="btn btn-xs btn-outline btn-primary rounded-xl font-bold gap-1"
                        title="Export counter-angle to Action Roadmap"
                      >
                        <Icon icon="solar:rocket-bold" className="h-3 w-3" />
                        <span>Counter in Roadmap</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-8 md:p-12 text-center space-y-4">
          <div className="size-14 rounded-3xl bg-warning/10 text-warning flex items-center justify-center mx-auto">
            <Icon icon="solar:info-circle-bold" className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-base-content">
              No Active Ads Found on {PLATFORM_CONFIG[selectedPlatform].label}
            </h3>
            <p className="text-xs text-base-content/70">
              {cleanDomain} is currently not running ads on this specific
              network, or running unindexed dark posts.
            </p>
          </div>
        </div>
      )}

      {/* Untapped AI Opportunity Blueprint Section */}
      {adData?.opportunityBlueprint && (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary font-bold text-white text-xs">
                Opportunity Blueprint
              </span>
              <h3 className="text-lg font-black text-base-content">
                Untapped Ad Angles to Out-Convert {adData.competitorName}
              </h3>
            </div>
            <span className="text-xs text-base-content/60 font-medium">
              Generated from competitor landing page gaps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adData.opportunityBlueprint.strategicAngleRecommentations.map(
              (opp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-sm badge-outline font-bold uppercase text-xs">
                        {opp.platform} Attack Play
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {opp.targetAngle}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-base-content">
                      {opp.suggestedHook}
                    </h4>

                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {opp.counterPlaySummary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-base-content/60">
                      CTA: {opp.recommendedCta}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        exportRoadmapMutation.mutate({
                          platform: opp.platform,
                          suggestedHook: opp.suggestedHook,
                          counterPlaySummary: opp.counterPlaySummary,
                          recommendedCta: opp.recommendedCta,
                        })
                      }
                      className="btn btn-xs btn-primary rounded-xl font-bold gap-1 text-white"
                    >
                      <Icon
                        icon="solar:check-square-bold"
                        className="h-3 w-3"
                      />
                      <span>Add to Roadmap</span>
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
