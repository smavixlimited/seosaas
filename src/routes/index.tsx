import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { TemplateHero } from "@/client/marketing/template/TemplateHero";
import { TemplateIntegration } from "@/client/marketing/template/TemplateIntegration";
import { TemplateFeatures } from "@/client/marketing/template/TemplateFeatures";
import { TemplateServices } from "@/client/marketing/template/TemplateServices";
import { TemplateProcess } from "@/client/marketing/template/TemplateProcess";
import { TemplateNumbers } from "@/client/marketing/template/TemplateNumbers";
import { TemplateFaq } from "@/client/marketing/template/TemplateFaq";
import { TemplateCTA } from "@/client/marketing/template/TemplateCTA";
import { useCurrency } from "@/client/lib/currency";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { formatPrice } = useCurrency();
  const [domainCount, setDomainCount] = React.useState(5);

  // ROI Savings Calculation
  const legacyMonthlyCost = domainCount * 140; // Approx Semrush/Ahrefs cost per seat/domain
  const skorviaMonthlyCost = domainCount <= 1 ? 10 : domainCount <= 5 ? 49 : 149;
  const monthlySavings = legacyMonthlyCost - skorviaMonthlyCost;
  const annualSavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <main>
        {/* 1. NextSaaS Hero with Embedded Instant Interactive Scanner */}
        <TemplateHero />

        {/* 2. Integration Marquee Ticker */}
        <TemplateIntegration />

        {/* 3. NextSaaS 3-Card Bento Grid (Ad Spy, Revenue Leak Recovery, AI Search AEO) */}
        <TemplateFeatures />

        {/* 4. Full-Spectrum Services & Capabilities Grid */}
        <TemplateServices />

        {/* 5. 3-Step Outcome-Driven Process Flow */}
        <TemplateProcess />

        {/* 6. Live Stat Numbers & Trust Indicators */}
        <TemplateNumbers />

        {/* 7. Interactive ROI Calculator */}
        <section className="bg-base-100 dark:bg-[#070b10] py-20 lg:py-28 border-b border-base-300 dark:border-white/5">
          <div className="main-container">
            <div className="rounded-[32px] bg-base-200/50 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xl">
              <div className="lg:col-span-6 space-y-6">
                <div className="badge-green">
                  <Icon icon="solar:calculator-bold" className="h-3.5 w-3.5" />
                  <span>Cost Efficiency Calculator</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content leading-tight">
                  Stop Overpaying Thousands For Bloated SEO Seats.
                </h2>
                <p className="text-sm sm:text-base text-base-content/70 font-medium leading-relaxed">
                  Legacy platforms charge $199+/mo per user seat. {BRAND_CONFIG.name} gives your entire team full access with zero per-seat tax.
                </p>

                {/* Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Number of Tracked Domains / Brands:</span>
                    <span className="badge badge-primary badge-lg text-white font-black">{domainCount} Domains</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={domainCount}
                    onChange={(e) => setDomainCount(Number(e.target.value))}
                    className="range range-primary w-full"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-base-content/40">
                    <span>1 Solo Brand</span>
                    <span>10 Growing Brands</span>
                    <span>20+ Agency Scale</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-base-100 dark:bg-[#13171e] border border-base-300 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-base-200/50 dark:bg-black/20 border border-base-300 dark:border-white/5 space-y-1">
                      <div className="text-xs font-bold text-base-content/50">Legacy Suite Cost</div>
                      <div className="text-2xl sm:text-3xl font-black text-rose-500 line-through decoration-2">
                        ${legacyMonthlyCost.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-base-content/40">Semrush / Ahrefs + Addons</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
                      <div className="text-xs font-bold text-primary dark:text-brand-300">{BRAND_CONFIG.name} Flat Rate</div>
                      <div className="text-2xl sm:text-3xl font-black text-primary dark:text-brand-300">
                        ${skorviaMonthlyCost.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Unlimited team seats</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Your Annual Net Savings</div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        ${annualSavings.toLocaleString()} / year
                      </div>
                    </div>
                    <Icon icon="solar:wallet-money-bold" className="h-10 w-10 text-emerald-500 opacity-80" />
                  </div>

                  <Link
                    to="/sign-up"
                    className="btn btn-primary w-full rounded-2xl h-12 font-bold text-white shadow-lg shadow-primary/25 border-none gap-2"
                  >
                    <span>Lock In Your 70% Cost Savings</span>
                    <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Frequently Asked Questions */}
        <TemplateFaq />

        {/* 9. Final Conversion CTA */}
        <TemplateCTA />
      </main>

      <MarketingFooter />
    </div>
  );
}
