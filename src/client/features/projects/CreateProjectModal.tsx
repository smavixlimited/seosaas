import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Modal } from "@/client/components/Modal";
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
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [audience, setAudience] = React.useState("");
  const [socialLinks, setSocialLinks] = React.useState("");
  const [usp, setUsp] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const [market, setMarket] = React.useState({
    locationCode: DEFAULT_LOCATION_CODE,
    languageCode: getLanguageCode(DEFAULT_LOCATION_CODE),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createProject({
        data: {
          name: name.trim(),
          domain: domain.trim() || undefined,
          ...market,
        },
      });

      // Enrich brand context if provided
      if (industry || audience || usp || socialLinks) {
        try {
          const overviewText = [
            industry ? `Industry/Niche: ${industry}` : null,
            audience ? `Target Audience (ICP): ${audience}` : null,
            socialLinks ? `Social Profiles: ${socialLinks}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          const updatesList = [];
          if (overviewText) {
            updatesList.push({ section: "business_overview" as const, content: overviewText });
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

  return (
    <Modal
      maxWidth="max-w-lg"
      onClose={isPending ? undefined : onClose}
      labelledBy="create-brand-title"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between border-b border-base-300 pb-3">
          <div>
            <h2 id="create-brand-title" className="text-lg font-black text-base-content flex items-center gap-2">
              <Icon icon="solar:shop-2-bold" className="h-5 w-5 text-primary" />
              <span>Create New Brand</span>
            </h2>
            <p className="text-xs text-base-content/60">
              Configure brand identity, website, target market, and audience for Skorvia AI.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="font-bold text-base-content">Brand / Business Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Stripe, Acme Corp, Apex Dental"
              maxLength={120}
              autoFocus
              className="input input-bordered input-sm rounded-xl w-full text-xs font-semibold"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-bold text-base-content">
              Brand Website <span className="text-base-content/50 font-normal">(optional)</span>
            </span>
            <input
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="e.g. stripe.com or https://stripe.com"
              maxLength={255}
              className="input input-bordered input-sm rounded-xl w-full text-xs font-mono"
            />
          </label>

          <ProjectMarketFields value={market} onChange={setMarket} />

          {/* Toggle Brand Context Details */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn btn-ghost btn-xs font-bold text-primary gap-1 p-0 hover:bg-transparent"
            >
              <Icon icon={showAdvanced ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} className="h-3.5 w-3.5" />
              <span>{showAdvanced ? "Hide Brand Details" : "+ Add Socials, ICP & Value Proposition"}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 p-4 rounded-2xl bg-base-200/50 border border-base-300 animate-in fade-in duration-100">
              <label className="flex flex-col gap-1">
                <span className="font-bold text-base-content">Industry / Business Niche</span>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. B2B SaaS, Cosmetic Dentistry, Fintech"
                  className="input input-bordered input-xs rounded-lg w-full text-xs"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-base-content">Target Audience / Ideal Customer Profile (ICP)</span>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Startup founders, high-earning homeowners in Austin"
                  className="input input-bordered input-xs rounded-lg w-full text-xs"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-base-content">Unique Value Proposition (USP)</span>
                <input
                  type="text"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  placeholder="e.g. Instant payouts with 99.99% uptime and zero hidden fees"
                  className="input input-bordered input-xs rounded-lg w-full text-xs"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-bold text-base-content">Social Media &amp; Profiles</span>
                <input
                  type="text"
                  value={socialLinks}
                  onChange={(e) => setSocialLinks(e.target.value)}
                  placeholder="e.g. twitter.com/stripe, linkedin.com/company/stripe"
                  className="input input-bordered input-xs rounded-lg w-full text-xs"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-300">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="btn btn-sm btn-primary rounded-xl px-5 font-bold text-white shadow-md shadow-primary/20 gap-1.5"
          >
            <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
            <span>{isPending ? "Creating Brand..." : "Create Brand"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
