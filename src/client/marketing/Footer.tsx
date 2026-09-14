import * as React from "react";
import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

export function MarketingFooter() {
  return (
    <footer className="bg-secondary dark:bg-background-8 text-white relative overflow-hidden pt-[80px] pb-[40px] border-t border-stroke-5">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[350px] w-[350px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[350px] w-[350px] rounded-full bg-ns-green/10 blur-[120px]" />

      <div className="main-container relative z-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 pb-16 border-b border-white/10">
          {/* Col 1: Brand & Bio (3 cols on lg) */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="size-8 rounded-full object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-white font-interTight">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <p className="text-tagline-2 text-white max-w-[280px] leading-relaxed">
              The modern search intelligence workspace. Flat-rate search data,
              multi-network competitor ad spying, and AI citation radar with
              zero user seat taxes.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="badge badge-green text-xs font-bold">
                100% Data Transparency
              </span>
            </div>
          </div>

          {/* Col 2: Product (2 cols on lg) */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
            <h4 className="text-tagline-1 font-bold text-white uppercase tracking-wider text-xs font-interTight">
              Product
            </h4>
            <ul className="space-y-2.5 text-tagline-2 text-white">
              <li>
                <Link
                  to="/features/competitor-page-decoder"
                  className="hover:text-white transition-colors"
                >
                  Ad Spy Tool
                </Link>
              </li>
              <li>
                <Link
                  to="/features/keyword-research"
                  className="hover:text-white transition-colors"
                >
                  Keyword Radar
                </Link>
              </li>
              <li>
                <Link
                  to="/features/ai-search-aeo"
                  className="hover:text-white transition-colors"
                >
                  AI &amp; AEO Monitor
                </Link>
              </li>
              <li>
                <Link
                  to="/features/competitor-page-decoder"
                  className="hover:text-white transition-colors"
                >
                  Competitor Page Decoder
                </Link>
              </li>
              <li>
                <Link
                  to="/features/site-audit"
                  className="hover:text-white transition-colors"
                >
                  Technical Audit
                </Link>
              </li>
              <li>
                <Link
                  to="/features/white-label-reports"
                  className="hover:text-white transition-colors"
                >
                  1-Click PDF Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Solutions (2 cols on lg) */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
            <h4 className="text-tagline-1 font-bold text-white uppercase tracking-wider text-xs font-interTight">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-tagline-2 text-white">
              <li>
                <Link
                  to="/solutions/for-agencies"
                  className="hover:text-white transition-colors"
                >
                  For Agencies
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions/for-saas"
                  className="hover:text-white transition-colors"
                >
                  For SaaS Brands
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions/for-ecommerce"
                  className="hover:text-white transition-colors"
                >
                  For E-Commerce
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Comparisons (2 cols on lg) */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
            <h4 className="text-tagline-1 font-bold text-white uppercase tracking-wider text-xs font-interTight">
              Comparisons
            </h4>
            <ul className="space-y-2.5 text-tagline-2 text-white">
              <li>
                <Link
                  to="/vs-ahrefs-semrush"
                  className="hover:text-white transition-colors"
                >
                  vs Ahrefs &amp; Semrush
                </Link>
              </li>
              <li>
                <Link
                  to="/vs/ahrefs"
                  className="hover:text-white transition-colors"
                >
                  vs Ahrefs
                </Link>
              </li>
              <li>
                <Link
                  to="/vs/moz"
                  className="hover:text-white transition-colors"
                >
                  vs Moz Pro
                </Link>
              </li>
              <li>
                <Link
                  to="/vs/se-ranking"
                  className="hover:text-white transition-colors"
                >
                  vs SE Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Resources (1.5 cols on lg) */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1.5 space-y-4">
            <h4 className="text-tagline-1 font-bold text-white uppercase tracking-wider text-xs font-interTight">
              Resources
            </h4>
            <ul className="space-y-2.5 text-tagline-2 text-white">
              <li>
                <Link
                  to="/blogs"
                  className="hover:text-white transition-colors"
                >
                  Research Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/free-audit"
                  className="hover:text-white transition-colors"
                >
                  Free Scanner
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  API &amp; MCP Docs
                </Link>
              </li>
              <li>
                <Link
                  to="/library"
                  className="hover:text-white transition-colors"
                >
                  SEO Playbooks
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: Company (1.5 cols on lg) */}
          <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1.5 space-y-4">
            <h4 className="text-tagline-1 font-bold text-white uppercase tracking-wider text-xs font-interTight">
              Company
            </h4>
            <ul className="space-y-2.5 text-tagline-2 text-white">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Skorvia
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              𝕏
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
