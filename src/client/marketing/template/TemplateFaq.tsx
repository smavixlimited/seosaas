import * as React from "react";

const faqItems = [
  {
    q: "How does Skorvia compare to legacy tools like Semrush or Ahrefs?",
    a: "Unlike legacy platforms that charge $199+/mo per user seat and hit you with expensive add-on fees, Skorvia provides flat-rate pricing with unlimited team seats, built-in competitor ad spying across 4 networks, and automated AI citation tracking.",
  },
  {
    q: "Do I need my own Meta or Google Ads account to spy on competitors?",
    a: "No. Skorvia's ad intelligence runs independently through public network libraries and global scraping clusters. You do not need to connect your own ad accounts or risk ad tokens.",
  },
  {
    q: "What is AI Search / Answer Engine Optimization (AEO)?",
    a: "As buyers increasingly query Perplexity, ChatGPT, and Claude instead of traditional Google SERPs, AEO tracks how often your product is recommended, cited, and summarized by LLMs—giving you the exact prompts to safeguard your organic share of voice.",
  },
  {
    q: "Can I export white-label PDF reports for my clients or leadership team?",
    a: "Yes. All plans include 1-click executive PDF report exports. You can customize branding, colors, domain scorecards, and action items before sharing.",
  },
  {
    q: "Is there a free trial or credit card required upfront?",
    a: "You can test all tools with our live interactive scanner on the homepage instantly. When you sign up, you get a 14-day free trial with zero upfront credit card requirement.",
  },
];

export function TemplateFaq() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx((curr) => (curr === idx ? null : idx));
  };

  return (
    <section className="dark:bg-background-6 bg-white py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px]" aria-label="Frequently Asked Questions">
      <div className="main-container">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-8">
          {/* FAQ Accordion Left */}
          <div className="space-y-8 text-center lg:text-left w-full lg:max-w-[560px]">
            <div className="space-y-4">
              <span className="badge badge-green uppercase">FAQ</span>
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent mx-auto lg:mx-0">
                Common inquiries from growth teams
              </h2>
            </div>

            {/* Accordion */}
            <div className="space-y-4 text-left">
              {faqItems.map((item, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stroke-3 dark:border-stroke-7 bg-background-1 dark:bg-background-5 p-5 transition-colors cursor-pointer"
                    onClick={() => toggle(idx)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-tagline-1 font-bold text-secondary dark:text-accent">
                        {item.q}
                      </h3>
                      <span className="size-6 rounded-full bg-background-2 dark:bg-background-8 flex items-center justify-center font-bold text-xs shrink-0 text-secondary dark:text-accent">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-3 text-tagline-2 text-secondary/70 dark:text-accent/70 leading-relaxed border-t border-stroke-3/50 dark:border-stroke-7 pt-3">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Illustration Right - Modern Canva-Style Vector Dashboard */}
          <div className="relative w-full max-w-[684px] lg:max-w-[480px] xl:max-w-[580px]">
            <div className="relative rounded-3xl border border-stroke-3/80 dark:border-stroke-7 bg-gradient-to-b from-white via-background-1 to-background-2 dark:from-background-5 dark:via-background-6 dark:to-background-8 p-6 sm:p-8 shadow-xl overflow-hidden space-y-6">
              {/* Background Glow */}
              <div className="absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 dark:bg-brand-300/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-ns-green/10 blur-3xl pointer-events-none" />

              {/* Card Header Pill */}
              <div className="flex items-center justify-between border-b border-stroke-3/60 dark:border-stroke-7 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="size-3 rounded-full bg-rose-500 inline-block" />
                  <span className="size-3 rounded-full bg-amber-500 inline-block" />
                  <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-bold text-secondary/60 dark:text-accent/60 ml-2 font-mono">
                    skorvia.intelligence.live
                  </span>
                </div>
                <span className="badge badge-green text-xs font-bold">100% Flat-Rate</span>
              </div>

              {/* Central Visual Graphic */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/80 dark:bg-background-6/80 p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-secondary/60 dark:text-accent/60 font-semibold">
                    <span>Rank Health</span>
                    <span className="text-emerald-500 font-bold">+18.4%</span>
                  </div>
                  <div className="text-2xl font-black text-secondary dark:text-accent">94.8<span className="text-xs text-secondary/50 dark:text-accent/50">/100</span></div>
                  <div className="w-full bg-stroke-3 dark:bg-stroke-7 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94.8%]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-stroke-3/60 dark:border-stroke-7 bg-white/80 dark:bg-background-6/80 p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-secondary/60 dark:text-accent/60 font-semibold">
                    <span>AI Citations</span>
                    <span className="badge badge-green text-[10px]">#1 Ranked</span>
                  </div>
                  <div className="text-2xl font-black text-secondary dark:text-accent">4 LLMs</div>
                  <p className="text-[11px] text-secondary/50 dark:text-accent/50">ChatGPT, Claude, Perplexity</p>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5">
                {[
                  { title: "Zero Seat Licenses", subtitle: "Invite unlimited team members with no extra per-seat fees.", icon: "solar:users-group-two-rounded-bold" },
                  { title: "4-Network Ad Spying", subtitle: "Monitor Meta, Google, TikTok, and LinkedIn creatives in real-time.", icon: "solar:eye-bold" },
                  { title: "Automated 1-Click Reports", subtitle: "Export executive PDF board reports directly to clients.", icon: "solar:document-text-bold" },
                ].map((pillar, i) => (
                  <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl border border-stroke-3/40 dark:border-stroke-7 bg-white/60 dark:bg-background-6/60 shadow-2xs">
                    <div className="size-9 rounded-lg bg-primary/10 dark:bg-brand-300/10 text-primary dark:text-brand-300 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-secondary dark:text-accent">{pillar.title}</h4>
                      <p className="text-[11px] text-secondary/60 dark:text-accent/60">{pillar.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TemplateFaq;
