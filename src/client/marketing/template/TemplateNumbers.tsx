import * as React from "react";

export function TemplateNumbers() {
  return (
    <section className="dark:bg-background-6 bg-white py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px]">
      <div className="main-container">
        <div className="flex flex-col items-center justify-between gap-8 xl:flex-row xl:gap-12">
          {/* Heading */}
          <div className="space-y-4 text-center xl:max-w-[442px] xl:text-left">
            <span className="badge badge-green mb-3">By The Numbers</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Proven search impact that compounds monthly.
              </h2>
              <p className="max-w-[780px] text-tagline-1 text-secondary/60 dark:text-accent/60 leading-relaxed">
                Our high-throughput data engines process millions of daily SERP data points, competitor ad variations, and citation graphs with enterprise precision.
              </p>
            </div>
          </div>

          {/* Number Cards */}
          <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row w-full xl:w-auto">
            {/* Card 1 */}
            <div className="bg-background-2 dark:bg-background-5 flex w-full max-w-[365px] flex-1 flex-col justify-between gap-y-12 rounded-[20px] p-8 border border-stroke-3/50 dark:border-stroke-7 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-heading-5 font-bold text-secondary dark:text-accent basis-[200px]">
                  Relied upon by businesses
                </h3>
                <span className="ns-shape-47 text-secondary dark:text-accent text-[52px]" />
              </div>
              <div className="space-y-1">
                <p className="text-heading-2 font-bold text-secondary dark:text-accent flex items-center">
                  83<span className="text-primary-500 font-bold ml-0.5">%</span>
                </p>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 font-medium">
                  Avg. Page-1 Opportunity Win Rate
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-background-2 dark:bg-background-5 flex w-full max-w-[365px] flex-1 flex-col justify-between gap-y-12 rounded-[20px] p-8 border border-stroke-3/50 dark:border-stroke-7 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-heading-5 font-bold text-secondary dark:text-accent basis-[200px]">
                  Daily SERP Precision
                </h3>
                <span className="ns-shape-57 text-secondary dark:text-accent text-[52px]" />
              </div>
              <div className="space-y-1">
                <p className="text-heading-2 font-bold text-secondary dark:text-accent flex items-center">
                  99.8<span className="text-primary-500 font-bold ml-0.5">%</span>
                </p>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 font-medium">
                  Real-Time Verified Accuracy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
