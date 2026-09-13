import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";
import {
  INDUSTRIES,
  INDUSTRY_CATEGORIES,
  COMPANY_SIZES,
  TARGET_COUNTRIES,
  Industry,
  CompanySize,
} from "@/config/industries";
import { completeBrandOnboarding } from "@/serverFunctions/brand-competitor";

interface SkorviaOnboardingWizardProps {
  projectId: string;
  userEmail?: string;
  userName?: string;
  initialDomain?: string;
}

interface CompetitorFormItem {
  domain: string;
  name: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  notes: string;
}

export function SkorviaOnboardingWizard({
  projectId,
  userEmail,
  userName,
  initialDomain = "",
}: SkorviaOnboardingWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Step 1: Business Profile
  const [brandName, setBrandName] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState(initialDomain);
  const [industry, setIndustry] = React.useState<Industry>("SaaS / Software");
  const [companySize, setCompanySize] = React.useState<CompanySize>("1-5");
  const [targetCountry, setTargetCountry] = React.useState("US");

  // Step 2: Social Presence
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  });

  // Step 3: Competitor Directory (up to 3)
  const [competitors, setCompetitors] = React.useState<CompetitorFormItem[]>([
    {
      domain: "",
      name: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      notes: "",
    },
  ]);
  const [expandedCompetitorIdx, setExpandedCompetitorIdx] = React.useState<
    number | null
  >(0);

  // Suggested competitors
  const competitorSuggestions = [
    { name: "Semrush", domain: "semrush.com" },
    { name: "Ahrefs", domain: "ahrefs.com" },
    { name: "Moz Pro", domain: "moz.com" },
    { name: "SE Ranking", domain: "seranking.com" },
    { name: "SpyFu", domain: "spyfu.com" },
  ];

  const cleanDomain = (d: string) =>
    d
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/.*$/, "");

  const completeMutation = useMutation({
    mutationFn: async (
      targetDestination: "dashboard" | "brand-analysis" | "competitor-analysis",
    ) => {
      const validCompetitors = competitors
        .filter((c) => c.domain.trim().length > 0)
        .map((c) => ({
          domain: cleanDomain(c.domain),
          name: c.name.trim() || cleanDomain(c.domain),
          websiteUrl: `https://${cleanDomain(c.domain)}`,
          socialHandles: {
            instagram: c.instagram.trim() || undefined,
            linkedin: c.linkedin.trim() || undefined,
            twitter: c.twitter.trim() || undefined,
            facebook: c.facebook.trim() || undefined,
          },
          notes: c.notes.trim() || undefined,
        }));

      const cleanSite = cleanDomain(websiteUrl);

      const result = await completeBrandOnboarding({
        data: {
          projectId,
          brand: {
            projectId,
            brandName:
              brandName.trim() ||
              (cleanSite ? cleanSite.split(".")[0] : "My Brand"),
            websiteUrl: cleanSite ? `https://${cleanSite}` : undefined,
            industry,
            companySize,
            targetCountry,
            socialLinks: {
              instagram: socialLinks.instagram.trim() || undefined,
              linkedin: socialLinks.linkedin.trim() || undefined,
              twitter: socialLinks.twitter.trim() || undefined,
              facebook: socialLinks.facebook.trim() || undefined,
              youtube: socialLinks.youtube.trim() || undefined,
              tiktok: socialLinks.tiktok.trim() || undefined,
            },
          },
          competitorsList: validCompetitors,
        },
      });

      return {
        target: targetDestination,
        projectId: result.projectId,
      };
    },
    onSuccess: ({ target, projectId: finalProjectId }) => {
      void queryClient.invalidateQueries({ queryKey: ["onboardingAnswers"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({
        queryKey: ["brandProfile", finalProjectId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["brandCompetitors", finalProjectId],
      });

      toast.success("Brand setup saved successfully!");

      if (target === "brand-analysis") {
        void navigate({
          to: "/p/$projectId/brand-analysis",
          params: { projectId: finalProjectId },
        });
      } else if (target === "competitor-analysis") {
        void navigate({
          to: "/p/$projectId/competitors",
          params: { projectId: finalProjectId },
        });
      } else {
        void navigate({ to: "/p/$projectId", params: { projectId: finalProjectId } });
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to finalize setup.",
      );
    },
  });

  const handleNextStep1 = () => {
    if (websiteUrl.trim() && !cleanDomain(websiteUrl)) {
      toast.error("Please enter a valid website domain");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleNextStep3 = () => {
    setStep(4);
  };

  const addCompetitor = (name: string, domain: string) => {
    const cleaned = cleanDomain(domain);
    if (!cleaned) return;
    if (competitors.some((c) => cleanDomain(c.domain) === cleaned)) return;

    if (competitors.length === 1 && !competitors[0].domain) {
      setCompetitors([
        {
          domain: cleaned,
          name,
          instagram: "",
          linkedin: "",
          twitter: "",
          facebook: "",
          notes: "",
        },
      ]);
      return;
    }

    if (competitors.length < 3) {
      setCompetitors((prev) => [
        ...prev,
        {
          domain: cleaned,
          name,
          instagram: "",
          linkedin: "",
          twitter: "",
          facebook: "",
          notes: "",
        },
      ]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-6 md:p-10 shadow-2xl space-y-6 overflow-hidden">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="h-8 w-8 rounded-xl object-contain ring-1 ring-primary/20 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-black tracking-tight text-base-content block truncate">
                {BRAND_CONFIG.name} Brand Onboarding
              </span>
              <span className="text-[10px] sm:text-[11px] text-base-content/60 font-medium block truncate">
                Tailored AI Visibility & Competitor Setup
              </span>
            </div>
          </div>
          <span className="badge badge-primary badge-sm font-black rounded-lg text-xs shrink-0">
            Step {step} of 4
          </span>
        </div>

        {/* Step Indicator Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { num: 1, label: "Business", icon: "solar:shop-2-bold-duotone" },
            {
              num: 2,
              label: "Social",
              icon: "solar:share-circle-bold-duotone",
            },
            {
              num: 3,
              label: "Competitors",
              icon: "solar:users-group-two-rounded-bold-duotone",
            },
            { num: 4, label: "Launch", icon: "solar:rocket-bold-duotone" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-xs font-bold transition-all ${
                step === s.num
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : step > s.num
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-base-200/60 text-base-content/40"
              }`}
            >
              <Icon icon={s.icon} className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline truncate">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: Business Profile (Domain, Industry, Company Size, Target Market)  */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-base-content tracking-tight">
                Tell us about your brand
              </h2>
              <p className="text-xs text-base-content/60">
                We calibrate SEO, conversion benchmarks, and brand scoring based
                on your industry and market.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-base-content/50 hover:text-primary transition-colors shrink-0"
            >
              Skip step &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {/* Brand Name & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-base-content/80">
                  Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="input input-bordered w-full rounded-2xl h-11 text-xs focus:border-primary bg-base-200/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-base-content/80">
                  Website URL / Domain
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-base-content/40">
                    https://
                  </span>
                  <input
                    type="text"
                    placeholder="acmegrowth.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="input input-bordered w-full rounded-2xl h-11 pl-18 text-xs font-medium focus:border-primary bg-base-200/40"
                  />
                </div>
              </div>
            </div>

            {/* Industry Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/80">
                Industry / Niche
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as Industry)}
                  className="select select-bordered w-full rounded-2xl h-12 text-xs font-semibold focus:border-primary bg-base-100 text-base-content dark:bg-slate-900 dark:text-white border-base-300 shadow-xs pl-3 pr-10"
                >
                  {Object.entries(INDUSTRY_CATEGORIES).map(([category, items]) => (
                    <optgroup
                      key={category}
                      label={category}
                      className="bg-base-200 text-base-content font-bold dark:bg-slate-800 dark:text-slate-200"
                    >
                      {items.map((ind) => (
                        <option
                          key={ind}
                          value={ind}
                          className="bg-base-100 text-base-content font-medium py-1.5 dark:bg-slate-900 dark:text-white"
                        >
                          {ind}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/80">
                Company Size (Employees)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COMPANY_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCompanySize(size)}
                    className={`btn h-10 min-h-0 rounded-2xl text-xs font-bold border transition-all ${
                      companySize === size
                        ? "btn-primary text-white shadow-sm"
                        : "btn-outline border-base-300 bg-base-100 hover:bg-base-200 text-base-content"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/80">
                Primary Target Market / Country
              </label>
              <div className="relative">
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="select select-bordered w-full rounded-2xl h-12 text-xs font-semibold focus:border-primary bg-base-100 text-base-content dark:bg-slate-900 dark:text-white border-base-300 shadow-xs pl-3 pr-10"
                >
                  {TARGET_COUNTRIES.map((cty) => (
                    <option
                      key={cty.code}
                      value={cty.code}
                      className="bg-base-100 text-base-content font-medium py-1.5 dark:bg-slate-900 dark:text-white"
                    >
                      {cty.flag} {cty.name} ({cty.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs text-base-content/60"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleNextStep1}
              className="btn btn-primary rounded-2xl px-6 h-11 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2"
            >
              <span>Next: Social Handles</span>
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Social Media Handles                                              */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-base-content tracking-tight">
                Connect your social handles
              </h2>
              <p className="text-xs text-base-content/60">
                We monitor cross-channel brand mentions, sentiment trust scores,
                and market reputation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs font-bold text-base-content/50 hover:text-primary transition-colors shrink-0"
            >
              Skip step &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Instagram */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:camera-bold-duotone"
                  className="h-4 w-4 text-pink-500"
                />
                Instagram Profile
              </label>
              <input
                type="text"
                placeholder="instagram.com/yourbrand or @handle"
                value={socialLinks.instagram}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:case-bold-duotone"
                  className="h-4 w-4 text-blue-600"
                />
                LinkedIn Company Page
              </label>
              <input
                type="text"
                placeholder="linkedin.com/company/yourbrand"
                value={socialLinks.linkedin}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>

            {/* X / Twitter */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:hashtag-bold-duotone"
                  className="h-4 w-4 text-slate-800 dark:text-slate-200"
                />
                X (Twitter) Profile
              </label>
              <input
                type="text"
                placeholder="x.com/yourbrand or @handle"
                value={socialLinks.twitter}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>

            {/* Facebook */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="h-4 w-4 text-blue-500"
                />
                Facebook Page
              </label>
              <input
                type="text"
                placeholder="facebook.com/yourbrand"
                value={socialLinks.facebook}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, facebook: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>

            {/* YouTube */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:videocamera-bold-duotone"
                  className="h-4 w-4 text-red-500"
                />
                YouTube Channel
              </label>
              <input
                type="text"
                placeholder="youtube.com/@yourbrand"
                value={socialLinks.youtube}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, youtube: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <Icon
                  icon="solar:music-notes-bold-duotone"
                  className="h-4 w-4 text-purple-500"
                />
                TikTok Handle
              </label>
              <input
                type="text"
                placeholder="tiktok.com/@yourbrand"
                value={socialLinks.tiktok}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, tiktok: e.target.value })
                }
                className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-ghost btn-sm rounded-xl font-bold text-xs text-base-content/60"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="btn btn-primary rounded-2xl px-6 h-11 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2"
              >
                <span>Next: Competitors</span>
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Competitor Directory (Up to 3 Competitors + Social Handles)        */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-base-content tracking-tight">
                Add up to 3 competitors
              </h2>
              <p className="text-xs text-base-content/60">
                These competitors will be saved in your Competitor Directory for
                ongoing keyword overlap, ad analysis, and share of voice
                tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="text-xs font-bold text-base-content/50 hover:text-primary transition-colors shrink-0"
            >
              Skip step &rarr;
            </button>
          </div>

          {/* Competitor Cards */}
          <div className="space-y-3">
            {competitors.map((comp, idx) => {
              const isExpanded = expandedCompetitorIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-base-300 bg-base-200/30 p-4 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm badge-neutral font-bold rounded-lg">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-base-content">
                        {comp.name || comp.domain || `Competitor ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCompetitorIdx(isExpanded ? null : idx)
                        }
                        className="btn btn-ghost btn-xs rounded-lg text-primary font-bold gap-1"
                      >
                        <Icon
                          icon={
                            isExpanded
                              ? "solar:alt-arrow-up-linear"
                              : "solar:alt-arrow-down-linear"
                          }
                          className="h-3.5 w-3.5"
                        />
                        {isExpanded ? "Collapse" : "Add Socials"}
                      </button>

                      {competitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCompetitors((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          className="btn btn-ghost btn-xs text-error p-1"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-bold"
                            className="h-3.5 w-3.5"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        placeholder="Website Domain (e.g. rival.com)"
                        value={comp.domain}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].domain = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-sm w-full rounded-xl text-xs bg-base-100"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Company Name (Optional)"
                        value={comp.name}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].name = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-sm w-full rounded-xl text-xs bg-base-100"
                      />
                    </div>
                  </div>

                  {/* Expandable Social Handles */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-base-300/60 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        placeholder="Instagram URL / Handle"
                        value={comp.instagram}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].instagram = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-xs w-full rounded-lg text-[11px] bg-base-100"
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn Company URL"
                        value={comp.linkedin}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].linkedin = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-xs w-full rounded-lg text-[11px] bg-base-100"
                      />
                      <input
                        type="text"
                        placeholder="X / Twitter Handle"
                        value={comp.twitter}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].twitter = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-xs w-full rounded-lg text-[11px] bg-base-100"
                      />
                      <input
                        type="text"
                        placeholder="Facebook Page URL"
                        value={comp.facebook}
                        onChange={(e) => {
                          const next = [...competitors];
                          next[idx].facebook = e.target.value;
                          setCompetitors(next);
                        }}
                        className="input input-bordered input-xs w-full rounded-lg text-[11px] bg-base-100"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {competitors.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setCompetitors((prev) => [
                    ...prev,
                    {
                      domain: "",
                      name: "",
                      instagram: "",
                      linkedin: "",
                      twitter: "",
                      facebook: "",
                      notes: "",
                    },
                  ]);
                  setExpandedCompetitorIdx(competitors.length);
                }}
                className="btn btn-outline btn-sm w-full rounded-2xl border-dashed border-base-300 text-xs font-bold text-primary gap-1.5"
              >
                <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
                <span>Add Another Competitor ({competitors.length}/3)</span>
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="rounded-2xl bg-base-200/50 p-3.5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
              Popular Competitor Shortcuts
            </span>
            <div className="flex flex-wrap gap-2">
              {competitorSuggestions.map((sug) => (
                <button
                  key={sug.domain}
                  type="button"
                  onClick={() => addCompetitor(sug.name, sug.domain)}
                  className="badge badge-outline badge-sm rounded-lg hover:badge-primary transition-colors cursor-pointer py-2.5 px-3 text-xs"
                >
                  + {sug.name} ({sug.domain})
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn btn-ghost btn-sm rounded-xl font-bold text-xs text-base-content/60"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNextStep3}
                className="btn btn-primary rounded-2xl px-6 h-11 font-bold text-xs text-white shadow-md shadow-primary/20 gap-2"
              >
                <span>Next: Launch Pad</span>
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Launch Pad (Choose Next Action)                                    */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-md shadow-emerald-500/10 ring-4 ring-emerald-500/20">
              <Icon
                icon="solar:check-circle-bold-duotone"
                className="h-8 w-8"
              />
            </div>
            <h2 className="text-2xl font-black text-base-content tracking-tight">
              Your Brand is Ready to Launch!
            </h2>
            <p className="text-xs text-base-content/60 max-w-md mx-auto">
              Choose your primary starting action. All saved competitors and
              brand data are stored in your database.
            </p>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-base-200/50 p-3 text-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                Brand
              </span>
              <span className="font-extrabold text-base-content truncate block">
                {brandName || websiteUrl || "My Brand"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                Industry
              </span>
              <span className="font-extrabold text-primary truncate block">
                {industry}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                Competitors
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">
                {competitors.filter((c) => c.domain.trim()).length} Saved
              </span>
            </div>
          </div>

          {/* 3 Action Launch Cards */}
          <div className="space-y-3">
            {/* Action 1: Go to Main Dashboard */}
            <button
              type="button"
              disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate("dashboard")}
              className="w-full text-left rounded-2xl border-2 border-base-300 hover:border-primary bg-base-100 hover:bg-primary/5 p-4.5 transition-all group flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon
                    icon="solar:chart-square-bold-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <div className="text-sm font-black text-base-content group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Go to Dashboard</span>
                    <span className="badge badge-primary badge-xs font-bold">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 font-medium">
                    Explore your main overview, executive KPIs, score trends,
                    and quick health meters.
                  </p>
                </div>
              </div>
              <Icon
                icon="solar:arrow-right-linear"
                className="h-5 w-5 text-base-content/40 group-hover:text-primary transition-colors shrink-0"
              />
            </button>

            {/* Action 2: Run Brand Analysis */}
            <button
              type="button"
              disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate("brand-analysis")}
              className="w-full text-left rounded-2xl border-2 border-base-300 hover:border-emerald-500 bg-base-100 hover:bg-emerald-500/5 p-4.5 transition-all group flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon
                    icon="solar:shield-check-bold-duotone"
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <div className="text-sm font-black text-base-content group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span>Run Brand Analysis</span>
                    <span className="badge badge-success badge-xs text-white font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 font-medium">
                    Perform a full 6-dimension credibility, trust signals, and
                    conversion ad-readiness audit.
                  </p>
                </div>
              </div>
              <Icon
                icon="solar:arrow-right-linear"
                className="h-5 w-5 text-base-content/40 group-hover:text-emerald-600 transition-colors shrink-0"
              />
            </button>

            {/* Action 3: Run Competitor Analysis */}
            <button
              type="button"
              disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate("competitor-analysis")}
              className="w-full text-left rounded-2xl border-2 border-base-300 hover:border-indigo-500 bg-base-100 hover:bg-indigo-500/5 p-4.5 transition-all group flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon icon="solar:swords-bold-duotone" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-base-content group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <span>Run Competitor Analysis</span>
                    <span className="badge badge-secondary badge-xs font-bold">
                      Deep Dive
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 font-medium">
                    Analyze ranking overlap, paid ad keywords, content gaps, and
                    traffic shares vs competitors.
                  </p>
                </div>
              </div>
              <Icon
                icon="solar:arrow-right-linear"
                className="h-5 w-5 text-base-content/40 group-hover:text-indigo-600 transition-colors shrink-0"
              />
            </button>
          </div>

          {completeMutation.isPending && (
            <div className="text-center py-2">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-xs text-base-content/60 font-medium mt-1">
                Configuring brand workspace...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
