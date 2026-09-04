import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
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
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Link to="/docs" className="hover:underline">
              Docs
            </Link>
            <span>/</span>
            <span className="text-base-content/70 capitalize">{splat.replace(/\//g, " / ").replace(/-/g, " ")}</span>
          </div>

          {doc ? (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-base-300 pb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-base-content">
                  {doc.title}
                </h1>
                {doc.description && (
                  <p className="text-base text-base-content/70">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xs">
                <Markdown>{doc.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <h2 className="text-2xl font-bold text-base-content">Guide Not Found</h2>
              <p className="text-sm text-base-content/60">
                The requested documentation page could not be located.
              </p>
              <Link to="/docs" className="btn btn-primary btn-sm rounded-xl font-bold">
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
