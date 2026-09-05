import * as React from "react";
import { Link } from "@tanstack/react-router";
import { HeroInteractiveScanner } from "@/client/marketing/components/HeroInteractiveScanner";

export function TemplateHero() {
  return (
    <section className="bg-[url('/images/ns-img-55.svg')] bg-top bg-no-repeat pt-[140px] md:pt-[160px] lg:pt-[180px] xl:pt-[210px] pb-16 dark:bg-[url('/images/ns-img-dark-34.svg')]">
      <div className="main-container">
        <div className="space-y-[40px] md:space-y-[50px] lg:space-y-[60px] xl:space-y-[70px]">
          <div className="flex flex-col items-center">
            {/* Badge */}
            <span className="badge badge-green mb-3 md:mb-4 lg:mb-5">
              Over 50,000 reliable companies trust Skorvia
            </span>

            {/* Headline & Subtitle */}
            <div className="space-y-3 md:mx-10 md:space-y-4 lg:mx-0 text-center">
              <h1 className="max-w-[842px] text-heading-3 sm:text-heading-2 md:text-heading-1 font-bold text-secondary dark:text-accent leading-[1.1] mx-auto">
                Showcasing the cutting edge of SEO, Ad Spying & AI Search
              </h1>
              <p className="max-w-[640px] mx-auto text-tagline-1 text-secondary/60 dark:text-accent/60">
                Stop overpaying $199+/mo per user seat. Spy on winning competitor ads across 4 networks, dominate AI Search citations, and recover lost revenue without seat limits.
              </p>
            </div>

            {/* CTAs */}
            <ul className="flex w-full flex-col items-center justify-center gap-y-3 pt-8 text-center sm:w-auto sm:flex-row md:gap-x-4 md:pt-10 lg:pt-12">
              <li className="w-full sm:w-auto">
                <Link
                  to="/sign-up"
                  className="btn btn-primary hover:btn-secondary btn-xl dark:hover:btn-white w-[90%] sm:w-auto shadow-md"
                >
                  Get started free
                </Link>
              </li>
              <li className="w-full sm:w-auto">
                <a
                  href="#scanner-sandbox"
                  className="btn btn-white hover:btn-primary btn-xl dark:btn-transparent w-[90%] sm:w-auto shadow-xs"
                >
                  Try live scanner
                </a>
              </li>
            </ul>
          </div>

          {/* Perspective Container with Interactive Sandbox */}
          <div id="scanner-sandbox" className="hero-perspective-wrap px-2 sm:px-4 lg:px-6 xl:px-0">
            <figure className="hero-perspective-card rounded-2xl overflow-hidden shadow-2xl border border-stroke-3 dark:border-stroke-7 bg-background-1 dark:bg-background-6">
              <HeroInteractiveScanner />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
