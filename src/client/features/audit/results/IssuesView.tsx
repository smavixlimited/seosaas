import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  AUDIT_ISSUE_TYPES,
  getIssueDescriptor,
  ISSUE_SEVERITY_ORDER,
  type AuditIssueDescriptor,
  type IssueSeverity,
} from "@/shared/audit-issues";
import type { AuditResultsData } from "@/client/features/audit/results/types";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { AuditAiFixModal } from "./AuditAiFixModal";

type AuditIssueRow = AuditResultsData["issues"][number];

const MAX_RENDERED_URLS = 100;

const SEVERITY_DOT: Record<IssueSeverity, string> = {
  critical: "bg-error",
  warning: "bg-warning",
  info: "bg-base-content/30",
};

const SEVERITY_RULE: Record<IssueSeverity, string> = {
  critical: "border-l-error/60",
  warning: "border-l-warning/60",
  info: "border-l-base-content/20",
};

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

interface IssueGroup {
  issueType: string;
  severity: IssueSeverity;
  title: string;
  explanation: string;
  howToFix: string;
  issues: AuditIssueRow[];
}

export function resolveIssueSeverity(issue: {
  issueType: string;
  severity: string;
}): IssueSeverity {
  const descriptor = getIssueDescriptor(issue.issueType);
  if (descriptor) return descriptor.severity;
  return issue.severity === "critical" || issue.severity === "warning"
    ? issue.severity
    : "info";
}

function groupIssues(issues: AuditIssueRow[]): IssueGroup[] {
  const groups = new Map<string, IssueGroup>();
  for (const issue of issues) {
    let group = groups.get(issue.issueType);
    if (!group) {
      const descriptor = getIssueDescriptor(issue.issueType);
      group = {
        issueType: issue.issueType,
        severity: resolveIssueSeverity(issue),
        title: descriptor?.title ?? issue.issueType,
        explanation: descriptor?.explanation ?? "",
        howToFix: descriptor?.howToFix ?? "",
        issues: [],
      };
      groups.set(issue.issueType, group);
    }
    group.issues.push(issue);
  }

  return Array.from(groups.values()).toSorted(
    (a, b) =>
      ISSUE_SEVERITY_ORDER[a.severity] - ISSUE_SEVERITY_ORDER[b.severity] ||
      b.issues.length - a.issues.length,
  );
}

