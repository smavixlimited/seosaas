import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Markdown } from "@/client/components/Markdown";
import { getDocByPath, getSkillBySlug } from "@/lib/content";

export const Route = createFileRoute("/docs/$")({
  component: DynamicDocPage,
});

function DynamicDocPage() {
  const params = useParams({ from: "/docs/$" });
  const splat = params._splat || "";

  // Try matching full doc path or skill
  const doc = getDocByPath(splat) || getSkillBySlug(splat);

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container max-w-4xl space-y-8">
          <div className="flex items-center gap-2 text-tagline-3 font-semibold text-primary-500">
            <Link to="/docs" className="hover:underline flex items-center gap-1.5">
              <Icon icon="solar:arrow-left-linear" className="size-4" /> Docs
            </Link>
            <span className="text-secondary/30 dark:text-accent/30">/</span>
            <span className="text-secondary/60 dark:text-accent/60 capitalize truncate">
              {splat.replace(/\//g, " / ").replace(/-/g, " ")}
            </span>
          </div>

          {doc ? (
            <div className="space-y-6">
              <div className="space-y-3 border-b border-stroke-4 dark:border-stroke-8 pb-8">
                <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight leading-tight">
                  {doc.title}
                </h1>
                {doc.description && (
                  <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 leading-relaxed">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="rounded-[24px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 sm:p-10 shadow-xs prose prose-lg dark:prose-invert max-w-none">
                <Markdown>{doc.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <h2 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                Guide Not Found
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                The requested documentation page could not be located.
              </p>
              <Link to="/docs" className="btn btn-primary btn-md rounded-full font-bold">
                Return to Docs Hub
              </Link>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
