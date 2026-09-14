import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BILLING_ROUTE } from "@/shared/billing";

interface FeatureUpgradeGateProps {
  featureTitle: string;
  featureDescription: string;
  requiredPlanName?: string;
  bullets?: string[];
  icon?: string;
}

export function FeatureUpgradeGate({
  featureTitle,
  featureDescription,
  requiredPlanName = "Starter or Pro Plan",
  bullets = [
    "Unlimited multi-network competitor intelligence",
    "Deep backlink intersections and live rank tracking",
    "High-converting AI automated SEO workflows",
  ],
  icon = "solar:lock-keyhole-bold-duotone",
}: FeatureUpgradeGateProps) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-base-100 to-base-100 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner">
        <Icon icon={icon} className="h-8 w-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
          <Icon icon="solar:crown-star-bold" className="h-3.5 w-3.5" />
          <span>Premium Feature</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-base-content">
          Unlock {featureTitle}
        </h2>
        <p className="text-sm text-base-content/70 leading-relaxed">
          {featureDescription}
        </p>
      </div>

      {bullets.length > 0 && (
        <div className="rounded-2xl border border-base-300/80 bg-base-200/40 p-4 max-w-md mx-auto text-left space-y-2.5">
          {bullets.map((b, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-xs font-semibold text-base-content/80"
            >
              <Icon
                icon="solar:check-circle-bold"
                className="h-4 w-4 text-primary shrink-0 mt-0.5"
              />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={BILLING_ROUTE}
          className="btn btn-primary font-bold px-8 rounded-xl text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform w-full sm:w-auto"
        >
          <Icon icon="solar:stars-minimalistic-bold" className="h-4 w-4" />
          <span>Upgrade to {requiredPlanName}</span>
        </Link>
        <Link
          to={BILLING_ROUTE}
          className="btn btn-ghost text-xs font-bold text-base-content/70 hover:text-base-content w-full sm:w-auto"
        >
          View All Plans & Pricing
        </Link>
      </div>
    </div>
  );
}
