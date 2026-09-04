import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export function ProjectQuickStartEmptyState({
  projectId,
  onOpenCsvImporter,
}: {
  projectId: string;
  onOpenCsvImporter: () => void;
}) {
  return (
    <div className="rounded-3xl border border-base-300 bg-base-100 p-8 sm:p-12 text-center space-y-8 shadow-xs">
      <div className="max-w-md mx-auto space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <Icon icon="solar:magnifer-bold" className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-base-content">
          No Keywords Tracked Yet
        </h2>
        <p className="text-xs sm:text-sm text-base-content/70 font-medium leading-relaxed">
          Supercharge your project's organic growth. Choose a quick-start action below to populate your workspace in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
        {/* Option 1: CSV Migration Importer */}
        <div
          onClick={onOpenCsvImporter}
          className="p-6 rounded-3xl border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer space-y-4 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
            <Icon icon="solar:file-download-bold" className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="font-extrabold text-sm text-base-content flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <span>Import Ahrefs / Semrush CSV</span>
              <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Upload your exported keyword lists from legacy SEO suites with automatic column mapping.
            </p>
          </div>
        </div>

        {/* Option 2: Live Keyword Explorer */}
        <Link
          to="/p/$projectId/keywords"
          params={{ projectId }}
          className="p-6 rounded-3xl border border-base-300 bg-base-200/40 hover:bg-base-200/80 transition-all space-y-4 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Icon icon="solar:stars-bold" className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="font-extrabold text-sm text-base-content flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
              <span>Explore Top Keywords</span>
              <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Discover high-volume, low-difficulty search queries and buyer search terms for your niche.
            </p>
          </div>
        </Link>

        {/* Option 3: Instant Technical Site Audit */}
        <Link
          to="/p/$projectId/audit"
          params={{ projectId }}
          className="p-6 rounded-3xl border border-base-300 bg-base-200/40 hover:bg-base-200/80 transition-all space-y-4 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Icon icon="solar:shield-check-bold" className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="font-extrabold text-sm text-base-content flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
              <span>Run 60s Health Audit</span>
              <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Crawl your website for broken redirect chains, missing meta tags, and Core Web Vitals issues.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
