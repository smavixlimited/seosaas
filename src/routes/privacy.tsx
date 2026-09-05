import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 border-b border-base-300 pb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-base-content">
              Privacy Policy
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
                1. Information We Collect
              </h2>
              <p>
                We collect personal information that you provide when
                registering an account, including your name, email address,
                password hash, and billing details. We also collect analytical
                telemetry regarding feature utilization.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                2. Use of Information
              </h2>
              <p>
                We use collected information to authenticate users, fulfill API
                queries, compute SEO metrics, provide customer support, and
                communicate service updates. We do not sell your personal data
                or search histories to third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                3. GDPR & NDPR Compliance
              </h2>
              <p>
                Users in the European Union and Nigeria possess rights to
                access, rectify, port, or request permanent deletion of their
                personal data. To exercise data erasure rights, contact{" "}
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="link link-primary"
                >
                  {BRAND_CONFIG.supportEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
