import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ProjectMarketFields } from "@/client/features/projects/ProjectMarketFields";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  clearLastProjectId,
  getLastProjectId,
} from "@/client/lib/active-project";
import {
  archiveProject,
  getProjects,
  updateProject,
} from "@/serverFunctions/projects";
import {
  getBrandProfile,
  saveBrandProfile,
} from "@/serverFunctions/brand-competitor";
import {
  INDUSTRY_CATEGORIES,
  COMPANY_SIZES,
  Industry,
  CompanySize,
} from "@/config/industries";
import type { ProjectSummary } from "./types";

export function ProjectGeneralSettings({ projectId }: { projectId: string }) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const brandProfileQuery = useQuery({
    queryKey: ["brandProfile", projectId],
    queryFn: () => getBrandProfile({ data: { projectId } }),
  });

  const projects = projectsQuery.data ?? [];
  const project = projects.find((entry) => entry.id === projectId) ?? null;
  const brandProfile = brandProfileQuery.data ?? null;

  if (!project || brandProfileQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* key resets the form's local state when switching between projects */}
      <BrandSettingsForm
        key={`${project.id}_${brandProfile?.updatedAt || ""}`}
        project={project}
        brandProfile={brandProfile}
      />
      <DangerSection project={project} canArchive={projects.length > 1} />
    </div>
  );
}

