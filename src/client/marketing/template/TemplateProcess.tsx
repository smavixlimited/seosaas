import * as React from "react";
import { Link } from "@tanstack/react-router";

const processStepsData = [
  {
    id: 1,
    stepNumber: "Step 1",
    iconClass: "ns-shape-35",
    title: "Input Domains & Competitors",
    description: "Launch your project with zero complicated tracking script installs. We fetch live SERP, backlink, and ad intelligence instantly.",
  },
  {
    id: 2,
    stepNumber: "Step 2",
    iconClass: "ns-shape-12",
    title: "Uncover Revenue Leaks & Ad Angles",
    description: "Our automated algorithms surface keywords in positions 11-20 and top competitor ad creatives running for 30+ days.",
  },
  {
    id: 3,
    stepNumber: "Step 3",
    iconClass: "ns-shape-6",
    title: "Capture Page 1 Traffic & Citations",
    description: "Execute prioritized action checklists, secure AI Answer Engine citations, and generate 1-click client/board PDF reports.",
  },
];

export function TemplateProcess() {
  return (
    <section className="dark:bg-background-5 py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px] bg-background-2">
      <div className="main-container">
        <div className="space-y-[50px] md:space-y-[60px] lg:space-y-[70px]">
          {/* Header */}
          <div className="mx-auto w-full max-w-[736px] space-y-4 text-center">
            <span className="badge badge-green mb-3">Process</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                A simple, outcome-driven growth framework.
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                Follow our straightforward 3-step workflow to outrank competitors and capture high-intent buyers.
              </p>
            </div>
          </div>

          {/* Process Cards */}
          <div className="flex flex-wrap items-center justify-center gap-6 pb-6">
            {processStepsData.map((step) => (
              <div
                key={step.id}
                className="dark:bg-background-6 w-full max-w-[390px] space-y-4 rounded-[20px] bg-white p-8 text-left border border-stroke-3/50 dark:border-stroke-7 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Step Number & Shape Icon */}
                <div className="space-y-8">
                  <span className="badge badge-gray-light text-xs font-bold">
                    {step.stepNumber}
                  </span>
                  <div>
                    <span className={`${step.iconClass} text-secondary dark:text-accent text-[54px]`} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-heading-5 font-bold text-secondary dark:text-accent">
                    {step.title}
                  </h3>
                  <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex w-full items-center justify-center pt-2">
            <Link
              to="/sign-up"
              className="btn btn-primary btn-lg md:btn-xl hover:btn-secondary dark:hover:btn-white w-full sm:w-auto shadow-md"
            >
              Try it for 14 days, no credit card required
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateProcess;
