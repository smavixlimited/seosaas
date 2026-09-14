import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { setLastProjectId } from "@/client/lib/active-project";
import {
  DEFAULT_LOCATION_CODE,
  getLanguageCode,
} from "@/client/features/keywords/locations";
import { ProjectMarketFields } from "@/client/features/projects/ProjectMarketFields";
import { createProject } from "@/serverFunctions/projects";
import { updateProjectContext } from "@/serverFunctions/projectContext";

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [audience, setAudience] = React.useState("");
  const [usp, setUsp] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [facebook, setFacebook] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [youtube, setYoutube] = React.useState("");
  const [tiktok, setTiktok] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const [market, setMarket] = React.useState({
    locationCode: DEFAULT_LOCATION_CODE,
    languageCode: getLanguageCode(DEFAULT_LOCATION_CODE),
  });

  React.useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createProject({
        data: {
          name: name.trim(),
          domain: domain.trim() || undefined,
          ...market,
        },
      });

      const socialProfiles = [
        twitter ? `Twitter/X: ${twitter.trim()}` : null,
        linkedin ? `LinkedIn: ${linkedin.trim()}` : null,
        facebook ? `Facebook: ${facebook.trim()}` : null,
        instagram ? `Instagram: ${instagram.trim()}` : null,
        youtube ? `YouTube: ${youtube.trim()}` : null,
        tiktok ? `TikTok: ${tiktok.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      if (industry || audience || usp || socialProfiles) {
        try {
          const overviewText = [
            industry ? `Industry/Niche: ${industry}` : null,
            audience ? `Target Audience (ICP): ${audience}` : null,
            socialProfiles ? `Social Profiles:\n${socialProfiles}` : null,
          ]
            .filter(Boolean)
            .join("\n\n");

          const updatesList = [];
          if (overviewText) {
            updatesList.push({
              section: "business_overview" as const,
              content: overviewText,
            });
          }
          if (usp) {
            updatesList.push({ section: "positioning" as const, content: usp });
          }

          if (updatesList.length > 0) {
            await updateProjectContext({
              data: {
                projectId: created.id,
                updates: updatesList,
              },
            });
          }
        } catch (e) {
          console.warn("Failed to set initial brand context:", e);
        }
      }

      return created;
    },
    onSuccess: async (created) => {
      setLastProjectId(created.id);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
      toast.success("Brand created successfully!");
      void navigate({
        to: "/p/$projectId",
        params: { projectId: created.id },
      });
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to create brand")),
  });

  const isPending = createMutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending) return;
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    createMutation.mutate();
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-brand-modal-title"
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-base-100 rounded-3xl shadow-2xl border border-base-300/80 overflow-hidden flex flex-col my-auto transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-base-200/80 bg-base-200/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-xs ring-1 ring-primary/20">
              <Icon icon="solar:shop-2-bold-duotone" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="create-brand-modal-title"
                  className="text-base sm:text-lg font-black tracking-tight text-base-content"
                >
                  Create New Brand Workspace
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                  New Project
                </span>
              </div>
              <p className="text-xs text-base-content/60">
                Configure SEO crawling, rankings, and intelligence for this
                brand.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-base-content hover:bg-base-200"
            aria-label="Close modal"
          >
            <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
            {/* Brand Name & Domain */}
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-xs text-base-content flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      icon="solar:tag-bold-duotone"
                      className="h-3.5 w-3.5 text-primary"
                    />
                    <span>Brand / Business Name</span>
                    <span className="text-error">*</span>
                  </span>
                  <span className="text-[11px] text-base-content/40 font-normal">
                    Required
                  </span>
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Stripe, Acme Corp, Zenith Dental"
                  maxLength={120}
                  autoFocus
                  className="input input-bordered h-11 rounded-xl w-full text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-base-content/50">
                  The primary name used across audit reports, ranking cards, and
                  PDF exports.
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-bold text-xs text-base-content flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Icon
                      icon="solar:global-bold-duotone"
                      className="h-3.5 w-3.5 text-emerald-500"
                    />
                    <span>Website Domain / URL</span>
                  </span>
                  <span className="text-[11px] text-base-content/40 font-normal">
                    Recommended
                  </span>
                </span>
                <input
                  type="text"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="e.g. stripe.com or https://stripe.com"
                  maxLength={255}
                  className="input input-bordered h-11 rounded-xl w-full text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-base-content/50">
                  Target domain for automated site audits, health monitoring,
                  and SERP positions.
                </span>
              </label>
            </div>

            {/* Target Location & Language */}
            <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-base-content">
                <Icon
                  icon="solar:map-point-bold-duotone"
                  className="h-4 w-4 text-indigo-500"
                />
                <span>Target Search Location &amp; Language</span>
              </div>
              <p className="text-[11px] text-base-content/60">
                Used to calculate search volume, keyword difficulty, and
                regional Google SERP rankings.
              </p>
              <ProjectMarketFields value={market} onChange={setMarket} />
            </div>

            {/* Optional AI Context Collapsible */}
            <div className="rounded-2xl border border-base-200 bg-base-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-base-content hover:bg-base-200/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:magic-stick-3-bold-duotone"
                    className="h-4 w-4 text-purple-500"
                  />
                  <span>Strategic Brand &amp; AI Context</span>
                  <span className="text-[10px] text-base-content/50 font-normal">
                    (Optional)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span>{showAdvanced ? "Hide Details" : "Add Context"}</span>
                  <Icon
                    icon={
                      showAdvanced
                        ? "solar:alt-arrow-up-bold"
                        : "solar:alt-arrow-down-bold"
                    }
                    className="h-3 w-3"
                  />
                </div>
              </button>

              {showAdvanced && (
                <div className="p-4 pt-1 border-t border-base-200 space-y-3.5 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-base-content/80">
                        Industry / Niche
                      </span>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. B2B SaaS, E-commerce"
                        className="input input-bordered h-9 rounded-lg w-full text-xs"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-base-content/80">
                        Target Audience (ICP)
                      </span>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="e.g. Marketing teams, homeowners"
                        className="input input-bordered h-9 rounded-lg w-full text-xs"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex flex-col gap-1">
                      <span className="font-bold text-base-content/80">
                        Unique Value Proposition (USP)
                      </span>
                      <input
                        type="text"
                        value={usp}
                        onChange={(e) => setUsp(e.target.value)}
                        placeholder="e.g. 10x faster deployment for enterprise engineering teams"
                        className="input input-bordered h-9 rounded-lg w-full text-xs"
                      />
                    </label>
                  </div>

                  {/* Dedicated Social Media Inputs */}
                  <div className="space-y-2 pt-1 border-t border-base-200">
                    <span className="font-bold text-base-content/80 text-[11px] uppercase tracking-wider block">
                      Brand Social Media Profiles
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon
                            icon="ri:twitter-x-fill"
                            className="h-3 w-3 text-base-content"
                          />
                          <span>Twitter / X</span>
                        </span>
                        <input
                          type="text"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="x.com/yourbrand or @handle"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon
                            icon="logos:linkedin-icon"
                            className="h-3 w-3"
                          />
                          <span>LinkedIn</span>
                        </span>
                        <input
                          type="text"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="linkedin.com/company/yourbrand"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon icon="logos:facebook" className="h-3 w-3" />
                          <span>Facebook</span>
                        </span>
                        <input
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="facebook.com/yourbrand"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon
                            icon="logos:instagram-icon"
                            className="h-3 w-3"
                          />
                          <span>Instagram</span>
                        </span>
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="instagram.com/yourbrand"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon icon="logos:youtube-icon" className="h-3 w-3" />
                          <span>YouTube</span>
                        </span>
                        <input
                          type="text"
                          value={youtube}
                          onChange={(e) => setYoutube(e.target.value)}
                          placeholder="youtube.com/@yourbrand"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-base-content/70 flex items-center gap-1.5">
                          <Icon icon="logos:tiktok-icon" className="h-3 w-3" />
                          <span>TikTok</span>
                        </span>
                        <input
                          type="text"
                          value={tiktok}
                          onChange={(e) => setTiktok(e.target.value)}
                          placeholder="tiktok.com/@yourbrand"
                          className="input input-bordered h-8.5 rounded-lg w-full text-xs font-mono"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-base-200/80 bg-base-200/30 flex items-center justify-between">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl font-bold px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="btn btn-sm btn-primary rounded-xl px-6 font-bold text-white shadow-md shadow-primary/20 gap-2 transition-all hover:shadow-lg"
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Creating Brand...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
                  <span>Create Brand Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