export function IssuesView({
  issues,
  projectId = "",
}: {
  issues: AuditIssueRow[];
  projectId?: string;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "need_fix" | "passed">(
    "need_fix",
  );
  const [activeFixModal, setActiveFixModal] = useState<{
    issueType: string;
    title: string;
    pageUrl: string;
    detailsJson: string | null;
    howToFix?: string;
    severity: IssueSeverity;
  } | null>(null);

  const groups = useMemo(() => groupIssues(issues), [issues]);

  const failedIssueTypes = useMemo(
    () => new Set(issues.map((i) => i.issueType)),
    [issues],
  );

  const passedTests = useMemo(() => {
    return (
      Object.entries(AUDIT_ISSUE_TYPES) as [string, AuditIssueDescriptor][]
    )
      .filter(([typeKey]) => !failedIssueTypes.has(typeKey))
      .map(([typeKey, desc]) => ({
        typeKey,
        title: desc.title
          .replace(/^Missing /i, "Valid ")
          .replace(/^Broken /i, "Healthy ")
          .replace(/^Duplicate /i, "Unique ")
          .replace(/^Crawler was blocked/i, "Crawler Access Verified"),
        originalTitle: desc.title,
        explanation: `Zero defects found across all crawled pages. Site passes this technical SEO benchmark.`,
        severity: desc.severity,
      }));
  }, [failedIssueTypes]);

  const sections = useMemo(
    () =>
      (["critical", "warning", "info"] as const)
        .map((severity) => ({
          severity,
          groups: groups.filter((group) => group.severity === severity),
        }))
        .filter((section) => section.groups.length > 0),
    [groups],
  );

  return (
    <>
      {/* Category Filter Pills: All, Need to Fix, Passed Tests */}
      <div className="flex items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("need_fix")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold gap-1.5 transition-all ${
            activeTab === "need_fix"
              ? "btn-error text-white shadow-xs"
              : "btn-ghost text-base-content/70 hover:bg-base-200"
          }`}
        >
          <Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
          <span>
            Need to Fix ({groups.reduce((acc, g) => acc + g.issues.length, 0)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("passed")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold gap-1.5 transition-all ${
            activeTab === "passed"
              ? "btn-success text-white shadow-xs"
              : "btn-ghost text-base-content/70 hover:bg-base-200"
          }`}
        >
          <Icon icon="solar:check-circle-bold" className="h-4 w-4" />
          <span>Passed Tests ({passedTests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold gap-1.5 transition-all ${
            activeTab === "all"
              ? "btn-primary text-white shadow-xs"
              : "btn-ghost text-base-content/70 hover:bg-base-200"
          }`}
        >
          <Icon icon="solar:checklist-minimalistic-bold" className="h-4 w-4" />
          <span>
            All Checks (
            {groups.reduce((acc, g) => acc + g.issues.length, 0) +
              passedTests.length}
            )
          </span>
        </button>
      </div>

      <div className="border border-base-300 rounded-lg overflow-hidden space-y-px bg-base-300/40">
        {/* Issues to Fix (shown in 'need_fix' and 'all' tabs) */}
        {(activeTab === "need_fix" || activeTab === "all") && (
          <>
            {sections.length === 0 ? (
              <div className="p-8 text-center bg-base-100 text-base-content/70 space-y-1">
                <Icon
                  icon="solar:check-circle-bold"
                  className="h-8 w-8 text-success mx-auto mb-2"
                />
                <p className="font-bold text-sm text-base-content">
                  No technical issues detected!
                </p>
                <p className="text-xs">
                  Your site passed all crawler audits with zero critical flags
                  or warnings.
                </p>
              </div>
            ) : (
              sections.map((section) => (
                <IssueSection
                  key={section.severity}
                  section={section}
                  projectId={projectId}
                  onOpenAiFix={(fixData) => setActiveFixModal(fixData)}
                />
              ))
            )}
          </>
        )}

        {/* Passed Tests (shown in 'passed' and 'all' tabs) */}
        {(activeTab === "passed" || activeTab === "all") && (
          <div className="border-t border-base-300 first:border-t-0 bg-base-100">
            <div className="flex items-center gap-2 bg-success/10 px-4 py-2 border-b border-success/20">
              <span className="size-2 rounded-full bg-success" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                Passed Tests &amp; Healthy Signals
              </span>
              <span className="text-[11px] tabular-nums text-success/80 font-semibold">
                ({passedTests.length} tests verified)
              </span>
            </div>
            <div className="divide-y divide-base-300/50 max-h-[500px] overflow-y-auto">
              {passedTests.map((test) => (
                <div
                  key={test.typeKey}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-base-200/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-5 w-5 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-3.5 w-3.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-base-content truncate">
                        {test.title}
                      </p>
                      <p className="text-[11px] text-base-content/60 truncate">
                        {test.explanation}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-xs badge-success badge-outline font-semibold px-2 py-1 text-[10px] shrink-0">
                    Passed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeFixModal && (
        <AuditAiFixModal
          projectId={projectId}
          issueType={activeFixModal.issueType}
          title={activeFixModal.title}
          pageUrl={activeFixModal.pageUrl}
          detailsJson={activeFixModal.detailsJson}
          howToFix={activeFixModal.howToFix}
          severity={activeFixModal.severity}
          onClose={() => setActiveFixModal(null)}
        />
      )}
    </>
  );
}

function IssueSection({
  section,
  projectId,
  onOpenAiFix,
}: {
  section: { severity: IssueSeverity; groups: IssueGroup[] };
  projectId: string;
  onOpenAiFix: (data: {
    issueType: string;
    title: string;
    pageUrl: string;
    detailsJson: string | null;
    howToFix?: string;
    severity: IssueSeverity;
  }) => void;
}) {
  const issueCount = section.groups.reduce(
    (sum, group) => sum + group.issues.length,
    0,
  );

  return (
    <div className="border-t border-base-300 first:border-t-0">
      <div className="flex items-center gap-2 bg-base-200/60 px-4 py-1.5 border-b border-base-300/60">
        <span
          className={`size-1.5 rounded-full ${SEVERITY_DOT[section.severity]}`}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
          {SEVERITY_LABEL[section.severity]}
        </span>
        <span className="text-[11px] tabular-nums text-base-content/40">
          {issueCount}
        </span>
      </div>
      <div className="divide-y divide-base-300/60">
        {section.groups.map((group) => (
          <IssueRow
            key={group.issueType}
            group={group}
            projectId={projectId}
            onOpenAiFix={onOpenAiFix}
          />
        ))}
      </div>
    </div>
  );
}

function IssueRow({
  group,
  projectId,
  onOpenAiFix,
}: {
  group: IssueGroup;
  projectId: string;
  onOpenAiFix: (data: {
    issueType: string;
    title: string;
    pageUrl: string;
    detailsJson: string | null;
    howToFix?: string;
    severity: IssueSeverity;
  }) => void;
}) {
  const [open, setOpen] = useState(false);

  const addGroupToRoadmapMutation = useMutation({
    mutationFn: async () => {
      const priorityMap: Record<
        IssueSeverity,
        "critical" | "high" | "medium" | "low"
      > = {
        critical: "critical",
        warning: "high",
        info: "medium",
      };
      const firstUrl = group.issues[0]?.pageUrl || "";
      await createRoadmapTask({
        data: {
          projectId,
          title: `Fix ${group.title} (${group.issues.length} pages)`,
          description:
            group.howToFix || group.explanation || `Resolve ${group.title}`,
          category: "technical",
          priority: priorityMap[group.severity] || "medium",
          targetUrl: firstUrl,
          aiPrompt: `Provide exact code fix for ${group.title}: ${group.howToFix}`,
        },
      });
    },
    onSuccess: () => toast.success(`Added "${group.title}" to Action Roadmap!`),
    onError: () => toast.error("Failed to add task to roadmap"),
  });

  return (
    <div
      className={
        open
          ? `border-l-2 ${SEVERITY_RULE[group.severity]} bg-base-200/20`
          : "border-l-2 border-l-transparent"
      }
    >
      <div className="flex items-center justify-between px-4 py-2.5 hover:bg-base-200/40 transition-colors">
        <button
          type="button"
          className="flex items-center gap-3 text-left flex-1 min-w-0"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span
            className={`size-2 shrink-0 rounded-full ${SEVERITY_DOT[group.severity]}`}
          />
          <span className="text-sm font-medium flex-1 min-w-0 truncate">
            {group.title}
          </span>
          <span className="text-xs tabular-nums text-base-content/50 shrink-0 mr-2">
            {group.issues.length} {group.issues.length === 1 ? "page" : "pages"}
          </span>
          <ChevronRight
            className={`size-4 shrink-0 text-base-content/40 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Action Buttons in Group Row */}
        <div className="flex items-center gap-1.5 shrink-0 pl-3">
          <button
            type="button"
            title="Fix with Skorvia AI"
            onClick={() =>
              onOpenAiFix({
                issueType: group.issueType,
                title: group.title,
                pageUrl: group.issues[0]?.pageUrl || "",
                detailsJson: group.issues[0]?.detailsJson || null,
                howToFix: group.howToFix,
                severity: group.severity,
              })
            }
            className="btn btn-xs btn-primary font-bold gap-1 rounded-lg shadow-xs"
          >
            <Icon icon="solar:magic-stick-3-bold" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fix with Skorvia AI</span>
          </button>

          <button
            type="button"
            title="Add to Roadmap"
            disabled={addGroupToRoadmapMutation.isPending}
            onClick={() => addGroupToRoadmapMutation.mutate()}
            className="btn btn-xs btn-outline rounded-lg font-bold gap-1 text-base-content/70 hover:text-base-content"
          >
            {addGroupToRoadmapMutation.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon
                icon="solar:checklist-minimalistic-bold"
                className="h-3.5 w-3.5 text-primary"
              />
            )}
            <span className="hidden md:inline">Add to Roadmap</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="pl-9 pr-4 pb-4 pt-0.5 space-y-3">
          {group.explanation && (
            <p className="text-sm text-base-content/70 max-w-prose">
              {group.explanation}
            </p>
          )}
          {group.howToFix && (
            <p className="text-sm max-w-prose">
              <span className="font-medium">How to fix: </span>
              <span className="text-base-content/80">{group.howToFix}</span>
            </p>
          )}
          <AffectedUrlList
            issues={group.issues}
            group={group}
            projectId={projectId}
            onOpenAiFix={onOpenAiFix}
          />
        </div>
      )}
    </div>
  );
}

