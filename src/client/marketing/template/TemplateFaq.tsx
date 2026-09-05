import * as React from "react";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";

export function TemplateFaq() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: `How is ${BRAND_CONFIG.name} 70% cheaper than Semrush and Ahrefs?`,
      a: "Legacy SEO platforms charge $199 to $499/month because of bloated legacy infrastructure and aggressive per-seat markup fees. Skorvia uses high-efficiency direct API pipelines and never charges you extra for adding your teammates.",
    },
    {
      q: "Do I need my own Meta or Google ad accounts to use Competitor Ad Spying?",
      a: "No! Skorvia queries public ad libraries and scraped ad intelligence directly. You do not need to connect or link any personal or company ad accounts to spy on your competitors.",
    },
    {
      q: "How does Answer Engine Optimization (AEO) tracking work?",
      a: "Skorvia tests buying queries and solution searches across Perplexity, ChatGPT Search, and Claude to monitor if and how your brand is cited, what sentiment is returned, and where competitors are being recommended instead.",
    },
    {
      q: "Can I export branded PDF reports with my agency logo?",
      a: "Yes. All plans allow you to generate client-ready white-label PDF audits, competitor gap analyses, and ranking scorecards with your own custom branding and logo in 60 seconds.",
    },
    {
      q: "Is there a free trial or refund policy?",
      a: "Every paid tier comes with a 14-day risk-free trial. If you are not completely satisfied with your organic rankings and competitor insights, cancel anytime with a single click.",
    },
  ];

  return (
    <section className="bg-base-100 dark:bg-[#070b10] py-20 lg:py-28">
      <div className="main-container">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="badge-green">
              <Icon icon="solar:question-circle-bold" className="h-3.5 w-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-base-content">
              Everything You Need To Know.
            </h2>
            <p className="text-base text-base-content/70 font-medium">
              Have questions about data accuracy, ad spying, or billing? We've got you covered.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[20px] bg-base-200/50 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-6 flex items-center justify-between text-left font-black text-base sm:text-lg text-base-content gap-4"
                  >
                    <span>{faq.q}</span>
                    <div className={`h-8 w-8 rounded-full bg-base-100 dark:bg-[#181d26] border border-base-300 dark:border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-base-content/60"}`}>
                      <Icon icon="solar:alt-arrow-down-linear" className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-base-content/70 leading-relaxed font-medium border-t border-base-300/40 dark:border-white/5 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
