import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCurrency } from "@/client/lib/currency";

export function TemplateRoiCalculator() {
  const [sites, setSites] = React.useState<number>(5);
  const { currency, currentCurrencyInfo } = useCurrency();

  // Calculate Skorvia and Legacy pricing dynamically
  const calculateCosts = (count: number) => {
    const isNgn = currency === "NGN";
    const rate = currentCurrencyInfo.rateAgainstUsd || 1;

    // Legacy suite cost (approx ₦210,000 or $140 per domain with seat add-ons)
    const legacyPerSiteUsd = 140;
    const legacyMonthly = isNgn
      ? count * 210000
      : Math.round(count * legacyPerSiteUsd * rate);

    // Skorvia tiered pricing
    let skorviaMonthly = 0;
    if (isNgn) {
      if (count <= 1) {
        skorviaMonthly = 22500;
      } else if (count <= 5) {
        skorviaMonthly = 73500;
      } else if (count <= 10) {
        skorviaMonthly = 148500;
      } else if (count <= 20) {
        skorviaMonthly = 298500;
      } else {
        skorviaMonthly = 448500;
      }
    } else {
      let skorviaMonthlyUsd = 15;
      if (count <= 1) {
        skorviaMonthlyUsd = 15;
      } else if (count <= 5) {
        skorviaMonthlyUsd = 49;
      } else if (count <= 10) {
        skorviaMonthlyUsd = 99;
      } else if (count <= 20) {
        skorviaMonthlyUsd = 199;
      } else {
        skorviaMonthlyUsd = 299;
      }
      skorviaMonthly = Math.round(skorviaMonthlyUsd * rate);
    }

    const monthlySavings = Math.max(0, legacyMonthly - skorviaMonthly);
    const annualSavings = monthlySavings * 12;

    const symbol = currentCurrencyInfo.symbol || "$";

    const formatNum = (num: number) =>
      `${symbol}${num.toLocaleString()}`;

    return {
      legacyMonthly: formatNum(legacyMonthly),
      skorviaMonthly: formatNum(skorviaMonthly),
      monthlySavings: formatNum(monthlySavings),
      annualSavings: formatNum(annualSavings),
    };
  };

  const costs = calculateCosts(sites);

  return (
    <section className="py-20 md:py-28 bg-background-2 dark:bg-background-5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[180px] pointer-events-none -z-10" />

      <div className="main-container">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary dark:text-brand-300 font-bold text-xs uppercase tracking-widest shadow-xs">
                ROI Calculator
              </span>
            </div>

            <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent tracking-tight font-interTight">
              See How Much You Save with Skorvia
            </h2>

            <p className="text-tagline-1 text-secondary dark:text-accent leading-relaxed max-w-2xl mx-auto">
              Calculate your exact annual cost reduction compared to legacy suites like Semrush and Ahrefs.
            </p>
          </div>

          {/* Calculator Container Card */}
          <div className="max-w-5xl mx-auto rounded-3xl border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-[#070D1E] shadow-2xl p-6 sm:p-10 lg:p-12 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column: Interactive Slider & Breakdown */}
              <div className="lg:col-span-7 space-y-8">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-bold text-secondary dark:text-white">
                    Websites / Domains Managed:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-primary dark:text-brand-300">
                    {sites} {sites === 1 ? "Website" : "Websites"}
                  </span>
                </div>

                {/* Range Slider */}
                <div className="space-y-3">
                  <div className="relative flex items-center py-2">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={sites}
                      onChange={(e) => setSites(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                          ((sites - 1) / (30 - 1)) * 100
                        }%, #1e293b ${
                          ((sites - 1) / (30 - 1)) * 100
                        }%, #1e293b 100%)`,
                      }}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>
                  {/* Slider Labels */}
                  <div className="flex justify-between text-xs font-semibold text-secondary/60 dark:text-accent/60 px-0.5">
                    <span>1 Site</span>
                    <span>10 Sites</span>
                    <span>20 Sites</span>
                    <span>30 Sites</span>
                  </div>
                </div>

                {/* Pricing Comparison Rows */}
                <div className="space-y-4 pt-4 border-t border-stroke-3/60 dark:border-stroke-7/80">
                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <span className="text-secondary/80 dark:text-white/80 font-medium">
                      Legacy Suite Cost (Semrush/Ahrefs):
                    </span>
                    <span className="font-bold text-rose-500 dark:text-rose-400 font-mono">
                      {costs.legacyMonthly} / mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <span className="text-secondary/80 dark:text-white/80 font-medium">
                      Skorvia Cost:
                    </span>
                    <span className="font-bold text-primary dark:text-brand-300 font-mono">
                      {costs.skorviaMonthly} / mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Vivid Royal Blue Highlight Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-gradient-to-br from-[#1E2AF8] to-[#121EC9] p-6 sm:p-8 text-center text-white shadow-[0_0_50px_rgba(30,42,248,0.35)] space-y-6 border border-white/10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white/80 block">
                      YOUR ESTIMATED ANNUAL SAVINGS
                    </span>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-interTight">
                      {costs.annualSavings}
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                      Save {costs.monthlySavings} every month while getting AI Search visibility and unlimited white-label reports.
                    </p>
                  </div>

                  <Link
                    to="/sign-up"
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-[#121EC9] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Claim Your Savings</span>
                    <ArrowRight className="size-4.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
