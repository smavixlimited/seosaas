import * as React from "react";
import { Icon } from "@iconify/react";

const integrationsRow1 = [
  { icon: "logos:google-icon", name: "Google Search Console" },
  { icon: "logos:slack-icon", name: "Slack" },
  { icon: "logos:openai-icon", name: "OpenAI ChatGPT" },
  { icon: "logos:shopify", name: "Shopify" },
  { icon: "logos:bing", name: "Microsoft Bing" },
  { icon: "logos:meta-icon", name: "Meta Ads" },
  { icon: "logos:figma", name: "Figma" },
  { icon: "logos:stripe", name: "Stripe" },
];

const integrationsRow2 = [
  { icon: "logos:hubspot", name: "HubSpot CRM" },
  { icon: "logos:tiktok-icon", name: "TikTok Ads" },
  { icon: "logos:discord-icon", name: "Discord" },
  { icon: "logos:youtube-icon", name: "YouTube" },
  { icon: "logos:zapier-icon", name: "Zapier" },
  { icon: "logos:notion-icon", name: "Notion" },
  { icon: "logos:wordpress-icon", name: "WordPress" },
  { icon: "logos:linkedin-icon", name: "LinkedIn Ads" },
];

export function TemplateIntegration() {
  return (
    <section
      className="py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px] bg-background-2 dark:bg-background-5 overflow-hidden"
      aria-label="Integration Partners"
    >
      <div className="main-container">
        <div className="space-y-[50px] md:space-y-[60px] lg:space-y-[70px]">
          {/* Header */}
          <div className="mx-auto max-w-[1028px] space-y-4 text-center">
            <span className="badge badge-green mb-3">Integrations</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
                Enhance your workflow effortlessly with 50+ integrations.
              </h2>
              <p className="mx-auto max-w-[582px] text-tagline-1 text-secondary dark:text-accent">
                Direct native connections to Google Search Console, Google Analytics, Slack, AI Answer Engines, and multi-network ad libraries.
              </p>
            </div>
          </div>

          {/* Marquees */}
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="relative mx-auto max-w-[1128px] overflow-hidden">
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 left-0 z-20 h-full w-[15%] bg-gradient-to-r to-transparent md:w-[20%]" />
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 right-0 z-20 h-full w-[15%] bg-gradient-to-l to-transparent md:w-[20%]" />

              <div className="animate-marquee-forward flex items-center gap-6 py-2">
                {[...integrationsRow1, ...integrationsRow1, ...integrationsRow1].map((item, idx) => (
                  <figure
                    key={idx}
                    title={item.name}
                    className="dark:bg-background-6 flex size-[90px] sm:size-[100px] items-center justify-center rounded-full bg-white p-5 border border-stroke-3/50 dark:border-stroke-7 shadow-xs shrink-0 transition-transform hover:scale-110"
                  >
                    <Icon icon={item.icon} className="size-9 sm:size-11 shrink-0" />
                  </figure>
                ))}
              </div>
            </div>

            {/* Row 2 (Reverse) */}
            <div className="relative mx-auto max-w-[985px] overflow-hidden">
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 left-0 z-20 h-full w-[15%] bg-gradient-to-r to-transparent md:w-[20%]" />
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 right-0 z-20 h-full w-[15%] bg-gradient-to-l to-transparent md:w-[20%]" />

              <div className="animate-marquee-backward flex items-center gap-6 py-2">
                {[...integrationsRow2, ...integrationsRow2, ...integrationsRow2].map((item, idx) => (
                  <figure
                    key={idx}
                    title={item.name}
                    className="dark:bg-background-5 flex size-[90px] sm:size-[100px] items-center justify-center rounded-full bg-white p-5 border border-stroke-3/40 dark:border-stroke-7 shadow-xs shrink-0 transition-transform hover:scale-110"
                  >
                    <Icon icon={item.icon} className="size-9 sm:size-11 shrink-0" />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

