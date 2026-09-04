import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { CurrencyDropdown } from "@/client/lib/currency";
import { LanguageDropdown } from "@/client/lib/language";

export function MarketingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-100/90 text-base-content/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 space-y-12">
        {/* Main 6-Column Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Col 1: Brand & Status */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="h-8 w-8 rounded-xl object-contain shadow-xs ring-1 ring-primary/20"
              />
              <span className="text-xl font-black tracking-tight text-base-content flex items-center gap-1.5">
                {BRAND_CONFIG.name}
                <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">
                  ENTERPRISE
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-xs text-base-content/70 leading-relaxed font-medium">
              Next-generation SEO, Local Maps Geo-Grid, and Answer Engine Optimization (AEO) platform built for agencies, fast-growing SaaS, and local businesses.
            </p>

            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All Systems Operational</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-base-content/50 pt-2">
              <span className="flex items-center gap-1">
                <Icon icon="solar:shield-check-bold" className="h-4 w-4 text-primary" />
                <span>SOC2 Compliant</span>
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:lock-keyhole-bold" className="h-4 w-4 text-indigo-600" />
                <span>256-Bit SSL</span>
              </span>
            </div>
          </div>

          {/* Col 2: Core SEO Suite */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-primary">
              Core SEO Suite
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/features/keyword-research" className="hover:text-primary transition-colors">
                  Keyword Intelligence
                </Link>
              </li>
              <li>
                <Link to="/features/keyword-research" className="hover:text-primary transition-colors">
                  Daily Rank Tracker
                </Link>
              </li>
              <li>
                <Link to="/features/backlink-checker" className="hover:text-primary transition-colors">
                  Backlink Explorer
                </Link>
              </li>
              <li>
                <Link to="/features/site-audit" className="hover:text-primary transition-colors">
                  Technical Site Audit
                </Link>
              </li>
              <li>
                <Link to="/features/uptime-monitoring" className="hover:text-primary transition-colors">
                  Uptime & SSL Monitor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Local & AI Search */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
              Local, AI &amp; Conversion
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/features/local-business" className="hover:text-primary transition-colors">
                  Google Business &amp; Maps Sync
                </Link>
              </li>
              <li>
                <Link to="/features/prompt-explorer" className="hover:text-primary transition-colors">
                  Prompt Explorer &amp; AEO
                </Link>
              </li>
              <li>
                <Link to="/features/conversion-ad-readiness" className="hover:text-primary transition-colors">
                  Ad Readiness &amp; Pixel Health
                </Link>
              </li>
              <li>
                <Link to="/features/competitor-page-decoder" className="hover:text-primary transition-colors">
                  Competitor Page Decoder
                </Link>
              </li>
              <li>
                <Link to="/features/skorvia-ai-coach" className="hover:text-primary transition-colors">
                  Skorvia AI Growth Coach
                </Link>
              </li>
              <li>
                <Link to="/features/white-label-reports" className="hover:text-primary transition-colors">
                  White-Label Client PDFs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Comparisons */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">
              Compare & Migrate
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/vs/ahrefs" className="hover:text-primary transition-colors">
                  Skorvia vs. Ahrefs
                </Link>
              </li>
              <li>
                <Link to="/vs/moz" className="hover:text-primary transition-colors">
                  Skorvia vs. Moz Pro
                </Link>
              </li>
              <li>
                <Link to="/vs/se-ranking" className="hover:text-primary transition-colors">
                  Skorvia vs. SE Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Resources & Docs */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Knowledge & Docs
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/docs" className="hover:text-primary transition-colors">
                  Documentation Hub
                </Link>
              </li>
              <li>
                <Link to="/docs/mcp" className="hover:text-primary transition-colors">
                  MCP Agent Protocol
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-primary transition-colors">
                  Blog & Industry Insights
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-primary transition-colors">
                  SEO Playbooks & Guides
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition-colors">
                  Help & Support Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Currency, Copyright, Legal */}
        <div className="border-t border-base-300 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/60">
          <div className="flex items-center gap-4">
            <p>&copy; {new Date().getFullYear()} {BRAND_CONFIG.name}, Inc. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CurrencyDropdown />
            <LanguageDropdown />
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
