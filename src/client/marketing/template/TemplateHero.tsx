import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { HeroInteractiveScanner } from "@/client/marketing/components/HeroInteractiveScanner";

export function TemplateHero() {
  return (
    <section className="relative overflow-hidden bg-[url('/images/template/ns-img-55.svg')] bg-top bg-no-repeat pt-[130px] lg:pt-[160px] xl:pt-[190px] pb-16 dark:bg-[url('/images/template/ns-img-dark-34.svg')]">
      <div className="main-container">
        <div className="space-y-[40px] md:space-y-[50px] lg:space-y-[60px]">
          {/* Headline & Badges */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
            <div className="badge-green mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Next-Gen SEO + Competitor Ad Spy + AI Search AEO</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-base-content leading-[1.1]">
              Outrank Your Competitors. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                Spy On Their Ads & Dominate AI Search.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto font-medium leading-relaxed">
              Stop overpaying $199+/mo for legacy SEO bloat. {BRAND_CONFIG.name} gives you multi-network competitor ad spying, live Google Maps Geo-Grid, real-time rank tracking, and AI Answer Engine citation defense—with zero seat penalties.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-xl px-8 h-12 font-bold text-white shadow-lg shadow-primary/25 border-none gap-2 hover:scale-[1.02] transition-transform"
              >
                <span>Start Free 14-Day Trial</span>
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </Link>
              <Link
                to="/free-audit"
                className="btn btn-white rounded-xl px-6 h-12 font-bold border border-base-300 gap-2 hover:bg-base-200 transition-colors"
              >
                <Icon icon="solar:magnifer-linear" className="h-4 w-4 text-base-content/60" />
                <span>Free Full Health Scan</span>
              </Link>
            </div>
          </div>

          {/* Perspective Container with Interactive Sandbox */}
          <div className="hero-perspective-wrap px-0 sm:px-4 lg:px-8">
            <div className="hero-perspective-card">
              <HeroInteractiveScanner />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
