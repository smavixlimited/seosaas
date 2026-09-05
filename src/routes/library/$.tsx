import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Markdown } from "@/client/components/Markdown";
import { getStrategyBySlug } from "@/lib/content";

export const Route = createFileRoute("/library/$")({
  component: StrategyReaderPage,
});

function StrategyReaderPage() {
  const params = useParams({ from: "/library/$" });
  const splat = params._splat || "";
  const parts = splat.split("/");
  const slug = parts[parts.length - 1];

  const strategy = getStrategyBySlug(slug);

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Link
              to="/library"
              className="hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Strategy Library
            </Link>
            <span>/</span>
            <span className="text-base-content/70 capitalize">
              {slug.replace(/-/g, " ")}
            </span>
          </div>

          {strategy ? (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-base-300 pb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-base-content">
                  {strategy.title}
                </h1>
                {strategy.description && (
                  <p className="text-base text-base-content/70">
                    {strategy.description}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xs">
                <Markdown>{strategy.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <h2 className="text-2xl font-bold text-base-content">
                Strategy Not Found
              </h2>
              <p className="text-sm text-base-content/60">
                The requested SEO strategy playbook could not be located.
              </p>
              <Link
                to="/library"
                className="btn btn-primary btn-sm rounded-xl font-bold"
              >
                Return to Strategy Library
              </Link>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
