import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { getBrandProfile } from "@/serverFunctions/brand-competitor";
import { getProjectContext } from "@/serverFunctions/projectContext";
import {
  PROJECT_CONTEXT_SECTION_LABELS,
  type ProjectContextSectionKey,
} from "@/types/schemas/projectContext";

interface BrandSettingsCompletenessReminderProps {
  projectId: string;
  className?: string;
}

export function BrandSettingsCompletenessReminder({
  projectId,
  className = "",
}: BrandSettingsCompletenessReminderProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const brandProfileQuery = useQuery({
    queryKey: ["brandProfile", projectId],
    queryFn: () => getBrandProfile({ data: { projectId } }),
    staleTime: 5 * 60 * 1000,
  });

  const projectContextQuery = useQuery({
    queryKey: ["projectContext", projectId],
    queryFn: () => getProjectContext({ data: { projectId } }),
    staleTime: 5 * 60 * 1000,
  });

  if (brandProfileQuery.isLoading || projectContextQuery.isLoading || isDismissed) {
    return null;
  }

  const brandProfile = brandProfileQuery.data;
  const projectContext = projectContextQuery.data;

  // 1. Check General Settings
  const missingGeneral: string[] = [];
  if (!brandProfile?.brandName?.trim()) missingGeneral.push("Brand Name");
  if (!brandProfile?.websiteUrl?.trim()) missingGeneral.push("Website URL");
  if (!brandProfile?.brandDescription?.trim()) missingGeneral.push("Brand Description");
  if (!brandProfile?.valueProposition?.trim()) missingGeneral.push("Value Proposition");
  if (!brandProfile?.industry?.trim()) missingGeneral.push("Industry");

  // 2. Check Context Settings
  const missingContext: string[] = (projectContext?.missingSections || []).map(
    (key: ProjectContextSectionKey) => PROJECT_CONTEXT_SECTION_LABELS[key] || key,
  );

  const totalMissing = missingGeneral.length + missingContext.length;

  // If everything is completely filled, do not display the reminder
  if (totalMissing === 0) {
    return null;
  }

  // Determine target link (directs to context if general is complete, otherwise general settings)
  const targetSettingsUrl = missingGeneral.length > 0
    ? "/p/$projectId/settings"
    : "/p/$projectId/settings/context";

  return (
    <div
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-base-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon icon="solar:lightbulb-bolt-bold" className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-bold text-base-content flex items-center gap-2 flex-wrap">
            <span>Boost your AI analysis &amp; generation accuracy</span>
            <span className="badge badge-warning badge-xs font-bold font-mono">
              {totalMissing} {totalMissing === 1 ? "field" : "fields"} incomplete
            </span>
          </div>
          <p className="text-base-content/70 leading-relaxed">
            To get a better result, ensure you submit all the details about your Brand in Brand Settings.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Link
          to={targetSettingsUrl}
          params={{ projectId }}
          className="btn btn-xs sm:btn-sm btn-warning text-warning-content rounded-xl font-bold gap-1 shadow-xs"
        >
          <span>Complete Brand Settings</span>
          <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="btn btn-xs btn-ghost btn-circle text-base-content/40 hover:text-base-content"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
