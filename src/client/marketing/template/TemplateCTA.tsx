import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export function TemplateCTA() {
  return (
    <section className="bg-base-200/50 dark:bg-[#0f1217] py-20 border-t border-base-300 dark:border-white/5">
      <div className="main-container">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-primary via-indigo-700 to-emerald-600 p-8 sm:p-12 lg:p-16 text-white text-center shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-md">
            <Icon icon="solar:crown-bold" className="h-4 w-4 text-amber-300" />
            <span>Join 12,000+ Fast-Growing Brands</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Stop Losing High-Intent Customers To Your Competitors.
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-medium">
            Start your free 14-day trial now. Spy on competitor ads, track real-time rankings, and make AI engines cite your brand today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/sign-up"
              className="btn btn-lg bg-white text-primary hover:bg-white/90 rounded-2xl px-8 font-black shadow-xl border-none gap-2 hover:scale-[1.02] transition-transform"
            >
              <span>Get Started Free</span>
              <Icon icon="solar:arrow-right-linear" className="h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className="btn btn-lg btn-ghost text-white hover:bg-white/10 rounded-2xl px-8 font-bold border border-white/20"
            >
              <span>View Plans & Pricing</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
