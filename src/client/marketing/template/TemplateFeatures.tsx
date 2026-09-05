import * as React from "react";
import { Link } from "@tanstack/react-router";

export function TemplateFeatures() {
  return (
    <section className="dark:bg-background-6 bg-white pt-[80px] pb-[80px] md:pt-[100px] md:pb-[85px] xl:pt-[140px] xl:pb-[100px]">
      <div className="main-container">
        <div className="flex flex-col items-center space-y-[40px] md:space-y-[50px] lg:space-y-[60px] xl:space-y-[70px]">
          {/* Header */}
          <div className="mx-auto max-w-[628px] space-y-4 text-center">
            <span className="badge badge-green mb-3 md:mb-4 lg:mb-5">Core Features</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Discover our cutting-edge SEO &amp; growth features.
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                Eliminate the 50 confusing submenus of legacy suites. Focus on the core revenue drivers that win.
              </p>
            </div>
          </div>

          {/* 3-Card Bento Grid */}
          <div className="flex flex-col items-center justify-center gap-8 xl:flex-row w-full">
            {/* Card One: Competitor Ad Spying */}
            <article className="bg-background-3 dark:bg-background-5 relative h-[493px] w-full max-w-[408px] space-y-[72px] overflow-hidden rounded-[20px] px-0 pt-[29px] sm:px-2.5">
              <div className="mx-auto max-w-[350px] space-y-3 pl-4 text-center xl:text-left">
                <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
                  Multi-Network Ad Spying
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60">
                  Spy on winning Meta, Google, TikTok, and LinkedIn ad creatives from any competitor with zero user ad accounts needed.
                </p>
              </div>

              {/* Tilted Floating Box (-7deg) */}
              <div className="group dark:bg-background-8 absolute top-[44%] left-[7%] flex w-full max-w-[350px] -rotate-7 flex-col items-center justify-center gap-y-6 overflow-hidden rounded-2xl bg-white px-6 py-8 shadow-xl transition-transform duration-500 hover:rotate-0">
                <div className="w-full space-y-3">
                  {/* Avatar Stack */}
                  <div className="flex justify-center -space-x-3.5">
                    <img
                      className="bg-ns-green inline-block size-11 rounded-full ring-4 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-1.png"
                      alt="Marketer avatar 1"
                    />
                    <img
                      className="bg-ns-green inline-block size-11 rounded-full ring-4 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-2.png"
                      alt="Marketer avatar 2"
                    />
                    <img
                      className="bg-ns-green inline-block size-11 rounded-full ring-4 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-3.png"
                      alt="Marketer avatar 3"
                    />
                    <div className="bg-ns-green relative z-10 inline-flex size-11 items-center justify-center overflow-hidden rounded-full ring-4 ring-white dark:ring-black">
                      <img
                        src="/images/icons/arrow-up-right.svg"
                        alt="Arrow Icon"
                        className="size-4"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-heading-6 font-bold text-secondary dark:text-accent">
                      20k+ Winning Ads
                    </p>
                    <p className="text-tagline-3 text-secondary/70 dark:text-accent/70">
                      Real-time competitor creative monitoring
                    </p>
                  </div>
                </div>

                {/* SVG Graphic */}
                <figure className="h-[120px] w-[280px] overflow-hidden">
                  <img
                    src="/images/ns-img-53.svg"
                    alt="Creative metrics graphic"
                    className="size-full object-contain dark:hidden"
                  />
                  <img
                    src="/images/ns-img-dark-32.svg"
                    alt="Creative metrics graphic"
                    className="hidden size-full object-contain dark:block"
                  />
                </figure>
              </div>
            </article>

            {/* Card Two: Revenue Leak Recovery (Green Card) */}
            <article className="bg-ns-green h-[493px] w-full max-w-[408px] space-y-[72px] overflow-hidden rounded-[20px] pt-[29px] sm:px-[29px] p-6">
              <div className="space-y-3 text-center xl:text-left">
                <h3 className="text-secondary text-heading-5 font-bold">
                  Revenue Leak Recovery
                </h3>
                <p className="text-secondary/70 text-tagline-2">
                  Push position 11-20 keywords to Page 1 for high-intent buyers ready to purchase today.
                </p>
              </div>

              {/* Dark Inner Box with Bar Chart */}
              <div className="bg-secondary w-full space-y-7 rounded-2xl px-6 py-7 shadow-lg">
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-accent text-heading-6 font-bold">Pipeline Revenue</h4>
                    <p className="text-ns-green text-tagline-2 font-bold">+185%</p>
                  </div>
                  <p className="text-accent/60 text-heading-5 font-black">+$14,850/mo</p>
                </div>

                {/* 7 Vertical Bars */}
                <div className="flex items-end justify-between gap-3 pb-4 h-[140px]">
                  <div className="bg-ns-green h-[85px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[55px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[120px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[75px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[100px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[135px] w-4 rounded-t-full" />
                  <div className="bg-ns-green h-[40px] w-4 rounded-t-full" />
                </div>
              </div>
            </article>

            {/* Card Three: AI Search & AEO Citation Radar */}
            <article className="bg-background-3 dark:bg-background-5 relative h-[493px] w-full max-w-[408px] space-y-[72px] overflow-hidden rounded-[20px] px-0 pt-[29px] sm:px-2.5">
              <div className="mx-auto max-w-[350px] space-y-3 pl-4 text-center xl:text-left">
                <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
                  AI Answer Engine Citations
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60">
                  Ensure ChatGPT, Perplexity, and Claude cite and recommend your brand for high-value queries.
                </p>
              </div>

              {/* Tilted Floating Box (+7deg) */}
              <div className="group dark:bg-background-8 absolute top-[43%] -right-1.5 w-[350px] rotate-7 space-y-4 rounded-2xl bg-white px-6 py-7 shadow-xl transition-transform duration-500 hover:rotate-0 sm:right-[8%]">
                <div className="flex w-full items-center justify-between">
                  <h4 className="text-heading-6 font-bold text-secondary dark:text-accent">
                    Engine Citations
                  </h4>
                  <span className="badge badge-green text-[11px] font-bold">#1 Ranked</span>
                </div>

                {/* Line Chart Graphic */}
                <figure className="w-full">
                  <img
                    src="/images/ns-img-54.svg"
                    alt="Citation trajectory chart"
                    className="w-full dark:hidden"
                  />
                  <img
                    src="/images/ns-img-dark-33.svg"
                    alt="Citation trajectory chart"
                    className="hidden w-full dark:block"
                  />
                </figure>

                {/* Avatar Stack */}
                <div className="flex items-center justify-between pt-2 border-t border-stroke-3 dark:border-stroke-7">
                  <div className="flex items-center -space-x-2">
                    <img
                      className="size-7 rounded-full ring-2 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-1.png"
                      alt="Team avatar 1"
                    />
                    <img
                      className="size-7 rounded-full ring-2 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-2.png"
                      alt="Team avatar 2"
                    />
                    <img
                      className="size-7 rounded-full ring-2 ring-white dark:ring-black object-cover"
                      src="/images/ns-avatar-3.png"
                      alt="Team avatar 3"
                    />
                  </div>
                  <span className="text-tagline-3 font-semibold text-secondary dark:text-accent">
                    Cited in 4 Models
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateFeatures;
