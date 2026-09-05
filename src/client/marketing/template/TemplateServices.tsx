import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export function TemplateServices() {
  const services = [
    {
      id: "trust-gate",
      badge: "Pre-Ad Verification",
      icon: "solar:shield-check-bold",
      title: "Audience Trust & Sentiment Pre-Ad Gate",
      description: "Verify your landing page credibility and sentiment score before spending a single dollar on paid Meta, Google, or TikTok ads.",
      link: "/features/conversion-ad-readiness",
      metric: "Save 40%+ on wasted ad spend",
    },
    {
      id: "local-grid",
      badge: "Local Domination",
      icon: "solar:map-point-wave-bold",
      title: "13x13 Google Maps Geo-Grid Explorer",
      description: "Pinpoint your Google Maps local pack ranking block-by-block across entire cities. Know exactly where competitors steal your local phone calls.",
      link: "/features/local-business",
      metric: "3x to 13x visual geo-grid",
    },
    {
      id: "viral-detector",
      badge: "Viral Growth",
      icon: "solar:fire-bold",
      title: "Viral Trend & High-CTR Hook Detector",
      description: "Discover breakout topic opportunities, winning content angles, and high-converting video hooks across your niche before competitors catch on.",
      link: "/features/prompt-explorer",
      metric: "Real-time niche trend signals",
    },
  ];

  return (
    <section className="bg-base-100 dark:bg-[#070b10] py-20 lg:py-28">
      <div className="main-container">
        <div className="space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <div className="badge-green">
              <Icon icon="solar:widget-bold" className="h-3.5 w-3.5" />
              <span>Full-Spectrum Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-base-content leading-tight">
              Tools That Give You An Unfair Advantage.
            </h2>
            <p className="text-base text-base-content/70 font-medium">
              Engineered for founders, agencies, and high-growth brands who demand actionable intelligence over passive charts.
            </p>
          </div>

          {/* 3-Card Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => (
              <article
                key={svc.id}
                className="group relative flex flex-col justify-between rounded-[24px] bg-base-200/50 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 p-8 transition-all duration-300 hover:translate-y-[-8px] hover:border-primary/40 hover:shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon icon={svc.icon} className="h-7 w-7" />
                    </div>
                    <span className="badge badge-sm badge-outline font-bold text-base-content/70">
                      {svc.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-base-content group-hover:text-primary transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed font-medium">
                      {svc.description}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-base-300/60 dark:border-white/5 flex items-center justify-between mt-6">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {svc.metric}
                  </span>
                  <Link
                    to={svc.link as any}
                    className="btn btn-sm btn-ghost text-primary font-bold hover:bg-primary/10 gap-1 rounded-xl"
                  >
                    <span>View Feature</span>
                    <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