function BrandSettingsForm({
  project,
  brandProfile,
}: {
  project: ProjectSummary;
  brandProfile: any;
}) {
  const queryClient = useQueryClient();

  // 1. Brand Identity & Market
  const [name, setName] = React.useState(
    brandProfile?.brandName || project.name || "",
  );
  const [domain, setDomain] = React.useState(
    project.domain ||
      (brandProfile?.websiteUrl
        ? brandProfile.websiteUrl.replace(/^https?:\/\//i, "").replace(/\/.*$/, "")
        : ""),
  );
  const [market, setMarket] = React.useState({
    locationCode: project.locationCode,
    languageCode: project.languageCode,
  });

  // 2. Business Profile & Positioning
  const [industry, setIndustry] = React.useState<Industry>(
    (brandProfile?.industry as Industry) || "SaaS / Software",
  );
  const [companySize, setCompanySize] = React.useState<CompanySize>(
    (brandProfile?.companySize as CompanySize) || "1-5",
  );
  const [brandDescription, setBrandDescription] = React.useState(
    brandProfile?.brandDescription || "",
  );
  const [valueProposition, setValueProposition] = React.useState(
    brandProfile?.valueProposition || "",
  );

  // 3. Official Social Links
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: brandProfile?.socialLinks?.instagram || "",
    linkedin: brandProfile?.socialLinks?.linkedin || "",
    twitter: brandProfile?.socialLinks?.twitter || "",
    facebook: brandProfile?.socialLinks?.facebook || "",
    youtube: brandProfile?.socialLinks?.youtube || "",
    tiktok: brandProfile?.socialLinks?.tiktok || "",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanDom = domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "");

      // 1. Update Project basic settings
      await updateProject({
        data: {
          projectId: project.id,
          name: name.trim() || project.name,
          domain: cleanDom || undefined,
          ...market,
        },
      });

      // 2. Update Brand Profile settings
      await saveBrandProfile({
        data: {
          projectId: project.id,
          brandName: name.trim(),
          websiteUrl: cleanDom ? `https://${cleanDom}` : undefined,
          industry,
          companySize,
          brandDescription: brandDescription.trim() || undefined,
          valueProposition: valueProposition.trim() || undefined,
          socialLinks: {
            instagram: socialLinks.instagram.trim() || undefined,
            linkedin: socialLinks.linkedin.trim() || undefined,
            twitter: socialLinks.twitter.trim() || undefined,
            facebook: socialLinks.facebook.trim() || undefined,
            youtube: socialLinks.youtube.trim() || undefined,
            tiktok: socialLinks.tiktok.trim() || undefined,
          },
        },
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["brandProfile", project.id] }),
      ]);
      toast.success("Brand settings saved successfully");
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to save brand settings"),
      );
    },
  });

  const isDirty =
    name.trim() !== (brandProfile?.brandName || project.name) ||
    domain.trim() !== (project.domain ?? "") ||
    market.locationCode !== project.locationCode ||
    market.languageCode !== project.languageCode ||
    industry !== ((brandProfile?.industry as Industry) || "SaaS / Software") ||
    companySize !== ((brandProfile?.companySize as CompanySize) || "1-5") ||
    brandDescription.trim() !== (brandProfile?.brandDescription || "") ||
    valueProposition.trim() !== (brandProfile?.valueProposition || "") ||
    socialLinks.instagram.trim() !== (brandProfile?.socialLinks?.instagram || "") ||
    socialLinks.linkedin.trim() !== (brandProfile?.socialLinks?.linkedin || "") ||
    socialLinks.twitter.trim() !== (brandProfile?.socialLinks?.twitter || "") ||
    socialLinks.facebook.trim() !== (brandProfile?.socialLinks?.facebook || "") ||
    socialLinks.youtube.trim() !== (brandProfile?.socialLinks?.youtube || "") ||
    socialLinks.tiktok.trim() !== (brandProfile?.socialLinks?.tiktok || "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (saveMutation.isPending) return;
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Identity & Domain */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
            Brand Identity &amp; Market
          </h2>
          <p className="text-xs text-base-content/50">
            Primary identifiers and default search market for your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
            <span>Brand Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="My Brand"
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
            <span>
              Domain <span className="text-base-content/50 font-normal">(e.g. example.com)</span>
            </span>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              maxLength={255}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <ProjectMarketFields value={market} onChange={setMarket} />
          <span className="text-xs text-base-content/50">
            Keyword, SERP, and domain data uses this country and language unless a call asks for a different one.
          </span>
        </div>
      </section>

      {/* 2. Business Profile & Positioning */}
      <section className="space-y-4 border-t border-base-300 pt-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
            Business Profile &amp; Positioning
          </h2>
          <p className="text-xs text-base-content/50">
            Used by Skorvia AI agents, audit models, and prompt generators to contextualize analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
            <span>Industry Sector</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="select select-bordered w-full rounded-2xl h-10 text-xs bg-base-100 text-base-content"
            >
              {Object.entries(INDUSTRY_CATEGORIES).map(([category, items]) => (
                <optgroup key={category} label={category} className="bg-base-100 text-base-content font-bold">
                  {items.map((ind) => (
                    <option key={ind} value={ind} className="bg-base-100 text-base-content font-normal">
                      {ind}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
            <span>Company Size</span>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as CompanySize)}
              className="select select-bordered w-full rounded-2xl h-10 text-xs bg-base-100 text-base-content"
            >
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size} className="bg-base-100 text-base-content">
                  {size} employees
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
          <span>Brand Description / Bio</span>
          <textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder="Brief overview of what your brand does, key services, and target audience..."
            rows={2}
            className="textarea textarea-bordered w-full rounded-2xl text-xs bg-base-200/40"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-base-content/80">
          <span>Value Proposition / USP</span>
          <textarea
            value={valueProposition}
            onChange={(e) => setValueProposition(e.target.value)}
            placeholder="Why customers choose your brand over alternatives (e.g. speed, pricing, reliability, proprietary tech)..."
            rows={2}
            className="textarea textarea-bordered w-full rounded-2xl text-xs bg-base-200/40"
          />
        </label>
      </section>

      {/* 3. Official Social Channels */}
      <section className="space-y-4 border-t border-base-300 pt-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
            Official Social Channels
          </h2>
          <p className="text-xs text-base-content/50">
            Enables multi-platform brand mention monitoring and social proof tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Instagram */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:camera-bold-duotone" className="h-4 w-4 text-pink-500" />
              Instagram
            </label>
            <input
              type="text"
              placeholder="instagram.com/yourbrand or @handle"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:buildings-2-bold-duotone" className="h-4 w-4 text-blue-600" />
              LinkedIn
            </label>
            <input
              type="text"
              placeholder="linkedin.com/company/yourbrand"
              value={socialLinks.linkedin}
              onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>

          {/* X / Twitter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:hashtag-bold-duotone" className="h-4 w-4 text-slate-800 dark:text-slate-200" />
              X (Twitter)
            </label>
            <input
              type="text"
              placeholder="x.com/yourbrand or @handle"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>

          {/* Facebook */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="h-4 w-4 text-blue-500" />
              Facebook
            </label>
            <input
              type="text"
              placeholder="facebook.com/yourbrand"
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:videocamera-bold-duotone" className="h-4 w-4 text-red-500" />
              YouTube
            </label>
            <input
              type="text"
              placeholder="youtube.com/@yourbrand"
              value={socialLinks.youtube}
              onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>

          {/* TikTok */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
              <Icon icon="solar:music-notes-bold-duotone" className="h-4 w-4 text-purple-500" />
              TikTok
            </label>
            <input
              type="text"
              placeholder="tiktok.com/@yourbrand"
              value={socialLinks.tiktok}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
              className="input input-bordered w-full rounded-2xl h-10 text-xs bg-base-200/40"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-base-300">
        <button
          type="submit"
          className="btn btn-primary btn-sm rounded-xl px-5 font-bold shadow-sm"
          disabled={saveMutation.isPending || !isDirty}
        >
          {saveMutation.isPending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function DangerSection({
  project,
  canArchive,
}: {
  project: ProjectSummary;
  canArchive: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = React.useState(false);

  const archiveMutation = useMutation({
    mutationFn: () => archiveProject({ data: { projectId: project.id } }),
    onSuccess: async () => {
      if (getLastProjectId() === project.id) clearLastProjectId();
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Brand archived");
      // Re-resolve to a remaining brand via the landing redirect.
      void navigate({ to: "/my-brands" });
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to archive brand")),
  });

  return (
    <section className="space-y-3 border-t border-base-300 pt-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
        Archive Brand
      </h2>

      {confirming ? (
        <div className="space-y-3">
          <p className="text-sm text-base-content/70">
            Archiving{" "}
            <span className="font-medium text-base-content">
              {project.name}
            </span>{" "}
            removes it from your workspace and stops its scheduled rank
            tracking. You can restore it later from the My Brands page.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-error btn-sm rounded-xl"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              Yes, archive brand
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-xl"
              onClick={() => setConfirming(false)}
              disabled={archiveMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-base-content/60">
            {canArchive
              ? "Archive this brand to remove it from your workspace."
              : "You can't archive your only brand."}
          </p>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm rounded-xl shrink-0"
            onClick={() => setConfirming(true)}
            disabled={!canArchive}
          >
            Archive Brand
          </button>
        </div>
      )}
    </section>
  );
}
