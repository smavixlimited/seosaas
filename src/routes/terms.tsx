import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 border-b border-base-300 pb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-base-content">
              Terms of Service
            </h1>
            <p className="text-xs text-base-content/60">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-base-content/80 space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or using {BRAND_CONFIG.name}{" "}
                ("the Service"), operated by {BRAND_CONFIG.legalName}, you agree
                to be bound by these Terms of Service. If you do not agree, do
                not access or use the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                2. Description of Service
              </h2>
              <p>
                {BRAND_CONFIG.name} provides SEO analytics, keyword research,
                backlink monitoring, technical site crawling, AI search
                optimization (AEO), and automated PDF reporting tools. We
                reserve the right to modify, suspend, or discontinue any feature
                at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                3. Subscription & Fair Usage
              </h2>
              <p>
                Subscription plans are billed in advance on a recurring monthly
                or annual basis. Each tier includes specified credit limits for
                crawl pages, keyword tracking, and API calls. Excessive
                automated scraping or abuse of the service outside intended UI
                or MCP parameters may result in immediate suspension.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                4. Limitation of Liability
              </h2>
              <p>
                The Service is provided "as is" without warranty of any kind.{" "}
                {BRAND_CONFIG.legalName} shall not be liable for any indirect,
                incidental, special, or consequential damages resulting from
                algorithmic search ranking fluctuations.
              </p>
            </section>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
