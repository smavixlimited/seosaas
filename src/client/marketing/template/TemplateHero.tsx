import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "twemoji:flag-united-states" },
  { code: "GB", name: "United Kingdom", flag: "twemoji:flag-united-kingdom" },
  { code: "CA", name: "Canada", flag: "twemoji:flag-canada" },
  { code: "AU", name: "Australia", flag: "twemoji:flag-australia" },
  { code: "DE", name: "Germany", flag: "twemoji:flag-germany" },
  { code: "FR", name: "France", flag: "twemoji:flag-france" },
  { code: "NG", name: "Nigeria", flag: "twemoji:flag-nigeria" },
  { code: "GLOBAL", name: "Global", flag: "solar:global-bold-duotone" },
];

const POPULAR_DOMAINS = ["notion.so", "shopify.com", "linear.app", "stripe.com", "clickup.com"];

export function TemplateHero() {
  const navigate = useNavigate();
  const [domainInput, setDomainInput] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = React.useState(false);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/sign-up" });
  };

  const handleQuickSelect = (domain: string) => {
    setDomainInput(domain);
    void navigate({ to: "/sign-up" });
  };

  return (
    <section className="relative pt-[130px] md:pt-[150px] lg:pt-[170px] xl:pt-[190px] pb-16 overflow-hidden bg-background-2 dark:bg-background-5">
      {/* Background Radial Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="main-container">
        <div className="space-y-[36px] md:space-y-[48px] lg:space-y-[56px]">
          {/* Main Hero Header */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4 md:space-y-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-brand-300 text-xs sm:text-tagline-2 font-bold border border-primary/20 shadow-xs">
              <Icon icon="solar:stars-bold" className="size-4 text-amber-500 animate-pulse" />
              <span>Next-Gen Search & Answer Engine Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-heading-3 sm:text-heading-2 md:text-heading-1 font-bold text-secondary dark:text-accent leading-[1.08] tracking-tight font-interTight">
              Dominate Organic Search & AI Answer Engines
            </h1>

            {/* Subhead */}
            <p className="max-w-2xl text-tagline-1 sm:text-heading-6 text-secondary dark:text-accent font-normal leading-relaxed">
              Uncover high-intent buyer keywords, spy on winning competitor ad strategies, track ChatGPT & Perplexity AI citations, and automate site audits without seat limits.
            </p>

            {/* Semrush-Style Search & Audit Bar */}
            <div className="w-full max-w-3xl pt-3 sm:pt-4">
              <form
                onSubmit={handleScanSubmit}
                className="rounded-2xl sm:rounded-full bg-white dark:bg-background-6 border-2 border-stroke-3 dark:border-stroke-7 p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
              >
                {/* Search Icon & Input */}
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Icon
                    icon="solar:magnifer-bold-duotone"
                    className="size-5 text-primary shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Enter any domain, competitor URL, or keyword (e.g. shopify.com)..."
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="w-full bg-transparent text-sm sm:text-base text-secondary dark:text-accent placeholder:text-secondary/60 dark:placeholder:text-accent/60 font-medium focus:outline-none"
                  />
                </div>

                {/* Country Selector Dropdown */}
                <div className="relative shrink-0 border-t sm:border-t-0 sm:border-l border-stroke-3 dark:border-stroke-7 pt-2 sm:pt-0 sm:pl-2">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-secondary dark:text-accent hover:bg-background-2 dark:hover:bg-background-7 w-full sm:w-auto"
                  >
                    <Icon icon={selectedCountry.flag} className="size-4 shrink-0" />
                    <span>{selectedCountry.code}</span>
                    <Icon icon="solar:alt-arrow-down-linear" className="size-3 text-secondary dark:text-accent" />
                  </button>

                  {isCountryOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-background-6 border border-stroke-3 dark:border-stroke-7 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setIsCountryOpen(false);
                          }}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                            selectedCountry.code === c.code
                              ? "bg-primary/10 text-primary dark:text-brand-300 font-bold"
                              : "text-secondary dark:text-accent hover:bg-background-2 dark:hover:bg-background-7"
                          }`}
                        >
                          <Icon icon={c.flag} className="size-4" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-md sm:btn-lg rounded-xl sm:rounded-full font-bold text-white shadow-md gap-2 shrink-0 px-6 sm:px-8"
                >
                  <span>Start Free Analysis</span>
                  <Icon icon="solar:arrow-right-bold" className="size-4" />
                </button>
              </form>

              {/* Quick Sample Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-secondary dark:text-accent">
                <span className="font-semibold text-secondary dark:text-accent">Try instant sample:</span>
                {POPULAR_DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleQuickSelect(domain)}
                    className="px-2.5 py-0.5 rounded-lg bg-white/60 dark:bg-background-6/60 border border-stroke-3/60 dark:border-stroke-7 hover:border-primary hover:text-primary transition-all font-mono text-[11px]"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Value Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 w-full max-w-3xl">
              <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/60 dark:bg-background-6/60 p-3 text-center backdrop-blur-xs">
                <div className="text-base sm:text-lg font-extrabold text-secondary dark:text-accent">1.2B+</div>
                <div className="text-[11px] text-secondary dark:text-accent font-medium">Keywords Tracked</div>
              </div>
              <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/60 dark:bg-background-6/60 p-3 text-center backdrop-blur-xs">
                <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">99.4%</div>
                <div className="text-[11px] text-secondary dark:text-accent font-medium">Audit Accuracy</div>
              </div>
              <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/60 dark:bg-background-6/60 p-3 text-center backdrop-blur-xs">
                <div className="text-base sm:text-lg font-extrabold text-primary dark:text-brand-300">50+ Engines</div>
                <div className="text-[11px] text-secondary dark:text-accent font-medium">Google, Bing, AI SGE</div>
              </div>
              <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/60 dark:bg-background-6/60 p-3 text-center backdrop-blur-xs">
                <div className="text-base sm:text-lg font-extrabold text-secondary dark:text-accent">0 Seat Limits</div>
                <div className="text-[11px] text-secondary dark:text-accent font-medium">Unlimited Team Access</div>
              </div>
            </div>
          </div>

          {/* Perspective Container with Dashboard Visual Showcase */}
          <div className="hero-perspective-wrap px-2 sm:px-4 lg:px-6 xl:px-0">
            <figure className="hero-perspective-card relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stroke-3/80 dark:border-stroke-7 bg-background-1 dark:bg-background-6 ring-1 ring-black/5 dark:ring-white/10 group">
              {/* Window Header / Browser Chrome */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-background-7/80 backdrop-blur-md border-b border-stroke-3/60 dark:border-stroke-7">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-400/80" />
                  <div className="size-3 rounded-full bg-amber-400/80" />
                  <div className="size-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-lg bg-background-2 dark:bg-background-5 border border-stroke-3/50 dark:border-stroke-7 text-xs font-mono text-secondary/60 dark:text-accent/60 max-w-sm w-full justify-center">
                  <Icon icon="solar:lock-bold" className="size-3 text-emerald-500" />
                  <span>https://app.skorvia.com/overview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Intelligence
                  </span>
                </div>
              </div>

              {/* Dashboard Preview Image */}
              <div className="relative overflow-hidden bg-background-5">
                <img
                  src="/images/dashboard-preview.jpg"
                  alt="Skorvia AI Search, SEO and Competitor Intelligence Dashboard"
                  className="w-full h-auto object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-1/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

