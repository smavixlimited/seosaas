import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { useCurrency, CurrencySwitcher } from "@/client/lib/currency";
import {
  CheckoutModal,
  type PlanItem,
} from "@/client/components/billing/CheckoutModal";
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
  const [billingInterval, setBillingInterval] = React.useState<
    "month" | "year"
  >("month");
  const [selectedPlan, setSelectedPlan] = React.useState<PlanItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const isAnnual = billingInterval === "year";

  const tiers: PlanItem[] =
    dbPlans.length > 0
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

  const freePlan = dbPlans.find((p) => p.id === "free");
  const starterPlan = dbPlans.find((p) => p.id === "starter");
  const proPlan = dbPlans.find((p) => p.id === "pro");
  const agencyPlan = dbPlans.find(
    (p) => p.id === "agency" || p.id === "enterprise",
  );

  const comparisonRows = [
    // 1. Core SEO Suite
    {
      feature: "Keyword Research & Search Intent",
      free: freePlan?.features?.keyword_research ?? true,
      starter: starterPlan?.features?.keyword_research ?? true,
      pro: proPlan?.features?.keyword_research ?? true,
      agency: agencyPlan?.features?.keyword_research ?? true,
    },
    {
      feature: "Daily Desktop & Mobile SERP Tracker",
      free: freePlan?.features?.rank_tracker ?? true,
      starter: starterPlan?.features?.rank_tracker ?? true,
      pro: proPlan?.features?.rank_tracker ?? true,
      agency: agencyPlan?.features?.rank_tracker ?? true,
    },
    {
      feature: "Backlink Profile & Gap Explorer",
      free: freePlan?.features?.backlink_analysis ?? false,
      starter: starterPlan?.features?.backlink_analysis ?? true,
      pro: proPlan?.features?.backlink_analysis ?? true,
      agency: agencyPlan?.features?.backlink_analysis ?? true,
    },
    {
      feature: "Deep Technical Site Audit & Core Web Vitals",
      free: freePlan?.features?.site_audit ?? true,
      starter: starterPlan?.features?.site_audit ?? true,
      pro: proPlan?.features?.site_audit ?? true,
      agency: agencyPlan?.features?.site_audit ?? true,
    },
    // 2. Local SEO
    {
      feature: "Google Business Profile (GBP) Sync",
      free: freePlan?.features?.gbp_integration ?? false,
      starter: starterPlan?.features?.gbp_integration ?? false,
      pro: proPlan?.features?.gbp_integration ?? true,
      agency: agencyPlan?.features?.gbp_integration ?? true,
    },
    {
      feature: "Map Rank Geo-Grid Matrix (3x3 / 5x5)",
      free: freePlan?.features?.map_rank_tracker ?? false,
      starter: starterPlan?.features?.map_rank_tracker ?? false,
      pro: proPlan?.features?.map_rank_tracker ?? true,
      agency: agencyPlan?.features?.map_rank_tracker ?? true,
    },
    {
      feature: "Review Management & 1-Click AI Responder",
      free: freePlan?.features?.review_management ?? false,
      starter: starterPlan?.features?.review_management ?? false,
      pro: proPlan?.features?.review_management ?? false,
      agency: agencyPlan?.features?.review_management ?? true,
    },
    {
      feature: "Local Directory & NAP Consistency Audit",
      free: freePlan?.features?.listing_management ?? false,
      starter: starterPlan?.features?.listing_management ?? false,
      pro: proPlan?.features?.listing_management ?? false,
      agency: agencyPlan?.features?.listing_management ?? true,
    },
    // 3. AI & Content
    {
      feature: "AI Search & AEO Citation Visibility",
      free: freePlan?.features?.ai_visibility ?? false,
      starter:
        starterPlan?.features?.ai_visibility ??
        starterPlan?.features?.aeoAudit ??
        false,
      pro:
        proPlan?.features?.ai_visibility ?? proPlan?.features?.aeoAudit ?? true,
      agency:
        agencyPlan?.features?.ai_visibility ??
        agencyPlan?.features?.aeoAudit ??
        true,
    },
    {
      feature: "AI Content Studio & Automated llms.txt",
      free: freePlan?.features?.ai_content_studio ?? false,
      starter: starterPlan?.features?.ai_content_studio ?? false,
      pro: proPlan?.features?.ai_content_studio ?? true,
      agency: agencyPlan?.features?.ai_content_studio ?? true,
    },
    {
      feature: "One-Click 'AI SEO Fixer' Metadata Builder",
      free: freePlan?.features?.ai_seo_fixer ?? false,
      starter: starterPlan?.features?.ai_seo_fixer ?? false,
      pro: proPlan?.features?.ai_seo_fixer ?? false,
      agency: agencyPlan?.features?.ai_seo_fixer ?? true,
    },
    {
      feature: "1-Click IndexNow & Google Push",
      free: freePlan?.features?.indexnow_submitter ?? false,
      starter:
        starterPlan?.features?.indexnow_submitter ??
        starterPlan?.features?.indexnowSubmit ??
        false,
      pro:
        proPlan?.features?.indexnow_submitter ??
        proPlan?.features?.indexnowSubmit ??
        true,
      agency:
        agencyPlan?.features?.indexnow_submitter ??
        agencyPlan?.features?.indexnowSubmit ??
        true,
    },
    // 4. Infrastructure & Agency
    {
      feature: "5-Minute Uptime & SSL Monitor",
      free: freePlan?.features?.uptime_ssl_monitoring ?? false,
      starter: starterPlan?.features?.uptime_ssl_monitoring ?? false,
      pro: proPlan?.features?.uptime_ssl_monitoring ?? true,
      agency: agencyPlan?.features?.uptime_ssl_monitoring ?? true,
    },
    {
      feature: "Drag-and-Drop 'My Reports' Builder",
      free: freePlan?.features?.my_reports_builder ?? false,
      starter: starterPlan?.features?.my_reports_builder ?? false,
      pro: proPlan?.features?.my_reports_builder ?? false,
      agency: agencyPlan?.features?.my_reports_builder ?? true,
    },
    {
      feature: "White-Label Client PDF Reports",
      free: freePlan?.features?.white_label_pdf ?? false,
      starter:
        starterPlan?.features?.white_label_pdf ??
        starterPlan?.features?.whiteLabelPdf ??
        false,
      pro:
        proPlan?.features?.white_label_pdf ??
        proPlan?.features?.whiteLabelPdf ??
        false,
      agency:
        agencyPlan?.features?.white_label_pdf ??
        agencyPlan?.features?.whiteLabelPdf ??
        true,
    },
    {
      feature: "Multi-Seat Team Management",
      free: "1 Seat",
      starter: starterPlan?.features?.team_management ? "Included" : "2 Seats",
      pro: proPlan?.features?.team_management ? "Included" : "5 Seats",
      agency: agencyPlan?.features?.team_management ? "Unlimited" : "25 Seats",
    },
    {
      feature: "Personal API Key & Autonomous MCP Server",
      free: freePlan?.features?.mcp_api_access ?? false,
      starter:
        starterPlan?.features?.mcp_api_access ??
        starterPlan?.features?.mcpAccess ??
        false,
      pro:
        proPlan?.features?.mcp_api_access ??
        proPlan?.features?.mcpAccess ??
        true,
      agency:
        agencyPlan?.features?.mcp_api_access ??
        agencyPlan?.features?.mcpAccess ??
        true,
    },
    {
      feature: "Priority Dedicated Support",
      free: "Community",
      starter: starterPlan?.features?.priority_support
        ? "Priority"
        : "Standard",
      pro: proPlan?.features?.priority_support
        ? "Priority 24/7"
        : "Priority (12hr)",
      agency: agencyPlan?.features?.priority_support
        ? "Dedicated 24/7"
        : "Dedicated 24/7",
    },
  ];

  const faqs = [
    {
      q: "Can I cancel or switch my plan at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly inside your Brand Settings. When upgrading, your prorated credit is immediately applied.",
    },
    {
      q: "Do you charge extra for additional team members or client seats?",
      a: "No. Unlike legacy SEO tools that charge up to $45/mo for every additional seat, Skorvia Pro and Agency plans include generous multi-user access with role-based permissions.",
    },
    {
      q: "What is MCP Server access and how does it work?",
      a: "Skorvia provides a live Model Context Protocol (MCP) server. You can connect Claude Code, Cursor, Windsurf, or custom AI agents to query live rankings, keyword volume, and backlink data directly in your AI coding environment.",
    },
    {
      q: "What payment gateways are supported?",
      a: "We support Stripe, PayPal, Lemon Squeezy, Paystack, and Flutterwave for effortless global payments in both USD ($) and Nigerian Naira (₦).",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero & Pricing Cards Section */}
      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-cyan">
              Simple, Transparent Pricing
            </span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              Invest in high-converting SEO without the enterprise tax.
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto">
              Select the pricing plan that best suits your needs. Scale
              seamlessly from solo founder to full-service agency.
            </p>

            {/* Currency & Billing Toggle */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Billing Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-7 p-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingInterval("month")}
                  className={`rounded-full px-5 py-2 text-tagline-3 font-semibold transition-all ${
                    !isAnnual
                      ? "bg-secondary text-white dark:bg-accent dark:text-secondary shadow-xs"
                      : "text-secondary/60 dark:text-accent/60 hover:text-secondary dark:hover:text-accent"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("year")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-tagline-3 font-semibold transition-all ${
                    isAnnual
                      ? "bg-primary-500 text-white shadow-xs"
                      : "text-secondary/60 dark:text-accent/60 hover:text-secondary dark:hover:text-accent"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      isAnnual
                        ? "bg-white/20 text-white"
                        : "bg-primary-500/15 text-primary-500"
                    }`}
                  >
                    SAVE 20%
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <CurrencySwitcher />
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tiers.map((tier) => {
              const formattedPrice =
                tier.priceUsd === 0 ? "$0" : formatPrice(tier.priceUsd, tier.priceNgn);
              const isFree = tier.id === "free" || tier.priceUsd === 0;
              const isHighlighted = tier.id === "pro";
              const staticMeta = BRAND_CONFIG.pricing.tiers.find(
                (t) => t.id === tier.id,
              );

              return (
                <div
                  key={tier.id}
                  className={`rounded-[24px] border p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 ${
                    isHighlighted
                      ? "border-primary-500 bg-secondary dark:bg-background-5 text-white shadow-2xl ring-2 ring-primary-500/30 lg:scale-[103%]"
                      : "border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 text-secondary dark:text-accent hover:shadow-lg"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-[11px] font-black tracking-wide text-white uppercase shadow-md">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-heading-5 font-bold font-interTight ${isHighlighted ? "text-white" : "text-secondary dark:text-accent"}`}
                        >
                          {tier.name}
                        </h3>
                        <span
                          className={`badge ${isHighlighted ? "badge-yellow" : isFree ? "badge-green" : "badge-cyan"}`}
                        >
                          {tier.id === "free"
                            ? "Forever Free"
                            : tier.id === "starter"
                              ? "Starter"
                              : tier.id === "pro"
                                ? "Scale"
                                : "Agency"}
                        </span>
                      </div>
                      <p
                        className={`text-tagline-2 mt-2 min-h-[40px] leading-relaxed ${
                          isHighlighted
                            ? "text-accent/80"
                            : "text-secondary/60 dark:text-accent/60"
                        }`}
                      >
                        {staticMeta?.description ||
                          "High-performance SEO intelligence suite."}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-2">
                      <span
                        className={`text-heading-2 font-extrabold font-interTight ${
                          isHighlighted
                            ? "text-white"
                            : "text-secondary dark:text-accent"
                        }`}
                      >
                        {formattedPrice}
                      </span>
                      <span
                        className={`text-tagline-2 font-medium ${
                          isHighlighted
                            ? "text-accent/70"
                            : "text-secondary/50 dark:text-accent/50"
                        }`}
                      >
                        {isFree ? "/ forever" : "/ month"}
                      </span>
                    </div>

                    {isAnnual && !isFree && (
                      <p className="text-[12px] text-ns-green font-bold">
                        ✓ Billed annually (20% discount applied)
                      </p>
                    )}

                    <div
                      className={`space-y-3 pt-5 border-t ${
                        isHighlighted
                          ? "border-white/10"
                          : "border-stroke-4 dark:border-stroke-8"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isHighlighted
                            ? "text-accent/60"
                            : "text-secondary/40 dark:text-accent/40"
                        }`}
                      >
                        Included Capabilities
                      </p>
                      <ul className="space-y-2.5 text-tagline-2 text-xs">
                        {(
                          staticMeta?.features || [
                            "Live SERP Keyword Tracking",
                            "Backlink Analysis",
                            "Technical Site Audit",
                          ]
                        ).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <div
                              className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 ${
                                isHighlighted
                                  ? "bg-primary-500 text-white"
                                  : "bg-primary-500/10 text-primary-500"
                              }`}
                            >
                              <Icon
                                icon="solar:check-circle-bold"
                                className="size-3.5"
                              />
                            </div>
                            <span
                              className={
                                isHighlighted
                                  ? "text-accent/90"
                                  : "text-secondary/80 dark:text-accent/80"
                              }
                            >
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isFree ? (
                      <a
                        href="/sign-up"
                        className="btn btn-md w-full rounded-full font-bold shadow-md transition-all btn-outline border-stroke-4 dark:border-stroke-8 hover:bg-secondary hover:text-white dark:hover:bg-accent dark:hover:text-secondary flex items-center justify-center text-xs"
                      >
                        Get Started Free
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openCheckout(tier)}
                        className={`btn btn-md w-full rounded-full font-bold shadow-md transition-all text-xs ${
                          isHighlighted
                            ? "btn-primary bg-primary-500 hover:bg-primary-600 text-white border-none shadow-primary-500/25"
                            : "btn-outline border-stroke-4 dark:border-stroke-8 hover:bg-secondary hover:text-white dark:hover:bg-accent dark:hover:text-secondary"
                        }`}
                      >
                        Subscribe to {tier.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Highlights & Trust Stats */}
          <div className="mt-20 bg-secondary dark:bg-background-7 text-white rounded-[24px] p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="space-y-2 py-4 md:py-0 px-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-ns-yellow/20 text-ns-yellow flex items-center justify-center mb-3">
                  <Icon icon="solar:shield-check-bold" className="size-6" />
                </div>
                <h4 className="text-heading-5 font-bold font-interTight">
                  Forever Free Default Tier
                </h4>
                <p className="text-tagline-2 text-accent/70">
                  Every account starts with our free tier. Upgrade only when your brand scales.
                </p>
              </div>

              <div className="space-y-2 py-4 md:py-0 px-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-ns-green/20 text-ns-green flex items-center justify-center mb-3">
                  <Icon
                    icon="solar:users-group-two-rounded-bold"
                    className="size-6"
                  />
                </div>
                <h4 className="text-heading-5 font-bold font-interTight">
                  Generous Team Seats
                </h4>
                <p className="text-tagline-2 text-accent/70">
                  Invite your team and clients without paying up to $45/month
                  extra per team member.
                </p>
              </div>

              <div className="space-y-2 py-4 md:py-0 px-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-ns-red/20 text-ns-red flex items-center justify-center mb-3">
                  <Icon icon="solar:bolt-bold" className="size-6" />
                </div>
                <h4 className="text-heading-5 font-bold font-interTight">
                  MCP Agent Ready
                </h4>
                <p className="text-tagline-2 text-accent/70">
                  Connect autonomous coding and research agents via standard
                  Model Context Protocol.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Feature Comparison Matrix */}
          <div className="mt-24 space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <span className="badge badge-green">Detailed Breakdown</span>
              <h2 className="text-heading-3 font-bold text-secondary dark:text-accent font-interTight">
                Compare All Plan Features
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                Transparent technical limits, seat allowances, and automated
                workflows.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 shadow-sm">
              <table className="w-full text-tagline-2 text-left">
                <thead>
                  <tr className="border-b border-stroke-4 dark:border-stroke-8 bg-background-2/50 dark:bg-background-7/50 text-[11px] font-black uppercase tracking-wider text-secondary/70 dark:text-accent/70">
                    <th className="py-4 px-6">Feature</th>
                    <th className="py-4 px-4 text-center">Free</th>
                    <th className="py-4 px-4 text-center">Starter</th>
                    <th className="py-4 px-4 text-center text-primary-500 font-black">
                      Pro (Popular)
                    </th>
                    <th className="py-4 px-4 text-center">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-4 dark:divide-stroke-8">
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-background-2/40 dark:hover:bg-background-7/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-secondary/90 dark:text-accent/90">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-ns-green mx-auto"
                            />
                          ) : (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="size-5 text-secondary/20 dark:text-accent/20 mx-auto"
                            />
                          )
                        ) : (
                          <span className="font-bold text-secondary dark:text-accent">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-ns-green mx-auto"
                            />
                          ) : (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="size-5 text-secondary/20 dark:text-accent/20 mx-auto"
                            />
                          )
                        ) : (
                          <span className="font-bold text-secondary dark:text-accent">
                            {row.starter}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center bg-primary-500/5">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-primary-500 mx-auto"
                            />
                          ) : (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="size-5 text-secondary/20 dark:text-accent/20 mx-auto"
                            />
                          )
                        ) : (
                          <span className="font-black text-primary-500">
                            {row.pro}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.agency === "boolean" ? (
                          row.agency ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-ns-green mx-auto"
                            />
                          ) : (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="size-5 text-secondary/20 dark:text-accent/20 mx-auto"
                            />
                          )
                        ) : (
                          <span className="font-bold text-secondary dark:text-accent">
                            {row.agency}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing FAQs */}
          <div className="mt-24 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="badge badge-yellow">
                Frequently Asked Questions
              </span>
              <h2 className="text-heading-3 font-bold text-secondary dark:text-accent font-interTight">
                Got questions? We have answers.
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-secondary dark:text-accent hover:text-primary-500 transition-colors"
                  >
                    <span className="text-tagline-1">{faq.q}</span>
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className={`size-5 shrink-0 transition-transform duration-300 ${
                        openFaq === idx
                          ? "rotate-180 text-primary-500"
                          : "text-secondary/40 dark:text-accent/40"
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-tagline-2 text-secondary/70 dark:text-accent/70 leading-relaxed border-t border-stroke-4 dark:border-stroke-8 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
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
