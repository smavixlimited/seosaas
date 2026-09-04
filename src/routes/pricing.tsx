import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { useCurrency, CurrencySwitcher } from "@/client/lib/currency";
import { CheckoutModal, type PlanItem } from "@/client/components/billing/CheckoutModal";
import { getPublicPlansServerFn } from "@/serverFunctions/billing-gateways";
import type { AdminPlanRecord } from "@/services/billing-plans.service";

export const Route = createFileRoute("/pricing")({
  loader: async () => {
    try {
      return (await getPublicPlansServerFn()) as AdminPlanRecord[];
    } catch {
      return [] as AdminPlanRecord[];
    }
  },
  component: PricingPage,
});

function PricingPage() {
  const dbPlans = (Route.useLoaderData() ?? []) as AdminPlanRecord[];
  const { formatPrice } = useCurrency();
  const [billingInterval, setBillingInterval] = React.useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = React.useState<PlanItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const isAnnual = billingInterval === "year";

  const tiers: PlanItem[] = dbPlans.length > 0
    ? dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        priceUsd: isAnnual ? Math.round(p.priceUsd * 0.8) : p.priceUsd,
        priceNgn: isAnnual ? Math.round(p.priceNgn * 0.8) : p.priceNgn,
        billingInterval: p.billingInterval,
        limits: p.limits,
        features: p.features,
      }))
    : BRAND_CONFIG.pricing.tiers.map((t) => ({
        id: t.id,
        name: t.name,
        priceUsd: isAnnual ? t.priceAnnualUSD : t.priceMonthlyUSD,
        priceNgn: isAnnual ? t.priceAnnualNGN : t.priceMonthlyNGN,
        billingInterval: "month",
      }));

  const openCheckout = (tier: PlanItem) => {
    setSelectedPlan(tier);
    setIsCheckoutOpen(true);
  };

  const starterPlan = dbPlans.find((p) => p.id === "starter");
  const proPlan = dbPlans.find((p) => p.id === "pro");
  const agencyPlan = dbPlans.find((p) => p.id === "agency" || p.id === "enterprise");

  const comparisonRows = [
    // 1. Core SEO Suite
    {
      feature: "Keyword Research & Search Intent",
      starter: starterPlan?.features?.keyword_research ?? true,
      pro: proPlan?.features?.keyword_research ?? true,
      agency: agencyPlan?.features?.keyword_research ?? true,
    },
    {
      feature: "Daily Desktop & Mobile SERP Tracker",
      starter: starterPlan?.features?.rank_tracker ?? true,
      pro: proPlan?.features?.rank_tracker ?? true,
      agency: agencyPlan?.features?.rank_tracker ?? true,
    },
    {
      feature: "Backlink Profile & Gap Explorer",
      starter: starterPlan?.features?.backlink_analysis ?? true,
      pro: proPlan?.features?.backlink_analysis ?? true,
      agency: agencyPlan?.features?.backlink_analysis ?? true,
    },
    {
      feature: "Deep Technical Site Audit & Core Web Vitals",
      starter: starterPlan?.features?.site_audit ?? true,
      pro: proPlan?.features?.site_audit ?? true,
      agency: agencyPlan?.features?.site_audit ?? true,
    },
    // 2. Local SEO
    {
      feature: "Google Business Profile (GBP) Sync",
      starter: starterPlan?.features?.gbp_integration ?? false,
      pro: proPlan?.features?.gbp_integration ?? true,
      agency: agencyPlan?.features?.gbp_integration ?? true,
    },
    {
      feature: "Map Rank Geo-Grid Matrix (3x3 / 5x5)",
      starter: starterPlan?.features?.map_rank_tracker ?? false,
      pro: proPlan?.features?.map_rank_tracker ?? true,
      agency: agencyPlan?.features?.map_rank_tracker ?? true,
    },
    {
      feature: "Review Management & 1-Click AI Responder",
      starter: starterPlan?.features?.review_management ?? false,
      pro: proPlan?.features?.review_management ?? false,
      agency: agencyPlan?.features?.review_management ?? true,
    },
    {
      feature: "Local Directory & NAP Consistency Audit",
      starter: starterPlan?.features?.listing_management ?? false,
      pro: proPlan?.features?.listing_management ?? false,
      agency: agencyPlan?.features?.listing_management ?? true,
    },
    // 3. AI & Content
    {
      feature: "AI Search & AEO Citation Visibility",
      starter: starterPlan?.features?.ai_visibility ?? starterPlan?.features?.aeoAudit ?? false,
      pro: proPlan?.features?.ai_visibility ?? proPlan?.features?.aeoAudit ?? true,
      agency: agencyPlan?.features?.ai_visibility ?? agencyPlan?.features?.aeoAudit ?? true,
    },
    {
      feature: "AI Content Studio & Automated llms.txt",
      starter: starterPlan?.features?.ai_content_studio ?? false,
      pro: proPlan?.features?.ai_content_studio ?? true,
      agency: agencyPlan?.features?.ai_content_studio ?? true,
    },
    {
      feature: "One-Click 'AI SEO Fixer' Metadata Builder",
      starter: starterPlan?.features?.ai_seo_fixer ?? false,
      pro: proPlan?.features?.ai_seo_fixer ?? false,
      agency: agencyPlan?.features?.ai_seo_fixer ?? true,
    },
    {
      feature: "1-Click IndexNow & Google Push",
      starter: starterPlan?.features?.indexnow_submitter ?? starterPlan?.features?.indexnowSubmit ?? false,
      pro: proPlan?.features?.indexnow_submitter ?? proPlan?.features?.indexnowSubmit ?? true,
      agency: agencyPlan?.features?.indexnow_submitter ?? agencyPlan?.features?.indexnowSubmit ?? true,
    },
    // 4. Infrastructure & Agency
    {
      feature: "5-Minute Uptime & SSL Monitor",
      starter: starterPlan?.features?.uptime_ssl_monitoring ?? false,
      pro: proPlan?.features?.uptime_ssl_monitoring ?? true,
      agency: agencyPlan?.features?.uptime_ssl_monitoring ?? true,
    },
    {
      feature: "Drag-and-Drop 'My Reports' Builder",
      starter: starterPlan?.features?.my_reports_builder ?? false,
      pro: proPlan?.features?.my_reports_builder ?? false,
      agency: agencyPlan?.features?.my_reports_builder ?? true,
    },
    {
      feature: "White-Label Client PDF Reports",
      starter: starterPlan?.features?.white_label_pdf ?? starterPlan?.features?.whiteLabelPdf ?? false,
      pro: proPlan?.features?.white_label_pdf ?? proPlan?.features?.whiteLabelPdf ?? false,
      agency: agencyPlan?.features?.white_label_pdf ?? agencyPlan?.features?.whiteLabelPdf ?? true,
    },
    {
      feature: "Multi-Seat Team Management",
      starter: starterPlan?.features?.team_management ? "Included" : "1 Seat",
      pro: proPlan?.features?.team_management ? "Included" : "5 Seats",
      agency: agencyPlan?.features?.team_management ? "Unlimited" : "Unlimited",
    },
    {
      feature: "Personal API Key & Autonomous MCP Server",
      starter: starterPlan?.features?.mcp_api_access ?? starterPlan?.features?.mcpAccess ?? false,
      pro: proPlan?.features?.mcp_api_access ?? proPlan?.features?.mcpAccess ?? true,
      agency: agencyPlan?.features?.mcp_api_access ?? agencyPlan?.features?.mcpAccess ?? true,
    },
    {
      feature: "Priority 24/7 Dedicated Support",
      starter: starterPlan?.features?.priority_support ? "Priority" : "Standard",
      pro: proPlan?.features?.priority_support ? "Priority 24/7" : "Priority (12hr)",
      agency: agencyPlan?.features?.priority_support ? "Dedicated 24/7" : "Dedicated 24/7",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Simple, Transparent Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              Invest in high-converting SEO without the enterprise tax.
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Choose the plan that fits your growth stage. Cancel or switch tiers at any time.
            </p>

            {/* Currency & Billing Interval Controls */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center gap-2 rounded-2xl border border-base-300 bg-base-200/60 p-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingInterval("month")}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    !isAnnual
                      ? "bg-base-100 text-base-content shadow-xs"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("year")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    isAnnual
                      ? "bg-primary text-white shadow-xs"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-black ${isAnnual ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    SAVE 20%
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <CurrencySwitcher />
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier) => {
              const formattedPrice = formatPrice(tier.priceUsd, tier.priceNgn);
              const isHighlighted = tier.id === "pro";

              const staticMeta = BRAND_CONFIG.pricing.tiers.find((t) => t.id === tier.id);

              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl border p-8 shadow-sm flex flex-col justify-between relative transition-all duration-200 ${
                    isHighlighted
                      ? "border-primary bg-base-100 shadow-2xl ring-2 ring-primary/20"
                      : "border-base-300 bg-base-100 hover:shadow-lg"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-black text-white shadow-md">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-base-content">{tier.name}</h3>
                      <p className="text-xs text-base-content/60 mt-1 min-h-[32px]">
                        {staticMeta?.description || "High-performance SEO intelligence suite."}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-base-content">
                        {formattedPrice}
                      </span>
                      <span className="text-xs font-semibold text-base-content/60">
                        / month
                      </span>
                    </div>

                    {isAnnual && (
                      <p className="text-xs text-accent font-semibold">
                        Billed annually (20% discount applied)
                      </p>
                    )}

                    <div className="space-y-3 pt-4 border-t border-base-300/80">
                      <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                        Included Features
                      </p>
                      <ul className="space-y-2.5 text-sm text-base-content/80">
                        {(staticMeta?.features || [
                          "Live SERP Keyword Tracking",
                          "Backlink Analysis",
                          "Technical Site Audit",
                        ]).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <Check className="h-4 w-4 text-accent shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="button"
                      onClick={() => openCheckout(tier)}
                      className={`btn w-full rounded-2xl font-bold shadow-md ${
                        isHighlighted
                          ? "btn-primary text-white border-none bg-primary hover:bg-primary/90"
                          : "btn-outline"
                      }`}
                    >
                      Subscribe with {tier.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Feature Comparison Matrix */}
          <div className="mt-24 space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-base-content">
                Compare All Plan Features
              </h2>
              <p className="text-sm text-base-content/60">
                Detailed breakdown of limits and technical capabilities.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-base-300 bg-base-100 shadow-sm">
              <table className="table w-full text-xs">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200/50 text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                    <th className="py-4 px-6">Feature</th>
                    <th className="text-center">Starter</th>
                    <th className="text-center text-primary font-black">Pro (Popular)</th>
                    <th className="text-center">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-base-300/40 hover:bg-base-200/30">
                      <td className="py-3.5 px-6 font-semibold text-base-content/90">
                        {row.feature}
                      </td>
                      <td className="text-center">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-base-content/30 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-base-content">{row.starter}</span>
                        )}
                      </td>
                      <td className="text-center bg-primary/5">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="h-4 w-4 text-primary mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-base-content/30 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-primary">{row.pro}</span>
                        )}
                      </td>
                      <td className="text-center">
                        {typeof row.agency === "boolean" ? (
                          row.agency ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-base-content/30 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-base-content">{row.agency}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Checkout Modal */}
      <CheckoutModal
        plan={selectedPlan}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <MarketingFooter />
    </div>
  );
}
