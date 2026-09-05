import * as React from "react";
import { Icon } from "@iconify/react";

export function TemplateIntegration() {
  const integrations = [
    { name: "Google Search Console", icon: "logos:google-search-console" },
    { name: "Google Analytics 4", icon: "logos:google-analytics" },
    { name: "Perplexity AI", icon: "simple-icons:perplexity" },
    { name: "ChatGPT Search", icon: "simple-icons:openai" },
    { name: "Anthropic Claude", icon: "simple-icons:anthropic" },
    { name: "Meta Ad Library", icon: "logos:meta-icon" },
    { name: "TikTok Creative Center", icon: "logos:tiktok-icon" },
    { name: "LinkedIn Ads", icon: "logos:linkedin-icon" },
    { name: "Slack Alerts", icon: "logos:slack-icon" },
  ];

  return (
    <section className="bg-base-100 dark:bg-[#070b10] py-16 overflow-hidden border-b border-base-300 dark:border-white/5">
      <div className="main-container mb-8 text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-base-content/50">
          Seamlessly Connected With The Modern Organic & AI Stack
        </p>
      </div>

      <div className="relative w-full overflow-hidden mask-fade">
        <div className="animate-marquee flex items-center gap-6">
          {[...integrations, ...integrations].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-base-300 dark:border-white/10 bg-base-200/40 dark:bg-[#0f1217] text-base-content font-bold text-xs whitespace-nowrap shadow-xs hover:border-primary/40 transition-colors"
            >
              <Icon icon={item.icon} className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
