import { createFileRoute, notFound } from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { captureClientEvent } from "@/client/lib/posthog";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { buildCheckoutSuccessUrl } from "@/client/features/billing/checkout-url";
import { BillingUsageChart } from "@/client/features/billing/BillingUsageChart";
import { BillingFeatureBreakdown } from "@/client/features/billing/BillingFeatureBreakdown";
import { parseTopUpAmount } from "@/client/features/billing/HostedBillingContentUtils";
import { getCustomerPlanStatus } from "@/client/features/billing/plan-detection";
import { useCurrency, CurrencySwitcher } from "@/client/lib/currency";
import {
  CheckoutModal,
  type PlanItem,
} from "@/client/components/billing/CheckoutModal";
import {
  submitCancellationSurveyServerFn,
  getUserCreditUsageServerFn,
} from "@/serverFunctions/retention";
import { getPublicPlansServerFn } from "@/serverFunctions/admin-plans";
import {
  AUTUMN_PAID_PLAN_ID,
  BILLING_ROUTE,
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_CREDITS_PER_USD,
  AUTUMN_SEO_DATA_TOP_UP_PLAN_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
  autumnSeoDataCreditsToUsd,
} from "@/shared/billing";

export const Route = createFileRoute("/_app/billing")({
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw notFound();
    }
  },
  component: BillingPage,
});

function BillingPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { currency, formatPrice } = useCurrency();
  const [topUpAmount, setTopUpAmount] = useState("10");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month",
  );

  // Gateway Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<PlanItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Cancellation Retention State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Too expensive");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  const customerQuery = useCustomer({
    queryOptions: {
      enabled: Boolean(session?.user?.id),
    },
  });

  const plansQuery = useQuery({
    queryKey: ["publicSaaSPlans"],
    queryFn: () => getPublicPlansServerFn({ data: {} }),
  });

  const planStatus = getCustomerPlanStatus(customerQuery.data);
  const isFreePlan = planStatus === "free";

  const monthlyRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data?.balances?.[AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]
      ?.remaining ?? 0,
  );
  const topUpRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data?.balances?.[AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]
      ?.remaining ?? 0,
  );
  const totalRemaining = monthlyRemaining + topUpRemaining;

  const creditUsageQuery = useQuery({
    queryKey: ["userCreditUsageTopBar"],
    queryFn: () => getUserCreditUsageServerFn(),
    refetchInterval: 10000,
  });

  const dbCredits = creditUsageQuery.data;
  const userCurrentPlanName =
    dbCredits?.planName ||
    (isFreePlan ? "Free Plan" : `${planStatus.toUpperCase()} Plan`);

  const liveCreditsRemaining = dbCredits
    ? dbCredits.creditsRemaining
    : totalRemaining > 0
      ? totalRemaining * AUTUMN_SEO_DATA_CREDITS_PER_USD
      : 50;
  const liveCreditsLimit = dbCredits ? dbCredits.monthlyCreditsLimit : 50;
  const liveCreditsUsed = dbCredits ? dbCredits.creditsUsed : 0;
  const liveBalanceUsd =
    totalRemaining > 0 ? totalRemaining : liveCreditsRemaining / 100;

  const { isValid: isValidTopUp, parsed: parsedTopUpAmount } =
    parseTopUpAmount(topUpAmount);

  function handlePlanCheckout(planOrId: string | PlanItem) {
    const planObj: PlanItem =
      typeof planOrId === "string"
        ? plans.find((p) => p.id === planOrId) || {
            id: planOrId,
            name: `${planOrId.toUpperCase()} Plan`,
            priceUsd: 29,
            priceNgn: 35000,
          }
        : planOrId;

    captureClientEvent("billing:checkout_start", { planId: planObj.id });
    setCheckoutPlan(planObj);
    setIsCheckoutOpen(true);
  }

  async function handleTopUpCheckout() {
    if (!isValidTopUp || parsedTopUpAmount < 5) {
      toast.error("Minimum refill amount is $5");
      return;
    }

    if (isFreePlan) {
      toast.error(
        "Credit refills are only available for active paid subscribers. Please upgrade your plan first.",
      );
      return;
    }

    captureClientEvent("billing:topup_start", { amount: parsedTopUpAmount });
    setError(null);
    setIsPending(true);
    try {
      const creditsToAdd = parsedTopUpAmount * AUTUMN_SEO_DATA_CREDITS_PER_USD;
      if (customerQuery.attach) {
        await customerQuery.attach({
          planId: AUTUMN_SEO_DATA_TOP_UP_PLAN_ID,
          featureQuantities: [
            {
              featureId: AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
              quantity: creditsToAdd,
            },
          ],
          redirectMode: "always",
          successUrl: buildCheckoutSuccessUrl(BILLING_ROUTE),
        });
      } else {
        toast.success(
          `Purchased $${parsedTopUpAmount} (${creditsToAdd.toLocaleString()} credits) refill!`,
        );
      }
    } catch (err) {
      const msg = getStandardErrorMessage(
        err,
        "Failed to initiate top-up checkout.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  async function handleOpenPortal() {
    setError(null);
    setIsPending(true);
    try {
      if (customerQuery.openCustomerPortal) {
        await customerQuery.openCustomerPortal();
      } else {
        toast.info("Customer portal is active.");
      }
    } catch (err) {
      toast.error(
        getStandardErrorMessage(err, "Could not open customer portal"),
      );
    } finally {
      setIsPending(false);
    }
  }

  const plans = plansQuery.data || [
    {
      id: "starter",
      name: "Starter",
      priceUsd: 49,
      priceNgn: 49000,
      limits: {
        maxDomains: 5,
        monthlyCredits: 500,
        auditPages: 5000,
        uptimeMonitors: 1,
      },
      features: {
        keyword_research: true,
        rank_tracker: true,
        site_audit: true,
        gbp_integration: true,
        ai_visibility: false,
        white_label_pdf: false,
        mcp_api_access: false,
      },
    },
    {
      id: "pro",
      name: "Pro Growth",
      priceUsd: 149,
      priceNgn: 149000,
      limits: {
        maxDomains: 20,
        monthlyCredits: 2500,
        auditPages: 50000,
        uptimeMonitors: 5,
      },
      features: {
        keyword_research: true,
        rank_tracker: true,
        site_audit: true,
        gbp_integration: true,
        ai_visibility: true,
        white_label_pdf: true,
        mcp_api_access: true,
      },
    },
    {
      id: "agency",
      name: "Agency & Enterprise",
      priceUsd: 349,
      priceNgn: 349000,
      limits: {
        maxDomains: 100,
        monthlyCredits: 10000,
        auditPages: 250000,
        uptimeMonitors: 50,
      },
      features: {
        keyword_research: true,
        rank_tracker: true,
        site_audit: true,
        gbp_integration: true,
        ai_visibility: true,
        white_label_pdf: true,
        mcp_api_access: true,
      },
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-xs uppercase tracking-wider">
              Subscription &amp; Credits
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              Billing Center
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-base-content mt-1">
            Plans, Usage &amp; Credit Refills
          </h1>
          <p className="text-xs text-base-content/60">
            Manage your subscription tiers, monitor data usage, and top up
            credits on demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isFreePlan && (
            <button
              type="button"
              onClick={handleOpenPortal}
              disabled={isPending}
              className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
            >
              <Icon icon="solar:card-2-bold" className="h-4 w-4" />
              <span>Manage Stripe Billing</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error rounded-2xl text-xs font-semibold">
          <Icon icon="solar:danger-triangle-bold" className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Section: Active Plan & Credit Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Active Tier Status */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-base-content/60">
              Current Plan
            </span>
            <span
              className={`badge font-bold text-xs ${isFreePlan ? "badge-warning" : "badge-success text-white"}`}
            >
              {isFreePlan
                ? "FREE TIER"
                : `${planStatus.toUpperCase()} SUBSCRIBER`}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-base-content capitalize font-mono">
              {userCurrentPlanName}
            </h3>
            <p className="text-xs text-base-content/60">
              {isFreePlan
                ? "Upgrade to unlock high-capacity site audits, AI Search Radar, and team members."
                : "Active subscription with full access to enterprise SEO & AEO tools."}
            </p>
          </div>

          <div className="pt-2 border-t border-base-200">
            {isFreePlan ? (
              <a
                href="#upgrade-plans-grid"
                className="btn btn-primary btn-sm rounded-xl w-full font-bold text-white shadow-md shadow-primary/20 gap-1.5"
              >
                <Icon icon="solar:bolt-bold" className="h-4 w-4" />
                <span>Upgrade to Paid Plan</span>
              </a>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-content/60 font-medium">Status</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="h-3.5 w-3.5"
                  />{" "}
                  Active &amp; Verified
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Credit Balance */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-base-content/60">
              Available Balance
            </span>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon icon="solar:database-bold-duotone" className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-base-content font-mono">
              ${liveBalanceUsd.toFixed(2)}
            </div>
            <div className="text-xs text-base-content/60 font-semibold font-mono">
              {liveCreditsRemaining.toLocaleString()} /{" "}
              {liveCreditsLimit.toLocaleString()} Credits Remaining
            </div>
          </div>

          <div className="pt-2 border-t border-base-200 text-xs space-y-1 text-base-content/70">
            <div className="flex justify-between">
              <span>Monthly Allowance:</span>
              <span className="font-mono font-bold">
                {liveCreditsLimit.toLocaleString()} Credits (~$
                {(liveCreditsLimit / 100).toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Credits Used This Month:</span>
              <span className="font-mono font-bold text-primary">
                {liveCreditsUsed.toLocaleString()} Credits
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Instant Credit Refill ($5 Minimum) */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-base-content/60">
              Credit Refill Top-up
            </span>
            <span className="badge badge-sm badge-ghost text-[10px] font-bold">
              Paid Feature
            </span>
          </div>

          <p className="text-xs text-base-content/60">
            Running low on credits? Add extra capacity instantly starting from{" "}
            <strong>$5 (500 credits)</strong>.
          </p>

          {isFreePlan ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
              Refill credits are reserved for active paid subscribers. Please
              choose a plan below to enable refills.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {["5", "10", "25", "50"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      topUpAmount === amt
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Custom ($5+)"
                  className="input input-bordered input-sm rounded-xl text-xs flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTopUpCheckout}
                  disabled={isPending || !isValidTopUp || parsedTopUpAmount < 5}
                  className="btn btn-primary btn-sm rounded-xl px-4 font-bold text-white shadow-md shadow-primary/20 gap-1.5"
                >
                  <Icon icon="solar:card-bold" className="h-4 w-4" />
                  <span>Refill Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Selection Grid (Enterprise Upgrade Matrix) */}
      <div id="upgrade-plans-grid" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-base-content tracking-tight">
              Select Your Subscription Plan
            </h2>
            <p className="text-xs text-base-content/60">
              Upgrade, downgrade, or switch billing cycles anytime with prorated
              billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Multi-Currency Switcher */}
            <CurrencySwitcher />

            {/* Monthly / Yearly Switch */}
            <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/40">
              <button
                type="button"
                onClick={() => setBillingInterval("month")}
                className={`join-item px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingInterval === "month"
                    ? "bg-primary text-white"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("year")}
                className={`join-item px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingInterval === "year"
                    ? "bg-primary text-white"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Yearly{" "}
                <span className="badge badge-success badge-xs text-[9px] text-white font-bold ml-1">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Tier Plan Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = planStatus === plan.id;
            const formattedPrice = formatPrice(
              billingInterval === "year"
                ? Math.round(plan.priceUsd * 0.8)
                : plan.priceUsd,
              billingInterval === "year"
                ? Math.round(plan.priceNgn * 0.8)
                : plan.priceNgn,
            );

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 transition-all duration-200 shadow-sm ${
                  plan.id === "pro"
                    ? "border-primary bg-base-100 ring-2 ring-primary/20 shadow-xl"
                    : "border-base-300 bg-base-100 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-base-content">
                        {plan.name}
                      </h3>
                      <span className="text-xs text-base-content/60">
                        {plan.id === "starter"
                          ? "For founders & boutique sites"
                          : plan.id === "pro"
                            ? "For growing teams & brands"
                            : "For agencies & scale-ups"}
                      </span>
                    </div>
                    {plan.id === "pro" && (
                      <span className="badge badge-primary font-black text-[10px] text-white">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-base-content font-mono">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-base-content/50 font-medium">
                      / month
                    </span>
                  </div>

                  {/* Limits List */}
                  <div className="p-4 rounded-2xl bg-base-200/40 space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-base-content/70">
                        Connected Brands:
                      </span>
                      <span className="font-bold font-mono text-base-content">
                        {plan.limits.maxDomains}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-base-content/70">
                        Monthly Credits:
                      </span>
                      <span className="font-bold font-mono text-base-content">
                        {plan.limits.monthlyCredits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-base-content/70">
                        Site Audit Pages:
                      </span>
                      <span className="font-bold font-mono text-base-content">
                        {plan.limits.auditPages.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-base-content/70">
                        Uptime &amp; SSL Monitors:
                      </span>
                      <span className="font-bold font-mono text-base-content">
                        {plan.limits.uptimeMonitors}
                      </span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center gap-2 text-base-content">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4 text-emerald-500 shrink-0"
                      />
                      <span>Keyword Research &amp; SERP Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4 text-emerald-500 shrink-0"
                      />
                      <span>Local Business &amp; Geo-Grid Map Tracker</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="h-4 w-4 text-emerald-500 shrink-0"
                      />
                      <span>Conversion &amp; Ad Readiness Audit (0–100)</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${plan.features.ai_visibility ? "text-base-content" : "text-base-content/40"}`}
                    >
                      <Icon
                        icon={
                          plan.features.ai_visibility
                            ? "solar:check-circle-bold"
                            : "solar:close-circle-bold"
                        }
                        className={`h-4 w-4 shrink-0 ${plan.features.ai_visibility ? "text-emerald-500" : "text-base-content/30"}`}
                      />
                      <span>AEO AI Search Radar &amp; Brand Mentions</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${plan.features.white_label_pdf ? "text-base-content" : "text-base-content/40"}`}
                    >
                      <Icon
                        icon={
                          plan.features.white_label_pdf
                            ? "solar:check-circle-bold"
                            : "solar:close-circle-bold"
                        }
                        className={`h-4 w-4 shrink-0 ${plan.features.white_label_pdf ? "text-emerald-500" : "text-base-content/30"}`}
                      />
                      <span>White-Label Client PDF Reports</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending || isCurrent}
                  onClick={() => handlePlanCheckout(plan)}
                  className={`btn btn-sm rounded-xl w-full font-bold transition-all ${
                    isCurrent
                      ? "btn-outline btn-disabled"
                      : plan.id === "pro"
                        ? "btn-primary text-white shadow-md shadow-primary/20"
                        : "btn-outline"
                  }`}
                >
                  {isCurrent ? "Current Active Plan" : `Select ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Analytics Breakdown */}
      <div className="pt-4 space-y-6">
        <h2 className="text-xl font-black text-base-content tracking-tight">
          Credit Usage &amp; Operation Logs
        </h2>
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <BillingUsageChart />
        </div>
      </div>

      {/* Payment Gateway Checkout Modal */}
      <CheckoutModal
        plan={checkoutPlan}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          void queryClient.invalidateQueries({
            queryKey: ["userCreditUsageTopBar"],
          });
          void queryClient.invalidateQueries({ queryKey: ["publicSaaSPlans"] });
          toast.success("Subscription updated successfully!");
        }}
      />
    </div>
  );
}
