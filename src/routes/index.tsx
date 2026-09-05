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
import { TemplateTeam } from "@/client/marketing/template/TemplateTeam";
import { TemplateCTA } from "@/client/marketing/template/TemplateCTA";
import { TemplateBlog } from "@/client/marketing/template/TemplateBlog";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-5 text-secondary dark:text-accent selection:bg-primary selection:text-white">
      {/* 1. Pill Floating Navbar */}
      <MarketingNavbar />

      <main>
        {/* 1. Hero with SVG Background & Perspective Scanner Sandbox */}
        <TemplateHero />

        {/* 2. 3-Card Bento Features (Tilted Ad Spy, Green Revenue Bars, AEO Citations) */}
        <TemplateFeatures />

        {/* 3. 5-Card Services Grid with NextSaaS Font Icons */}
        <TemplateServices />

        {/* 4. 3-Step Outcome Process Flow */}
        <TemplateProcess />

        {/* 5. Frequently Asked Questions with Illustration */}
        <TemplateFaq />

        {/* 6. Integration Infinite Marquee */}
        <TemplateIntegration />

        {/* 7. Numbers & Statistical Impact */}
        <TemplateNumbers />

        {/* 8. Team Showcase */}
        <TemplateTeam />

        {/* 9. Final Conversion CTA with Email Form */}
        <TemplateCTA />

        {/* 10. Recent Research & Playbooks Blog Grid */}
        <TemplateBlog />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
export default HomePage;
