import * as React from "react";

const logosRow1 = [
  { src: "/images/icons/google.svg", alt: "Google Search Console" },
  { src: "/images/icons/slack.svg", alt: "Slack Notifications" },
  { src: "/images/icons/confluence.svg", alt: "Confluence Docs" },
  { src: "/images/icons/snapchat.svg", alt: "Snapchat Ads" },
  { src: "/images/icons/figma.svg", alt: "Figma UI" },
  { src: "/images/icons/microsoft.svg", alt: "Microsoft Bing" },
  { src: "/images/icons/apple.svg", alt: "Apple Safari" },
  { src: "/images/icons/behance.svg", alt: "Creative Library" },
];

const logosRow2 = [
  { src: "/images/icons/shopify.svg", alt: "Shopify" },
  { src: "/images/icons/discord.svg", alt: "Discord" },
  { src: "/images/icons/tiktok.svg", alt: "TikTok Ads" },
  { src: "/images/icons/spotify.svg", alt: "Spotify" },
  { src: "/images/icons/youtube.svg", alt: "YouTube" },
  { src: "/images/icons/stripe.svg", alt: "Stripe" },
  { src: "/images/icons/zapier.svg", alt: "Zapier" },
  { src: "/images/icons/hotjar.svg", alt: "Hotjar" },
];

export function TemplateIntegration() {
  return (
    <section className="py-[80px] md:py-[100px] lg:py-[130px] xl:py-[160px] bg-background-2 dark:bg-background-5 overflow-hidden" aria-label="Integration Partners">
      <div className="main-container">
        <div className="space-y-[50px] md:space-y-[60px] lg:space-y-[70px]">
          {/* Header */}
          <div className="mx-auto max-w-[1028px] space-y-4 text-center">
            <span className="badge badge-green mb-3">Integrations</span>
            <div className="space-y-3">
              <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent">
                Enhance your workflow effortlessly with 50+ integrations.
              </h2>
              <p className="mx-auto max-w-[582px] text-tagline-1 text-secondary/60 dark:text-accent/60">
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
                {[...logosRow1, ...logosRow1, ...logosRow1].map((logo, idx) => (
                  <figure
                    key={idx}
                    className="dark:bg-background-6 flex size-[90px] sm:size-[100px] items-center justify-center rounded-full bg-white p-5 border border-stroke-3/50 dark:border-stroke-7 shadow-xs shrink-0 transition-transform hover:scale-110"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="size-10 sm:size-12 object-contain"
                    />
                  </figure>
                ))}
              </div>
            </div>

            {/* Row 2 (Reverse) */}
            <div className="relative mx-auto max-w-[985px] overflow-hidden">
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 left-0 z-20 h-full w-[15%] bg-gradient-to-r to-transparent md:w-[20%]" />
              <div className="from-background-2 dark:from-background-5 pointer-events-none absolute top-0 right-0 z-20 h-full w-[15%] bg-gradient-to-l to-transparent md:w-[20%]" />

              <div className="animate-marquee-backward flex items-center gap-6 py-2">
                {[...logosRow2, ...logosRow2, ...logosRow2].map((logo, idx) => (
                  <figure
                    key={idx}
                    className="dark:bg-background-5 flex size-[90px] sm:size-[100px] items-center justify-center rounded-full bg-white p-5 border border-stroke-3/40 dark:border-stroke-7 shadow-xs shrink-0"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="size-10 sm:size-12 object-contain"
                    />
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
export default TemplateIntegration;
