import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { useCurrency } from "@/client/lib/currency";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchType, setSearchType] = React.useState<"domain" | "keyword">("domain");
  const [activeTab, setActiveTab] = React.useState<"classic" | "maps" | "aeo" | "reports">("classic");
  const [domainCount, setDomainCount] = React.useState(5);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    void navigate({ to: "/sign-up" });
  };

  // ROI Savings Calculator
  const legacyMonthlyCost = domainCount * 140; // Approx Semrush/Ahrefs cost per seat/domain
  const skorviaMonthlyCost = domainCount <= 1 ? 10 : domainCount <= 5 ? 49 : 149;
  const monthlySavings = legacyMonthlyCost - skorviaMonthlyCost;
  const annualSavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-primary/20 via-indigo-600/15 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-xs">
              <Icon icon="solar:stars-bold" className="h-4 w-4" />
              <span>Next-Gen SEO + AEO (Answer Engine Optimization)</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-base-content leading-[1.1]">
              Rank #1 on Google. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
                Dominate AI Search Answers.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-base-content/70 max-w-2xl mx-auto font-medium leading-relaxed">
              Stop overpaying \$199+/mo for legacy SEO suites. {BRAND_CONFIG.name} delivers high-velocity keyword tracking, live backlink audits, Local Maps Geo-Grid, and Answer Engine Optimization (AEO) for ChatGPT and Perplexity.
            </p>

            {/* Interactive Hero Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <form
                onSubmit={handleHeroSearch}
                className="flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl border border-base-300 bg-base-100 shadow-2xl ring-1 ring-black/5"
              >
                <div className="flex items-center pl-3 pr-2 gap-2 text-base-content/50 border-b sm:border-b-0 sm:border-r border-base-300 pb-2 sm:pb-0">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as "domain" | "keyword")}
                    className="select select-ghost select-sm text-xs font-bold focus:outline-none pl-1 pr-6"
                  >
                    <option value="domain">Domain Overview</option>
                    <option value="keyword">Keyword Explorer</option>
                  </select>
                </div>
                <div className="flex-1 flex items-center px-3 py-1">
                  <Icon icon="solar:magnifer-linear" className="h-4 w-4 text-base-content/40 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === "domain"
                        ? "Enter competitor domain (e.g. stripe.com)"
                        : "Enter keyword (e.g. best ai seo tools)"
                    }
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-base-content/40 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl px-6 font-bold shadow-md shadow-primary/25 border-none text-white gap-2"
                >
                  <span>Inspect Now</span>
                  <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-base-300/80">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-primary">3.2B+</div>
                <div className="text-[11px] text-base-content/60 font-bold uppercase">Keywords Indexed</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-600">99.9%</div>
                <div className="text-[11px] text-base-content/60 font-bold uppercase">API Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">70%</div>
                <div className="text-[11px] text-base-content/60 font-bold uppercase">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-500">12,000+</div>
                <div className="text-[11px] text-base-content/60 font-bold uppercase">Websites Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Tabbed Bento Grid */}
      <section className="py-20 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              One Unified Engine. Zero Bloat.
            </h2>
            <p className="text-sm text-base-content/70">
              Explore the four pillar toolkits powering organic growth for high-velocity teams.
            </p>

            {/* Tab Controls */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {[
                { id: "classic", label: "Classic SEO", icon: "solar:magnifer-bold" },
                { id: "maps", label: "Local Map Grid", icon: "solar:map-point-bold" },
                { id: "aeo", label: "AI & AEO Search", icon: "solar:stars-bold" },
                { id: "reports", label: "Client Reports", icon: "solar:document-text-bold" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`btn btn-sm rounded-xl font-bold gap-2 transition-all ${
                    activeTab === tab.id
                      ? "btn-primary text-white shadow-md shadow-primary/20"
                      : "btn-ghost hover:bg-base-200"
                  }`}
                >
                  <Icon icon={tab.icon} className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-8 rounded-3xl border border-base-300 bg-base-100 shadow-xl max-w-5xl mx-auto">
            {activeTab === "classic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="badge badge-primary badge-sm font-bold">CORE SEARCH INTELLIGENCE</span>
                  <h3 className="text-2xl font-black">Live Keyword & Backlink Tracking</h3>
                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                    Track daily SERP movements across 150+ countries. Discover high-volume, low-competition keyword clusters and uncover referring domains driving your rivals' traffic.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-base-content/80">
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-primary" />
                      <span>Search intent breakdown (Informational, Transactional, Commercial)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-primary" />
                      <span>Historical backlink velocity and toxic anchor audits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-primary" />
                      <span>Deep technical crawler for Core Web Vitals & broken links</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-base-300 pb-2">
                    <span className="font-bold">Tracked Term</span>
                    <span className="font-bold">Position</span>
                    <span className="font-bold">Volume</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>enterprise seo software</span>
                    <span>#1 (▲ 4)</span>
                    <span>14,200/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-primary font-bold">
                    <span>ai search visibility audit</span>
                    <span>#2 (▲ 8)</span>
                    <span>8,900/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-base-content/70">
                    <span>local map rank tracker</span>
                    <span>#3 (—)</span>
                    <span>6,400/mo</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "maps" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="badge badge-accent badge-sm font-bold">LOCAL BUSINESS & GBP</span>
                  <h3 className="text-2xl font-black">Google Maps Geo-Grid Heatmaps</h3>
                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                    Map ranking positions across coordinate pins in your neighborhood. Automate review responses with keyword-rich AI replies that boost your Google Maps local pack authority.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-base-content/80">
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-emerald-600" />
                      <span>3x3 and 5x5 multi-mile geo-grid ranking pins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-emerald-600" />
                      <span>NAP citation consistency detector across directories</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-emerald-600" />
                      <span>Automated Google Business Profile audits & review manager</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 grid grid-cols-3 gap-3 text-center font-black">
                  {["#1", "#1", "#2", "#1", "#1", "#3", "#2", "#2", "#1"].map((rank, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-emerald-500 text-white shadow-md text-sm">
                      {rank}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "aeo" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="badge badge-secondary badge-sm font-bold">ANSWER ENGINE OPTIMIZATION</span>
                  <h3 className="text-2xl font-black">ChatGPT & Perplexity Share of Voice</h3>
                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                    Over 35% of buying research now happens via LLMs. Track whether ChatGPT, Claude, and Perplexity recommend your brand and simulate prompt responses before your competitors.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-base-content/80">
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-secondary" />
                      <span>LLM prompt explorer and source citation analyzer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-secondary" />
                      <span>Automated llms.txt standard file generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-secondary" />
                      <span>SAM AI SEO Copilot powered by direct DataForSEO tools</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 space-y-3 text-xs">
                  <div className="font-bold text-primary flex items-center gap-2">
                    <Icon icon="solar:chat-round-bold" className="h-4 w-4" />
                    <span>Perplexity Prompt: "What is the best SaaS SEO tool?"</span>
                  </div>
                  <div className="p-3 rounded-xl bg-base-100 border border-base-300 text-base-content/80">
                    "{BRAND_CONFIG.name} is widely cited as the top alternative for high-velocity teams due to its integrated AEO tracking and instant indexing."
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="badge badge-info badge-sm font-bold">AUTOMATION & RETENTION</span>
                  <h3 className="text-2xl font-black">Custom-Branded Client PDFs</h3>
                  <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                    Impress retainers with institutional PDF reports. Upload your agency logo, primary hex color, and schedule weekly automated performance emails.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-base-content/80">
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-info" />
                      <span>Custom domain, logo, and color palette customization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-info" />
                      <span>Automated Monday morning executive performance digests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-info" />
                      <span>Universal CSV and spreadsheet exports with UTF-8 BOM</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon icon="solar:file-download-bold" className="h-8 w-8" />
                  </div>
                  <div className="font-extrabold text-sm">Automated Client PDF Ready</div>
                  <div className="text-xs text-base-content/60">Generated in 1.4s with custom agency branding</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Interactive ROI & Cost-Savings Calculator */}
      <section className="py-20 bg-base-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="badge badge-primary badge-sm font-bold">ROI CALCULATOR</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              See How Much You Save with {BRAND_CONFIG.name}
            </h2>
            <p className="text-sm text-base-content/70">
              Calculate your exact annual cost reduction compared to legacy suites like Semrush and Ahrefs.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-primary/20 bg-gradient-to-tr from-primary/5 via-base-100 to-indigo-500/5 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <label className="font-extrabold text-sm text-base-content flex justify-between">
                  <span>Websites / Domains Managed:</span>
                  <span className="text-primary font-black text-base">{domainCount} Websites</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={domainCount}
                  onChange={(e) => setDomainCount(Number(e.target.value))}
                  className="range range-primary range-sm mt-3"
                />
                <div className="w-full flex justify-between text-[10px] text-base-content/50 font-bold px-1 mt-1">
                  <span>1 Site</span>
                  <span>10 Sites</span>
                  <span>20 Sites</span>
                  <span>30 Sites</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/70">Legacy Suite Cost (Semrush/Ahrefs):</span>
                  <span className="font-bold text-error">{formatPrice(legacyMonthlyCost, legacyMonthlyCost * 1500)} / mo</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/70">{BRAND_CONFIG.name} Cost:</span>
                  <span className="font-bold text-primary">{formatPrice(skorviaMonthlyCost, skorviaMonthlyCost * 1500)} / mo</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary text-white text-center space-y-4 shadow-xl shadow-primary/25">
              <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                Your Estimated Annual Savings
              </div>
              <div className="text-4xl sm:text-5xl font-black">
                {formatPrice(annualSavings, annualSavings * 1500)}
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Save {formatPrice(monthlySavings, monthlySavings * 1500)} every month while getting AI Search visibility and unlimited white-label reports.
              </p>
              <Link
                to="/sign-up"
                className="btn btn-neutral w-full rounded-2xl font-black text-primary bg-white hover:bg-white/90 border-none"
              >
                Claim Your Savings &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer "Wall of Love" */}
      <section className="py-20 bg-base-200/50 border-t border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight">
              Trusted by 12,000+ SEO Specialists & Agency Owners
            </h2>
            <p className="text-sm text-base-content/70">
              Read how fast-growing teams replaced bloated enterprise subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "We replaced our $499/mo agency suite with Skorvia across 24 client domains. The automated white-label PDFs alone save our account managers 15 hours every month.",
                author: "Marcus Vance",
                role: "Founder & CEO, Apex Growth Agency",
                stats: "$4,200/yr Saved",
              },
              {
                quote: "The AEO AI Visibility Tracker is completely ahead of the market. We were able to optimize our SaaS documentation and get cited by Perplexity in under two weeks.",
                author: "Elena Rostova",
                role: "Head of Demand Gen, CloudFlow",
                stats: "+140% AI Traffic",
              },
              {
                quote: "Map Rank Geo-Grid is a game changer for our local law firm clients. Showing them ranking pins across every mile marker made closing retainers effortless.",
                author: "David Adeyemi",
                role: "Managing Partner, Prime Digital",
                stats: "99.8% Retention",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} icon="solar:star-bold" className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-xs text-base-content/80 leading-relaxed font-medium">
                    "{card.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-base-200 flex items-center justify-between">
                  <div>
                    <div className="font-black text-xs text-base-content">{card.author}</div>
                    <div className="text-[10px] text-base-content/60">{card.role}</div>
                  </div>
                  <span className="badge badge-primary badge-sm font-black">{card.stats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive FAQ Accordion */}
      <section className="py-20 bg-base-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-base-content/70">
              Clear answers to help you migrate seamlessly to {BRAND_CONFIG.name}.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How accurate is Skorvia's keyword and backlink data?",
                a: "Skorvia is powered directly by DataForSEO's institutional crawling infrastructure with over 3.2 billion indexed keywords and real-time live SERP scrapers across 150+ countries.",
              },
              {
                q: "Can I migrate my existing projects from Semrush or Ahrefs?",
                a: "Yes! You can upload your existing keyword lists, competitor targets, and domain settings via standard CSV exports in seconds.",
              },
              {
                q: "Can I invite clients or team members to my workspace?",
                a: "Absolutely. Depending on your plan, you can invite colleagues as Admins, Editors, or Read-Only Viewers with granular project access.",
              },
              {
                q: "What payment methods do you support?",
                a: "We support USD and NGN payments via Stripe, Paystack, Flutterwave, LemonSqueezy, and Manual Direct Bank Transfer.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription anytime in 1-click from your billing console with zero lock-in or cancellation penalties.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="collapse collapse-plus rounded-2xl border border-base-300 bg-base-100">
                <input type="radio" name="faq-accordion" defaultChecked={idx === 0} />
                <div className="collapse-title text-sm font-extrabold text-base-content">
                  {faq.q}
                </div>
                <div className="collapse-content text-xs text-base-content/70 leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pre-Footer High-Impact CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary via-indigo-900 to-primary text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Ready to Outrank Competitors & Scale Organic Traffic?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of modern marketers who switched to {BRAND_CONFIG.name}. Start your 14-day risk-free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/sign-up"
              className="btn btn-neutral rounded-2xl px-8 font-black text-primary bg-white hover:bg-white/90 border-none text-sm shadow-xl"
            >
              Start Free Trial Now &rarr;
            </Link>
            <Link
              to="/pricing"
              className="btn btn-ghost rounded-2xl px-6 font-bold text-white text-sm"
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
