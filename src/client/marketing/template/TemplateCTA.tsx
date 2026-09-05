import * as React from "react";
import { Link } from "@tanstack/react-router";

export function TemplateCTA() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/sign-up?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="dark:bg-background-6 bg-white py-[60px] md:py-[80px] lg:py-[100px] border-t border-stroke-3/50 dark:border-stroke-7" aria-label="CTA section">
      <div className="main-container">
        <div className="flex flex-col items-center justify-between gap-8 xl:flex-row xl:gap-12">
          {/* Left Text */}
          <div className="mx-3 max-w-[649px] space-y-4 text-center sm:mx-0 md:w-full xl:text-left">
            <span className="badge badge-green">Ready to outrank?</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Build a complete search &amp; ad engine without seat limits.
              </h2>
              <p className="text-tagline-1 text-secondary/60 dark:text-accent/60">
                Start your 14-day free trial today. Connect your domain in 60 seconds and see where your competitors are making money.
              </p>
            </div>
          </div>

          {/* Right Input Form & Checklist */}
          <div className="w-full max-w-[540px] space-y-4">
            <form onSubmit={handleSubmit} className="relative flex w-full flex-col gap-3 sm:flex-row items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full rounded-full border border-stroke-3 bg-background-1 px-5 py-3.5 text-tagline-1 text-secondary placeholder:text-secondary/50 focus:outline-none dark:border-stroke-7 dark:bg-background-5 dark:text-accent dark:placeholder:text-accent/50"
              />
              <button
                type="submit"
                className="btn btn-primary btn-xl w-full sm:w-auto shrink-0 shadow-md cursor-pointer"
              >
                Get started
              </button>
            </form>

            {/* Checklist */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 sm:gap-6 text-tagline-2 text-secondary/70 dark:text-accent/70 pt-1">
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-ns-green text-secondary font-bold text-[10px]">
                  ✓
                </span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-ns-green text-secondary font-bold text-[10px]">
                  ✓
                </span>
                <span>14-Day free access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full bg-ns-green text-secondary font-bold text-[10px]">
                  ✓
                </span>
                <span>Unlimited team seats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateCTA;
