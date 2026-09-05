import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { useSession } from "@/lib/auth-client";
import { useThemePreference } from "@/client/lib/theme";
import { CurrencyDropdown } from "@/client/lib/currency";
import { LanguageDropdown } from "@/client/lib/language";

export function MarketingNavbar() {
  const { data: session } = useSession();
  const { themePreference, setThemePreference } = useThemePreference();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<"features" | "solutions" | "resources" | null>(null);

  const toggleTheme = () => {
    setThemePreference(themePreference === "dark" ? "light" : "dark");
  };

  const closeMegaMenu = () => setActiveMegaMenu(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300/80 bg-base-100/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMegaMenu}>
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="h-8 w-8 rounded-xl object-contain shadow-xs ring-1 ring-primary/25 transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-base-content flex items-center gap-1.5">
              {BRAND_CONFIG.name}
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-black text-primary ring-1 ring-inset ring-primary/25">
                AI
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Mega-Menus */}
        <nav className="hidden items-center gap-2 lg:flex">
          {/* Features Mega-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMegaMenu("features")}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              type="button"
              onClick={() => setActiveMegaMenu(activeMegaMenu === "features" ? null : "features")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition-all ${
                activeMegaMenu === "features"
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/85 hover:text-base-content hover:bg-base-200/70"
              }`}
            >
              <span>Features</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeMegaMenu === "features" ? "rotate-180 text-primary" : "opacity-60"
                }`}
              />
            </button>

            {activeMegaMenu === "features" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[820px] rounded-3xl border border-base-300 bg-base-100/95 p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-150">
                {/* Col 1: Core SEO */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Icon icon="solar:magnifer-bold" className="h-4 w-4" />
                    <span>Core SEO</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "Keyword Intelligence", desc: "Volume, SERP difficulty & intent", href: "/features/keyword-research" },
                      { name: "Rank Tracker", desc: "Daily position tracking", href: "/features/keyword-research" },
                      { name: "Backlink Explorer", desc: "Referring domains & anchors", href: "/features/backlink-checker" },
                      { name: "Technical Site Audit", desc: "Core Web Vitals & crawl health", href: "/features/site-audit" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 2: Local SEO & GBP */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Icon icon="solar:shop-2-bold" className="h-4 w-4" />
                    <span>Local &amp; Maps</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "Google Business Sync", desc: "1-Click OAuth auto-detection", href: "/features/local-business" },
                      { name: "33-Directory Coverage", desc: "Audit Apple Maps, Bing & Waze", href: "/features/local-business" },
                      { name: "Review QR Center", desc: "Printable in-store review kits", href: "/features/local-business" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 3: AI Search & AEO */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                    <Icon icon="solar:stars-bold" className="h-4 w-4" />
                    <span>AI Search / AEO</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "Prompt Explorer", desc: "Simulate prompts across 4 AI models", href: "/features/prompt-explorer" },
                      { name: "AI Visibility Tracker", desc: "ChatGPT, Claude, Perplexity citations", href: "/features/ai-search-aeo" },
                      { name: "Skorvia AI Brand Coach", desc: "Autonomous 24/7 in-app CMO", href: "/features/skorvia-ai-coach" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 4: Conversion & Agency Suite */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <Icon icon="solar:chart-square-bold" className="h-4 w-4" />
                    <span>Conversion &amp; Scale</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "Ad Readiness (0–100)", desc: "Catch leaks & verify pixel tags", href: "/features/conversion-ad-readiness" },
                      { name: "Competitor Page Decoder", desc: "Reverse-engineer winning URLs", href: "/features/competitor-page-decoder" },
                      { name: "White-Label Reports", desc: "Custom branded client PDFs", href: "/features/white-label-reports" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Mega-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMegaMenu("solutions")}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              type="button"
              onClick={() => setActiveMegaMenu(activeMegaMenu === "solutions" ? null : "solutions")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition-all ${
                activeMegaMenu === "solutions"
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/85 hover:text-base-content hover:bg-base-200/70"
              }`}
            >
              <span>Solutions</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeMegaMenu === "solutions" ? "rotate-180 text-primary" : "opacity-60"
                }`}
              />
            </button>

            {activeMegaMenu === "solutions" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[720px] rounded-3xl border border-base-300 bg-base-100/95 p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-150">
                {/* By Role */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Icon icon="solar:users-group-two-rounded-bold" className="h-4 w-4" />
                    <span>By Role</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "For Agencies", desc: "Multi-client portals & white-label", href: "/solutions/for-agencies" },
                      { name: "For In-House Marketers", desc: "High-velocity organic growth", href: "/solutions/for-saas" },
                      { name: "For Founders", desc: "Automate SEO without high costs", href: "/solutions/for-saas" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* By Industry */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Icon icon="solar:buildings-bold" className="h-4 w-4" />
                    <span>By Industry</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "E-Commerce & Retail", desc: "Scale product page rankings", href: "/solutions/for-ecommerce" },
                      { name: "SaaS & Tech", desc: "Capture high-intent B2B search", href: "/solutions/for-saas" },
                      { name: "Local Business", desc: "Google Maps & GBP dominance", href: "/solutions/for-local-business" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* By Use Case */}
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                    <Icon icon="solar:target-bold" className="h-4 w-4" />
                    <span>By Use Case</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "Competitor Espionage", desc: "Uncover rivals' top pages & gaps", href: "/features/keyword-research" },
                      { name: "AI Search Readiness", desc: "Optimize for LLM citations", href: "/features/ai-search-aeo" },
                      { name: "Audit & Fix CWV", desc: "Resolve Core Web Vitals issues", href: "/features/site-audit" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Resources Mega-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMegaMenu("resources")}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              type="button"
              onClick={() => setActiveMegaMenu(activeMegaMenu === "resources" ? null : "resources")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition-all ${
                activeMegaMenu === "resources"
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/85 hover:text-base-content hover:bg-base-200/70"
              }`}
            >
              <span>Resources</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeMegaMenu === "resources" ? "rotate-180 text-primary" : "opacity-60"
                }`}
              />
            </button>

            {activeMegaMenu === "resources" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[720px] rounded-3xl border border-base-300 bg-base-100/95 p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Icon icon="solar:book-bookmark-bold" className="h-4 w-4" />
                    <span>Knowledge</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "SEO Playbooks", desc: "Actionable playbooks & guides", href: "/library" },
                      { name: "Blog & Industry News", desc: "Latest algorithm & AI updates", href: "/blogs" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                    <Icon icon="solar:scale-bold" className="h-4 w-4" />
                    <span>Comparisons</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "vs. Ahrefs", desc: "Save 75% without credit traps", href: "/vs/ahrefs" },
                      { name: "vs. Moz Pro", desc: "Daily tracking & modern AI", href: "/vs/moz" },
                      { name: "vs. SE Ranking", desc: "Generous quotas & no add-ons", href: "/vs/se-ranking" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Icon icon="solar:code-circle-bold" className="h-4 w-4" />
                    <span>Developers</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { name: "MCP Agent Protocol", desc: "Connect Claude & Cursor to SEO data", href: "/docs/mcp" },
                      { name: "Documentation", desc: "API references & quickstart", href: "/docs" },
                    ].map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={closeMegaMenu}
                          className="block p-2.5 rounded-xl hover:bg-base-200/70 transition-colors group"
                        >
                          <div className="font-extrabold text-sm text-base-content group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-base-content/65 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Link */}
          <Link
            to="/pricing"
            onClick={closeMegaMenu}
            className="rounded-xl px-4 py-2 text-sm font-extrabold text-base-content/85 hover:text-base-content hover:bg-base-200/70 transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Actions: Currency Dropdown, Language Dropdown, Theme Toggle, Auth Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="hidden sm:block">
            <CurrencyDropdown />
          </div>
          <div className="hidden md:block">
            <LanguageDropdown />
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:bg-base-200"
            aria-label="Toggle theme"
          >
            <Icon
              icon={themePreference === "dark" ? "solar:sun-2-bold" : "solar:moon-bold"}
              className="h-4 w-4"
            />
          </button>

          {session?.user ? (
            <Link
              to="/projects"
              className="btn btn-primary btn-sm rounded-xl font-black text-white shadow-md shadow-primary/20 text-xs sm:text-sm"
            >
              Dashboard &rarr;
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/sign-in"
                className="hidden sm:inline-flex btn btn-ghost btn-sm rounded-xl font-extrabold text-xs sm:text-sm text-base-content/85 hover:text-base-content"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="btn btn-primary btn-sm rounded-xl font-black text-white shadow-md shadow-primary/25 border-none text-xs sm:text-sm px-4"
              >
                Start Free Trial
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden btn btn-ghost btn-circle btn-sm text-base-content/80"
            aria-label="Open menu"
          >
            <Icon icon={mobileMenuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-linear"} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-base-300 bg-base-100 p-5 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1.5">
            <div className="text-xs font-black uppercase text-primary px-2">Core Features</div>
            <Link
              to="/features/keyword-research"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              Keyword Intelligence
            </Link>
            <Link
              to="/features/backlink-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              Backlink Explorer
            </Link>
            <Link
              to="/features/site-audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              Technical Site Audit
            </Link>
            <Link
              to="/features/ai-search-aeo"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              AI Search & AEO
            </Link>
          </div>

          <div className="space-y-1.5 border-t border-base-200 pt-3">
            <div className="text-xs font-black uppercase text-indigo-600 px-2">Solutions</div>
            <Link
              to="/solutions/for-agencies"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              For Agencies
            </Link>
            <Link
              to="/solutions/for-saas"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              For SaaS & Tech
            </Link>
            <Link
              to="/solutions/for-ecommerce"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              For E-Commerce
            </Link>
            <Link
              to="/solutions/for-local-business"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              For Local Business
            </Link>
          </div>

          <div className="space-y-1.5 border-t border-base-200 pt-3">
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              Pricing Plans
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-extrabold text-base-content hover:bg-base-200"
            >
              Blog & News
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
