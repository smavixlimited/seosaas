import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { TemplateHero } from "@/client/marketing/template/TemplateHero";
import { TemplateFeatures } from "@/client/marketing/template/TemplateFeatures";
import { TemplateServices } from "@/client/marketing/template/TemplateServices";
import { TemplateProcess } from "@/client/marketing/template/TemplateProcess";
import { TemplateFaq } from "@/client/marketing/template/TemplateFaq";
import { TemplateIntegration } from "@/client/marketing/template/TemplateIntegration";
import { TemplateNumbers } from "@/client/marketing/template/TemplateNumbers";
import { TemplateBenefits } from "@/client/marketing/template/TemplateBenefits";
import { TemplateRoiCalculator } from "@/client/marketing/template/TemplateRoiCalculator";
import { TemplateCTA } from "@/client/marketing/template/TemplateCTA";
import { TemplateAeoShowcase } from "@/client/marketing/template/TemplateAeoShowcase";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-5 text-secondary dark:text-accent selection:bg-primary selection:text-white">
      {/* 1. Pill Floating Navbar */}
      <MarketingNavbar />

      <main>
        {/* 1. Semrush-Inspired Hero with Domain & Keyword Scanner */}
        <TemplateHero />

        {/* 2. 3-Card Bento Features (Tilted Ad Spy, Green Revenue Bars, AEO Citations) */}
        <TemplateFeatures />

        {/* 3. 5-Card Services Grid with NextSaaS Font Icons */}
        <TemplateServices />

        {/* 4. High-Converting Benefits (Features to Bottom-Line Outcomes) */}
        <TemplateBenefits />

        {/* 5. Interactive ROI Cost Savings Calculator */}
        <TemplateRoiCalculator />

        {/* 6. 3-Step Outcome Process Flow */}
        <TemplateProcess />

        {/* 6. Frequently Asked Questions with Illustration */}
        <TemplateFaq />

        {/* 7. Integration Infinite Marquee */}
        <TemplateIntegration />

        {/* 8. Numbers & Statistical Impact */}
        <TemplateNumbers />

        {/* 9. Generative AEO & Legacy Comparison Showcase */}
        <TemplateAeoShowcase />

        {/* 10. Final Conversion CTA with Email Form */}
        <TemplateCTA />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
export default HomePage;
