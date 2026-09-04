import { Link } from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getCustomerPlanStatus } from "@/client/features/billing/plan-detection";
import { getUserCreditUsageServerFn } from "@/serverFunctions/retention";
import {
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
  BILLING_ROUTE,
  LOW_CREDITS_THRESHOLD_USD,
  autumnSeoDataCreditsToUsd,
} from "@/shared/billing";

export function FreePlanBanner() {
  const { data: session } = useSession();
  const customerQuery = useCustomer({
    queryOptions: {
      enabled: Boolean(session?.user?.id),
    },
  });

  const creditUsageQuery = useQuery({
    queryKey: ["userCreditUsageTopBar"],
    queryFn: () => getUserCreditUsageServerFn(),
    refetchInterval: 10000,
  });

  if (customerQuery.isLoading || !customerQuery.data) {
    return null;
  }

  const planStatus = getCustomerPlanStatus(customerQuery.data);
  const isFreePlan = planStatus === "free";

  const monthlyRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data.balances?.[AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]
      ?.remaining ?? 0,
  );
  const topUpRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data.balances?.[AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]
      ?.remaining ?? 0,
  );
  const totalRemaining = monthlyRemaining + topUpRemaining;

  const dbCreditsRemaining = creditUsageQuery.data?.creditsRemaining ?? 500;
  const isOutOfCredits = totalRemaining <= 0 && dbCreditsRemaining <= 0;
  const isLowCredits =
    !isOutOfCredits && (totalRemaining < LOW_CREDITS_THRESHOLD_USD && dbCreditsRemaining < 20);

  const creditsActionLink = isFreePlan ? (
    <Link
      to={BILLING_ROUTE}
      className="link link-primary font-bold underline ml-1"
    >
      Upgrade your plan
    </Link>
  ) : (
    <Link to={BILLING_ROUTE} className="link link-primary font-bold underline ml-1">
      Buy more credits
    </Link>
  );

  if (isOutOfCredits) {
    return (
      <BannerShell variant="error">
        You&rsquo;ve used all your credits. {creditsActionLink} to continue
        using Skorvia.
      </BannerShell>
    );
  }

  if (isLowCredits) {
    return (
      <BannerShell variant="warning">
        You&rsquo;re running low on credits. {creditsActionLink} to keep using
        Skorvia.
      </BannerShell>
    );
  }

  if (isFreePlan) {
    return (
      <BannerShell variant="info">
        We hope you&rsquo;re enjoying Skorvia!{" "}
        <Link
          to={BILLING_ROUTE}
          className="link link-primary font-medium"
        >
          Upgrade anytime
        </Link>{" "}
        or{" "}
        <Link to="/support" className="link link-primary font-medium">
          reach out with questions
        </Link>
        .
      </BannerShell>
    );
  }

  return null;
}

function BannerShell({
  variant,
  children,
}: {
  variant: "info" | "warning" | "error";
  children: React.ReactNode;
}) {
  const alertClass =
    variant === "error"
      ? "alert-error"
      : variant === "warning"
        ? "alert-warning"
        : "alert-info";

  return (
    <div className="shrink-0 px-4 py-2.5 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className={`alert text-sm ${alertClass}`}>
          <span>{children}</span>
        </div>
      </div>
    </div>
  );
}
