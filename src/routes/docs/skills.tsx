import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { getAllSkills } from "@/lib/content";

export const Route = createFileRoute("/docs/skills")({
  component: SkillsDirectoryPage,
});

function SkillsDirectoryPage() {
  const skills = getAllSkills();

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-tagline-3 font-semibold text-primary-500">
              <Link to="/docs" className="hover:underline">
                Docs
              </Link>
              <span className="text-secondary/30 dark:text-accent/30">/</span>
              <span className="text-secondary/60 dark:text-accent/60">Agent Skills</span>
            </div>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              Autonomous SEO Agent Skills
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto">
              Pre-built specialized agent workflows designed for Claude Code, Cursor, and custom autonomous LLM agents to execute complex multi-step SEO tasks.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {skills.map((skill) => (
              <Link
                key={skill.slug}
                to="/docs/$"
                params={{ _splat: `skills/${skill.slug}` }}
                className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[101%] flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon icon="solar:magic-stick-3-bold-duotone" className="size-6 text-primary-500" />
                  </div>
                  <h3 className="text-heading-6 font-bold font-interTight text-secondary dark:text-accent group-hover:text-primary-500 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 leading-relaxed line-clamp-3">
                    {skill.description || "Comprehensive autonomous agent workflow definition."}
                  </p>
                </div>

                <div className="pt-6 flex items-center text-tagline-3 font-bold text-primary-500">
                  <span>View Skill Instructions</span>
                  <Icon icon="solar:arrow-right-linear" className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
