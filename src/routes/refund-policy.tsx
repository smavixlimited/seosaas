import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 border-b border-base-300 pb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-base-content">
              Refund Policy
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
                1. 14-Day Money-Back Guarantee
              </h2>
              <p>
                We want you to be delighted with {BRAND_CONFIG.name}. If you are
                dissatisfied with your initial subscription within the first 14
                days of purchase, contact{" "}
                <a
                  href={`mailto:${BRAND_CONFIG.supportEmail}`}
                  className="link link-primary"
                >
                  {BRAND_CONFIG.supportEmail}
                </a>{" "}
                for a full, no-questions-asked refund.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                2. Recurring Subscriptions
              </h2>
              <p>
                Subsequent recurring monthly or annual renewals are
                non-refundable once charged. You can cancel your subscription at
                any time prior to the renewal date via your dashboard billing
                portal.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-base-content">
                3. Processing Times
              </h2>
              <p>
                Approved refunds are returned to the original payment method
                within 5 to 10 business days depending on your banking provider.
              </p>
            </section>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
