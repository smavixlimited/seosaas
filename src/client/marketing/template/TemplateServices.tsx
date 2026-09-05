import * as React from "react";
import { Link } from "@tanstack/react-router";

const servicesList = [
  {
    slug: "competitor-ad-decoder",
    icon: "ns-shape-45",
    title: "Competitor Ad Decoder",
    description: "Monitor multi-network ad creatives, active dates, and copy frameworks across Meta, Google, and TikTok in real-time.",
    to: "/features/competitor-page-decoder",
  },
  {
    slug: "keyword-research",
    icon: "ns-shape-67",
    title: "Keyword Revenue Radar",
    description: "Discover intent clusters, search volume, CPC value, and position 11-20 low-hanging fruits ready to jump to Page 1.",
    to: "/features/keyword-research",
  },
  {
    slug: "ai-search-aeo",
    icon: "ns-shape-10",
    title: "AI Search & AEO Monitor",
    description: "Track how ChatGPT, Perplexity, and Claude cite your brand and safeguard your organic share of voice across answer engines.",
    to: "/features/ai-search-aeo",
  },
  {
    slug: "local-geo-grid",
    icon: "ns-shape-33",
    title: "Google Maps Geo-Grid",
    description: "Audit local 3-pack rankings across precise GPS coordinate grid points with competitor share-of-local comparisons.",
    to: "/features/local-business",
  },
  {
    slug: "executive-pdf-reports",
    icon: "ns-shape-56",
    title: "Executive PDF Reporting",
    description: "Generate 1-click white-label client and board reports with automated executive insights and action checklists.",
    to: "/features/white-label-reports",
  },
];

export function TemplateServices() {
  return (
    <section className="dark:bg-background-6 bg-white pt-[50px] pb-[80px] md:pt-[85px] xl:pt-[100px] xl:pb-[140px]">
      <div className="main-container">
        <div className="space-y-[40px] md:space-y-[50px] lg:space-y-[60px] xl:space-y-[70px]">
          {/* Section Heading */}
          <div className="mx-auto max-w-[810px] space-y-4 text-center lg:w-full">
            <span className="badge badge-green mb-3 md:mb-4 lg:mb-5">Our Services</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Leading growth teams around the globe rely on Skorvia.
              </h2>
              <p className="mx-auto max-w-[582px] sm:w-full text-tagline-1 text-secondary/60 dark:text-accent/60">
                A unified, flat-rate search intelligence workspace with zero seat limits, zero token taxes, and deep competitive insights.
              </p>
            </div>
          </div>

          {/* Service Cards */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {servicesList.map((service) => (
              <article key={service.slug}>
                <div className="bg-background-2 dark:bg-background-5 flex w-full max-w-[403px] flex-col items-center gap-6 rounded-[20px] px-6 py-8 transition-transform duration-500 ease-in-out hover:translate-y-[-10px] border border-stroke-3/50 dark:border-stroke-7 shadow-sm hover:shadow-md">
                  {/* Icon */}
                  <span className={`${service.icon} text-secondary dark:text-accent text-[54px]`} />

                  {/* Heading & Description */}
                  <div className="space-y-2 text-center">
                    <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
                      {service.title}
                    </h3>
                    <p className="text-tagline-2 text-secondary/60 dark:text-accent/60">
                      {service.description}
                    </p>
                  </div>

                  {/* Button */}
                  <div>
                    <Link
                      to={service.to}
                      className="btn btn-md btn-white-v2 hover:btn-secondary dark:btn-transparent dark:hover:btn-accent"
                    >
                      Explore Feature
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateServices;
