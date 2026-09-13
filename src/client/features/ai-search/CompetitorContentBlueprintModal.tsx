import * as React from "react";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateCompetitorBlueprintServerFn } from "@/serverFunctions/firecrawl";
import type { CompetitorContentBlueprintResult } from "@/services/firecrawl.service";

interface CompetitorContentBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultKeyword?: string;
  defaultCompetitorUrls?: string[];
}

export function CompetitorContentBlueprintModal({
  isOpen,
  onClose,
  projectId,
  defaultKeyword = "enterprise seo platform",
  defaultCompetitorUrls = [],
}: CompetitorContentBlueprintModalProps) {
  const [keyword, setKeyword] = React.useState(defaultKeyword);
  const [competitor1, setCompetitor1] = React.useState(
    defaultCompetitorUrls[0] || "https://ahrefs.com",
  );
  const [competitor2, setCompetitor2] = React.useState(
    defaultCompetitorUrls[1] || "https://moz.com",
  );
  const [blueprint, setBlueprint] =
    React.useState<CompetitorContentBlueprintResult | null>(null);

  React.useEffect(() => {
    if (defaultKeyword) setKeyword(defaultKeyword);
    if (defaultCompetitorUrls[0]) setCompetitor1(defaultCompetitorUrls[0]);
    if (defaultCompetitorUrls[1]) setCompetitor2(defaultCompetitorUrls[1]);
  }, [defaultKeyword, defaultCompetitorUrls]);

  const blueprintMutation = useMutation({
    mutationFn: async () => {
      const urls = [competitor1.trim(), competitor2.trim()].filter(Boolean);
      if (urls.length === 0)
        throw new Error("At least one competitor URL is required");

      return await generateCompetitorBlueprintServerFn({
        data: {
          projectId,
          targetKeyword: keyword.trim(),
          competitorUrls: urls,
        },
      });
    },
    onSuccess: (data) => {
      setBlueprint(data);
      toast.success("Competitor blueprint generated successfully!");
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to analyze competitors",
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 px-6 py-4 bg-base-200/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Icon icon="solar:bolt-bold" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-base-content">
                1-Click Competitor Content Blueprint &amp; Gap Dissection
              </h3>
              <p className="text-[11px] text-base-content/60">
                Scrapes top-ranking competitor pages to reverse-engineer their
                content structure and schemas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content"
          >
            <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Controls */}
          <div className="p-4 rounded-2xl border border-base-300 bg-base-200/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                Target Keyword / Topic
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. b2b saas billing"
                className="input input-sm input-bordered w-full rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                Competitor 1 URL
              </label>
              <input
                type="text"
                value={competitor1}
                onChange={(e) => setCompetitor1(e.target.value)}
                placeholder="https://rival1.com/guide"
                className="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                Competitor 2 URL
              </label>
              <input
                type="text"
                value={competitor2}
                onChange={(e) => setCompetitor2(e.target.value)}
                placeholder="https://rival2.com/blog"
                className="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={blueprintMutation.isPending || !keyword}
              onClick={() => blueprintMutation.mutate()}
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/25 gap-2"
            >
              <Icon
                icon={
                  blueprintMutation.isPending
                    ? "solar:refresh-circle-bold"
                    : "solar:magic-stick-3-bold"
                }
                className={`h-4 w-4 ${blueprintMutation.isPending ? "animate-spin" : ""}`}
              />
              <span>
                {blueprintMutation.isPending
                  ? "Scraping & Dissecting..."
                  : "Run Competitor Dissection"}
              </span>
            </button>
          </div>

          {/* Blueprint Results */}
          {blueprint && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-base-300 bg-base-100 shadow-xs space-y-1">
                  <div className="text-[10px] font-black uppercase text-base-content/60">
                    Average Competitor Length
                  </div>
                  <div className="text-xl font-black text-base-content">
                    {blueprint.wordCountGap.averageCompetitor.toLocaleString()}{" "}
                    words
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    Target:{" "}
                    {blueprint.wordCountGap.recommendedMin.toLocaleString()}+
                    words
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-base-300 bg-base-100 shadow-xs space-y-1">
                  <div className="text-[10px] font-black uppercase text-base-content/60">
                    Missing Subtopics Found
                  </div>
                  <div className="text-xl font-black text-indigo-600">
                    {blueprint.missingSubtopics.length} Sections
                  </div>
                  <div className="text-[11px] text-base-content/60 font-medium">
                    Cover these to build topical authority
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-base-300 bg-base-100 shadow-xs space-y-1">
                  <div className="text-[10px] font-black uppercase text-base-content/60">
                    Schema Markup Gap
                  </div>
                  <div className="text-xl font-black text-purple-600">
                    {blueprint.missingSchemas.length} Schemas
                  </div>
                  <div className="text-[11px] text-base-content/60 font-medium">
                    {blueprint.missingSchemas.join(", ")}
                  </div>
                </div>
              </div>

              {/* Missing Subtopics List */}
              <div className="p-5 rounded-2xl border border-base-300 bg-base-100 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600">
                  <Icon icon="solar:document-add-bold" className="h-4 w-4" />
                  <span>Recommended Subtopics &amp; Headings to Add</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {blueprint.missingSubtopics.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-base-200 bg-base-200/40 text-xs font-bold text-base-content flex items-start gap-2"
                    >
                      <span className="badge badge-primary badge-xs mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Content Outline & Brief */}
              <div className="p-5 rounded-2xl border border-base-300 bg-base-100 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
                    <Icon icon="solar:stars-bold" className="h-4 w-4" />
                    <span>
                      AI Generated Article Outline &amp; Content Brief
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        `# ${blueprint.aiContentBrief.recommendedTitle}\n\nMeta Description: ${blueprint.aiContentBrief.metaDescription}\n\n` +
                        blueprint.aiContentBrief.suggestedOutline
                          .map(
                            (o) =>
                              `## ${o.heading}\n${o.keyPoints.map((k) => `- ${k}`).join("\n")}`,
                          )
                          .join("\n\n");
                      void navigator.clipboard.writeText(text);
                      toast.success("Content brief copied to clipboard!");
                    }}
                    className="btn btn-ghost btn-xs rounded-lg font-bold gap-1"
                  >
                    <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
                    <span>Copy Outline</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="font-extrabold text-primary mb-1">
                      Recommended Title Tag
                    </div>
                    <div className="text-base-content font-bold">
                      {blueprint.aiContentBrief.recommendedTitle}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {blueprint.aiContentBrief.suggestedOutline.map(
                      (section, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-base-200 bg-base-200/30 space-y-1.5"
                        >
                          <div className="font-extrabold text-xs text-base-content flex items-center gap-1.5">
                            <span className="text-primary font-black">H2:</span>
                            <span>{section.heading}</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-base-content/70 pl-2 space-y-0.5">
                            {section.keyPoints.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
