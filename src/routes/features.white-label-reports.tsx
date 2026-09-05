import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Palette, Send } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/white-label-reports")({
  component: WhiteLabelReportsFeaturePage,
});

function WhiteLabelReportsFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Agency Client Experience
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              Automated White-Label Client PDF Reports
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Deliver gorgeous, branded SEO audit and ranking performance PDFs
              under your agency's logo, colors, and custom domain.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary"
              >
                Create Client PDF Free
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                100% Custom Brand Styling
              </h3>
              <p className="text-sm text-base-content/70">
                Upload your agency logo, set custom primary/secondary color
                schemes, and remove all references to {BRAND_CONFIG.name}.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Scheduled Email Delivery
              </h3>
              <p className="text-sm text-base-content/70">
                Automatically email weekly or monthly executive PDF summaries
                directly to your clients on autopilot.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Custom Domain Portals
              </h3>
              <p className="text-sm text-base-content/70">
                Give your clients interactive dashboard access under
                `reports.youragency.com` with restricted read-only permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
