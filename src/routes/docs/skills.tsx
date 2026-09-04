import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { getAllSkills } from "@/lib/content";

export const Route = createFileRoute("/docs/skills")({
  component: SkillsDirectoryPage,
});

function SkillsDirectoryPage() {
  const skills = getAllSkills();

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
              <Link to="/docs" className="hover:underline">
                Docs
              </Link>
              <span>/</span>
              <span>Agent Skills</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              Autonomous SEO Agent Skills
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Pre-built specialized agent workflows designed for Claude Code, Cursor, and custom autonomous LLM agents to execute complex multi-step SEO tasks.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {skills.map((skill) => (
              <Link
                key={skill.slug}
                to="/docs/$"
                params={{ _splat: `skills/${skill.slug}` }}
                className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-base-content group-hover:text-primary transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-base-content/70 leading-relaxed line-clamp-3">
                    {skill.description || "Comprehensive autonomous agent workflow definition."}
                  </p>
                </div>

                <div className="pt-5 flex items-center text-xs font-bold text-primary">
                  View Skill Instructions <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
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