function AffectedUrlList({
  issues,
  group,
  projectId,
  onOpenAiFix,
}: {
  issues: AuditIssueRow[];
  group: IssueGroup;
  projectId: string;
  onOpenAiFix: (data: {
    issueType: string;
    title: string;
    pageUrl: string;
    detailsJson: string | null;
    howToFix?: string;
    severity: IssueSeverity;
  }) => void;
}) {
  const rendered = issues.slice(0, MAX_RENDERED_URLS);
  const remaining = issues.length - rendered.length;

  return (
    <div className="max-h-[320px] overflow-y-auto rounded-lg border border-base-300/60 bg-base-100">
      {rendered.map((issue) => (
        <AffectedUrlRow
          key={issue.id}
          issue={issue}
          group={group}
          projectId={projectId}
          onOpenAiFix={onOpenAiFix}
        />
      ))}
      {remaining > 0 && (
        <div className="px-3 py-2 text-xs text-base-content/50">
          …and {remaining} more — export the issues CSV for the full list.
        </div>
      )}
    </div>
  );
}

function AffectedUrlRow({
  issue,
  group,
  projectId,
  onOpenAiFix,
}: {
  issue: AuditIssueRow;
  group: IssueGroup;
  projectId: string;
  onOpenAiFix: (data: {
    issueType: string;
    title: string;
    pageUrl: string;
    detailsJson: string | null;
    howToFix?: string;
    severity: IssueSeverity;
  }) => void;
}) {
  const addToRoadmapMutation = useMutation({
    mutationFn: async () => {
      const priorityMap: Record<
        IssueSeverity,
        "critical" | "high" | "medium" | "low"
      > = {
        critical: "critical",
        warning: "high",
        info: "medium",
      };
      await createRoadmapTask({
        data: {
          projectId,
          title: `Fix ${group.title}: ${issue.pageUrl}`,
          description:
            group.howToFix || group.explanation || `Resolve ${group.title}`,
          category: "technical",
          priority: priorityMap[group.severity] || "medium",
          targetUrl: issue.pageUrl,
          aiPrompt: `Fix ${group.title} on ${issue.pageUrl}`,
        },
      });
    },
    onSuccess: () => toast.success("Added page fix to Action Roadmap!"),
    onError: () => toast.error("Failed to add to roadmap"),
  });

  return (
    <div className="px-3 py-2 text-sm flex items-center justify-between gap-3 border-b border-base-300/50 last:border-b-0 hover:bg-base-200/30 transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <a
          className="link link-hover text-base-content/90 font-medium truncate text-xs"
          href={issue.pageUrl}
          target="_blank"
          rel="noreferrer"
          title={issue.pageUrl}
        >
          {issue.pageUrl}
        </a>
        <IssueDetails detailsJson={issue.detailsJson} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() =>
            onOpenAiFix({
              issueType: group.issueType,
              title: group.title,
              pageUrl: issue.pageUrl,
              detailsJson: issue.detailsJson,
              howToFix: group.howToFix,
              severity: group.severity,
            })
          }
          className="btn btn-xs btn-ghost text-primary font-bold gap-1 rounded-lg hover:bg-primary/10"
          title="Fix with Skorvia AI"
        >
          <Icon icon="solar:magic-stick-3-bold" className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px]">
            Fix with Skorvia AI
          </span>
        </button>

        <button
          type="button"
          disabled={addToRoadmapMutation.isPending}
          onClick={() => addToRoadmapMutation.mutate()}
          className="btn btn-xs btn-ghost text-base-content/60 font-bold gap-1 rounded-lg hover:bg-base-200"
          title="Add to Roadmap"
        >
          {addToRoadmapMutation.isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Icon icon="solar:add-circle-bold" className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline text-[11px]">Add to Roadmap</span>
        </button>
      </div>
    </div>
  );
}

function parseDetails(detailsJson: string): Array<[string, unknown]> | null {
  try {
    const parsed: unknown = JSON.parse(detailsJson);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return Object.entries(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

function IssueDetails({ detailsJson }: { detailsJson: string | null }) {
  const details = useMemo(
    () => (detailsJson ? parseDetails(detailsJson) : null),
    [detailsJson],
  );

  if (!details) return null;

  const entries = details.filter(
    ([, value]) => value !== null && value !== undefined,
  );
  if (entries.length === 0) return null;

  return (
    <span className="text-[11px] text-base-content/50 truncate font-mono">
      {entries
        .map(([key, value]) => {
          const rendered = Array.isArray(value)
            ? value.join(" → ")
            : String(value);
          return `${key}: ${rendered}`;
        })
        .join(" · ")}
    </span>
  );
}
