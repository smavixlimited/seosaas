import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { generateAuditIssueAiFix } from "@/serverFunctions/audit";
import { createRoadmapTask } from "@/serverFunctions/roadmap";

interface AuditAiFixModalProps {
  projectId: string;
  issueType: string;
  title: string;
  pageUrl: string;
  detailsJson: string | null;
  howToFix?: string;
  severity: "critical" | "warning" | "info";
  onClose: () => void;
}

export function AuditAiFixModal({
  projectId,
  issueType,
  title,
  pageUrl,
  detailsJson,
  howToFix,
  severity,
  onClose,
}: AuditAiFixModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [codeSnippet, setCodeSnippet] = React.useState<string>("");
  const [explanation, setExplanation] = React.useState<string>("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await generateAuditIssueAiFix({
        data: {
          projectId,
          issueType,
          title,
          pageUrl,
          detailsJson,
          howToFix,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      setCodeSnippet(res.codeSnippet);
      setExplanation(res.explanation);
    },
    onError: () => {
      toast.error("Failed to generate AI fix. Using default recommendation.");
    },
  });

  const addToRoadmapMutation = useMutation({
    mutationFn: async () => {
      const priorityMap: Record<
        string,
        "critical" | "high" | "medium" | "low"
      > = {
        critical: "critical",
        warning: "high",
        info: "medium",
      };
      await createRoadmapTask({
        data: {
          projectId,
          title: `Fix ${title}: ${pageUrl}`,
          description:
            explanation || howToFix || `Resolve ${title} on ${pageUrl}`,
          category: "technical",
          priority: priorityMap[severity] || "medium",
          targetUrl: pageUrl,
          aiPrompt: `Fix ${title} on ${pageUrl} with code: ${codeSnippet}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Task added to Action Roadmap!");
    },
    onError: () => {
      toast.error("Failed to add task to roadmap");
    },
  });

  React.useEffect(() => {
    generateMutation.mutate();
  }, [issueType, pageUrl]);

  const handleCopy = () => {
    if (!codeSnippet) return;
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success("Code snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-base-300/80 flex items-center justify-between bg-base-200/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon
                icon="solar:magic-stick-3-bold-duotone"
                className="h-5 w-5"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-base-content">
                  Skorvia AI Code Fix
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    severity === "critical"
                      ? "bg-error/15 text-error"
                      : severity === "warning"
                        ? "bg-warning/15 text-warning"
                        : "bg-base-content/10 text-base-content/70"
                  }`}
                >
                  {severity}
                </span>
              </div>
              <p className="text-xs text-base-content/60 truncate max-w-md">
                {title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
          >
            <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Page URL */}
          <div className="rounded-xl border border-base-300/70 bg-base-200/30 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Icon
                icon="solar:link-round-bold"
                className="h-4 w-4 text-base-content/50 shrink-0"
              />
              <span className="text-xs font-mono text-base-content/80 truncate">
                {pageUrl}
              </span>
            </div>
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Visit Page</span>
              <Icon icon="solar:arrow-right-up-bold" className="h-3 w-3" />
            </a>
          </div>

          {/* AI Generation State */}
          {generateMutation.isPending ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <span className="loading loading-spinner loading-md text-primary" />
              <p className="text-xs font-semibold text-base-content/70">
                Skorvia AI is analyzing the page markup &amp; generating code
                fix...
              </p>
            </div>
          ) : (
            <>
              {/* Code Snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-base-content flex items-center gap-1.5">
                    <Icon
                      icon="solar:code-2-bold"
                      className="h-4 w-4 text-emerald-500"
                    />
                    <span>Recommended Code / Markup</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn btn-xs btn-primary font-bold gap-1 rounded-lg"
                  >
                    <Icon
                      icon={
                        copied ? "solar:check-circle-bold" : "solar:copy-bold"
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-base-300/80 bg-neutral text-neutral-content p-4 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-all">
                    {codeSnippet}
                  </pre>
                </div>
              </div>

              {/* Explanation */}
              {explanation && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-base-content/80 space-y-1">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Icon
                      icon="solar:info-circle-bold"
                      className="h-3.5 w-3.5"
                    />
                    <span>How This Fix Works</span>
                  </span>
                  <p className="leading-relaxed">{explanation}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-base-300/80 bg-base-200/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => addToRoadmapMutation.mutate()}
            disabled={
              addToRoadmapMutation.isPending || generateMutation.isPending
            }
            className="btn btn-sm btn-outline rounded-xl font-bold gap-1.5"
          >
            {addToRoadmapMutation.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon
                icon="solar:checklist-minimalistic-bold"
                className="h-4 w-4 text-primary"
              />
            )}
            <span>Add to Roadmap</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
