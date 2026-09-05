import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";

export interface FeatureGateTeaserProps {
  featureName: string;
  requiredPlan?: "Pro" | "Agency" | "Enterprise";
  description?: string;
  bulletPoints?: string[];
  isLocked?: boolean;
  children: React.ReactNode;
}

export function FeatureGateTeaser({
  featureName,
  requiredPlan = "Pro",
  description,
  bulletPoints = [
    "Full access to advanced AI & SEO intelligence tools",
    "Increased monthly API crawl & keyword limits",
    "Priority background processing & scheduled PDF reports",
  ],
  isLocked = false,
  children,
}: FeatureGateTeaserProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-base-300">
      {/* Blurred Preview Content */}
      <div className="filter blur-md opacity-30 select-none pointer-events-none p-4 min-h-[340px]">
        {children}
      </div>

      {/* Floating Glassmorphic Upgrade Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-base-100/60 backdrop-blur-xs">
        <div className="w-full max-w-lg rounded-3xl border border-primary/20 bg-base-100/95 p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/25">
            <Icon icon="solar:lock-keyhole-bold-duotone" className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-wider">
              <span>{requiredPlan} Plan Exclusive</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
              Unlock {featureName}
            </h3>
            <p className="text-xs text-base-content/70 max-w-sm mx-auto leading-relaxed">
              {description ||
                `Upgrade your ${BRAND_CONFIG.name} subscription to the ${requiredPlan} tier to access ${featureName} and scale your organic visibility.`}
            </p>
          </div>

          {bulletPoints.length > 0 && (
            <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300 text-left space-y-2 text-xs">
              {bulletPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-base-content/80"
                >
                  <Icon
                    icon="solar:check-circle-bold"
                    className="h-4 w-4 text-primary shrink-0"
                  />
                  <span className="font-medium">{point}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/billing"
              className="btn btn-primary w-full sm:w-auto rounded-2xl font-black text-white shadow-lg shadow-primary/25 gap-2 px-8"
            >
              <Icon icon="solar:rocket-bold" className="h-4 w-4" />
              <span>Upgrade to {requiredPlan}</span>
            </Link>
            <Link
              to="/pricing"
              className="btn btn-ghost w-full sm:w-auto rounded-2xl font-bold text-xs"
            >
              View Plan Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
