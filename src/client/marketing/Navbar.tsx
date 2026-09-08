import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { useSession } from "@/lib/auth-client";
import { useThemePreference } from "@/client/lib/theme";
import { CurrencyDropdown } from "@/client/lib/currency";

interface MenuItemLinkProps {
  href: string;
  title: string;
  description: string;
  icon: string;
  showDivider?: boolean;
  onClick?: () => void;
}

function MenuItemLink({
  href,
  title,
  description,
  icon,
  showDivider,
  onClick,
}: MenuItemLinkProps) {
  return (
    <>
      <li className="group/item list-none">
        <Link
          to={href}
          onClick={onClick}
          className="relative flex items-start gap-3 rounded-2xl p-2.5 sm:p-3 transition-all duration-200 hover:bg-background-2 dark:hover:bg-background-5"
        >
          <div className="dark:bg-background-6 border border-stroke-1 dark:border-stroke-7 relative z-10 flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-[10px] bg-white text-primary dark:text-brand-300 shadow-xs group-hover/item:scale-105 transition-transform">
            <Icon icon={icon} className="size-5 sm:size-6" />
          </div>
          <div className="relative z-10 space-y-0.5">
            <p className="text-tagline-1 text-secondary dark:text-accent font-semibold group-hover/item:text-primary dark:group-hover/item:text-brand-300 transition-colors">
              {title}
            </p>
            <p className="text-tagline-3 text-secondary/60 dark:text-accent/60 line-clamp-1">
              {description}
            </p>
          </div>
        </Link>
      </li>
      {showDivider && (
        <li className="list-none">
          <div className="bg-stroke-4 dark:bg-background-7 mx-auto h-[1px] w-[calc(100%-16px)] my-1" />
        </li>
      )}
    </>
  );
}

// 1. Platform / Features Mega-Menu (3 Columns)
function PlatformMenu({ onClose }: { onClose: () => void }) {
  const col1 = [
    {
      href: "/features/competitor-page-decoder",
      title: "Competitor Ad Decoder",
      description: "4-Network ad creative spy & angle decoder",
      icon: "solar:eye-bold-duotone",
    },
    {
      href: "/features/keyword-research",
      title: "Keyword Revenue Radar",
      description: "Pos 11-20 leak recovery & intent grouping",
      icon: "solar:target-bold-duotone",
    },
    {
      href: "/features/ai-search-aeo",
      title: "AI Search & AEO Monitor",
      description: "ChatGPT, Claude & Perplexity citations",
      icon: "solar:stars-bold-duotone",
    },
  ];

  const col2 = [
    {
      href: "/features/local-business",
      title: "Google Maps Geo-Grid",
      description: "GPS 7x7 coordinate map pack tracking",
      icon: "solar:map-point-bold-duotone",
    },
    {
      href: "/features/site-audit",
      title: "Technical Site Audit",
      description: "Core Web Vitals & automated issue fixes",
      icon: "solar:shield-check-bold-duotone",
    },
    {
      href: "/features/backlink-checker",
      title: "Backlink Explorer",
      description: "Domain authority & lost backlink reclaim",
      icon: "solar:link-bold-duotone",
    },
  ];

  const col3 = [
    {
      href: "/features/white-label-reports",
      title: "Executive PDF Reports",
      description: "1-Click white-label client board reports",
      icon: "solar:document-text-bold-duotone",
    },
    {
      href: "/free-audit",
      title: "Instant Free Audit",
      description: "Zero-commitment domain health check",
      icon: "solar:scanner-bold-duotone",
    },
    {
      href: "/features/skorvia-ai-coach",
      title: "Autonomous AI Coach",
      description: "24/7 strategic SEO recommendations",
      icon: "solar:chat-round-line-bold-duotone",
    },
  ];

  return (
    <div className="absolute top-full left-1/2 -translate-x-[35%] sm:-translate-x-1/2 pt-3 z-50 pointer-events-auto">
      <div className="dark:bg-background-6 border border-stroke-1 dark:border-stroke-7 w-[840px] max-w-[calc(100vw-36px)] rounded-[24px] bg-white p-6 shadow-2xl transition-all duration-300 grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3">
            Search &amp; Ad Intelligence
          </div>
          <ul className="space-y-1">
            {col1.map((item, i) => (
              <MenuItemLink
                key={item.href}
                {...item}
                showDivider={i < col1.length - 1}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>

        <div className="col-span-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3">
            Local &amp; Technical SEO
          </div>
          <ul className="space-y-1">
            {col2.map((item, i) => (
              <MenuItemLink
                key={item.href}
                {...item}
                showDivider={i < col2.length - 1}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>

        <div className="col-span-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3">
            Reports &amp; Automation
          </div>
          <ul className="space-y-1">
            {col3.map((item, i) => (
              <MenuItemLink
                key={item.href}
                {...item}
                showDivider={i < col3.length - 1}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// 2. Solutions Mega-Menu (2 Columns)
function SolutionsMenu({ onClose }: { onClose: () => void }) {
  const byIndustry = [
    {
      href: "/solutions/for-saas",
      title: "SaaS & Tech",
      description: "Scale MRR via high-intent bottom-funnel queries",
      icon: "solar:laptop-bold-duotone",
    },
    {
      href: "/solutions/for-ecommerce",
      title: "E-Commerce",
      description: "Dominate product rich snippets & shopping ads",
      icon: "solar:bag-3-bold-duotone",
    },
    {
      href: "/solutions/for-local-business",
      title: "Local Businesses",
      description: "Own Google Map Packs in your geographic radius",
      icon: "solar:shop-2-bold-duotone",
    },
  ];

  const byRole = [
    {
      href: "/solutions/for-agencies",
      title: "Growth Agencies",
      description:
        "Deliver 1-click white-label PDF reports with unlimited seats",
      icon: "solar:users-group-two-rounded-bold-duotone",
    },
    {
      href: "/solutions/for-saas",
      title: "Founders & Solopreneurs",
      description: "Automate SEO tasks without high agency retainers",
      icon: "solar:rocket-2-bold-duotone",
    },
  ];

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 pointer-events-auto">
      <div className="dark:bg-background-6 border border-stroke-1 dark:border-stroke-7 w-[640px] max-w-[calc(100vw-36px)] rounded-[24px] bg-white p-6 shadow-2xl transition-all duration-300 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3">
            By Industry
          </div>
          <ul className="space-y-1">
            {byIndustry.map((item, i) => (
              <MenuItemLink
                key={item.href}
                {...item}
                showDivider={i < byIndustry.length - 1}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3">
            By Role
          </div>
          <ul className="space-y-1">
            {byRole.map((item, i) => (
              <MenuItemLink
                key={item.href}
                {...item}
                showDivider={i < byRole.length - 1}
                onClick={onClose}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// 3. Resources Menu (Blog, Docs, Tutorials, FAQ, Support)
function ResourcesMenu({ onClose }: { onClose: () => void }) {
  const resources = [
    {
      href: "/blogs",
      title: "Blog & Playbooks",
      description: "Latest tactical breakdowns and case studies",
      icon: "solar:document-bold-duotone",
    },
    {
      href: "/docs",
      title: "Documentation & MCP",
      description: "AI agent protocol and platform docs",
      icon: "solar:book-bookmark-bold-duotone",
    },
    {
      href: "/free-audit",
      title: "Free Instant Scan",
      description: "Run instant 50-page site health checks",
      icon: "solar:scanner-bold-duotone",
    },
    {
      href: "/about",
      title: "About & Culture",
      description: "Our team, vision, and mission",
      icon: "solar:buildings-bold-duotone",
    },
    {
      href: "/contact",
      title: "Help & Support",
      description: "24/7 dedicated customer assistance",
      icon: "solar:headphones-round-bold-duotone",
    },
  ];

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 pointer-events-auto">
      <div className="dark:bg-background-6 border border-stroke-1 dark:border-stroke-7 w-[360px] max-w-[calc(100vw-36px)] rounded-[24px] bg-white p-4 shadow-2xl transition-all duration-300">
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-brand-300 px-3 mb-2">
          Knowledge &amp; Support
        </div>
        <ul className="space-y-1">
          {resources.map((item, i) => (
            <MenuItemLink
              key={item.href}
              {...item}
              showDivider={i < resources.length - 1}
              onClick={onClose}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MarketingNavbar() {
  const { data: session } = useSession();
  const { themePreference, setThemePreference } = useThemePreference();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<
    "platform" | "solutions" | "resources" | null
  >(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = () => {
    setThemePreference(themePreference === "dark" ? "light" : "dark");
  };

  const handleMouseEnter = (
    dropdown: "platform" | "solutions" | "resources",
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const closeDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(null);
  };

  return (
    <header className="lp:!max-w-[1290px] fixed top-4 sm:top-5 left-1/2 z-50 mx-auto w-[94%] sm:w-full max-w-[350px] -translate-x-1/2 transition-all duration-500 min-[425px]:max-w-[375px] min-[500px]:max-w-[450px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px]">
      <div className="border border-stroke-2 dark:border-stroke-6 bg-white/95 dark:bg-background-9/95 mx-auto flex items-center justify-between rounded-full px-3.5 sm:px-5 py-2 xl:py-2.5 shadow-xl backdrop-blur-xl">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
            onClick={closeDropdown}
          >
            <img
              src={BRAND_CONFIG.logoUrl}
              alt={BRAND_CONFIG.name}
              className="size-7 sm:size-8 rounded-full object-contain"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center xl:flex">
          <ul className="flex items-center gap-1">
            {/* 1. Platform / Features */}
            <li
              className="relative cursor-pointer py-1"
              onMouseEnter={() => handleMouseEnter("platform")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`text-tagline-2 text-secondary hover:text-secondary dark:text-accent dark:hover:text-accent flex items-center gap-1.5 rounded-full px-4 py-2 font-medium transition-colors ${
                  activeDropdown === "platform"
                    ? "text-secondary dark:text-accent bg-base-200/60 dark:bg-white/10"
                    : ""
                }`}
              >
                <span>Features</span>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`size-3.5 transition-transform duration-300 ${
                    activeDropdown === "platform" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "platform" && (
                <PlatformMenu onClose={closeDropdown} />
              )}
            </li>

            {/* 2. Solutions */}
            <li
              className="relative cursor-pointer py-1"
              onMouseEnter={() => handleMouseEnter("solutions")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`text-tagline-2 text-secondary hover:text-secondary dark:text-accent dark:hover:text-accent flex items-center gap-1.5 rounded-full px-4 py-2 font-medium transition-colors ${
                  activeDropdown === "solutions"
                    ? "text-secondary dark:text-accent bg-base-200/60 dark:bg-white/10"
                    : ""
                }`}
              >
                <span>Solutions</span>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`size-3.5 transition-transform duration-300 ${
                    activeDropdown === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "solutions" && (
                <SolutionsMenu onClose={closeDropdown} />
              )}
            </li>

            {/* 3. Resources (Blog, Docs, Tutorials, FAQ) */}
            <li
              className="relative cursor-pointer py-1"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`text-tagline-2 text-secondary hover:text-secondary dark:text-accent dark:hover:text-accent flex items-center gap-1.5 rounded-full px-4 py-2 font-medium transition-colors ${
                  activeDropdown === "resources"
                    ? "text-secondary dark:text-accent bg-base-200/60 dark:bg-white/10"
                    : ""
                }`}
              >
                <span>Resources</span>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`size-3.5 transition-transform duration-300 ${
                    activeDropdown === "resources" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "resources" && (
                <ResourcesMenu onClose={closeDropdown} />
              )}
            </li>

            {/* 4. Pricing (Direct Link) */}
            <li>
              <Link
                to="/pricing"
                onClick={closeDropdown}
                className="text-tagline-2 text-secondary hover:text-secondary dark:text-accent dark:hover:text-accent px-4 py-2 font-medium transition-colors rounded-full block"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Controls: Currency, Language, Theme, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden md:block">
            <CurrencyDropdown />
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="size-8 rounded-full flex items-center justify-center text-secondary dark:text-accent hover:bg-stroke-3/50 dark:hover:bg-stroke-7 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            <Icon
              icon={
                themePreference === "dark"
                  ? "solar:sun-2-bold"
                  : "solar:moon-bold"
              }
              className="size-4"
            />
          </button>

          {session?.user ? (
            <Link
              to="/my-brands"
              className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-xs text-xs px-4"
            >
              Dashboard &rarr;
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/sign-in"
                className="hidden sm:inline-flex text-tagline-2 font-semibold text-secondary/80 dark:text-accent/80 hover:text-secondary dark:hover:text-accent px-3 py-1"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-xs text-xs px-4"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="xl:hidden p-1.5 text-secondary dark:text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Icon
              icon={
                mobileMenuOpen
                  ? "solar:close-circle-bold"
                  : "solar:hamburger-menu-linear"
              }
              className="size-6"
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-2 p-4 rounded-3xl border border-stroke-2 dark:border-stroke-6 bg-white dark:bg-background-9 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-primary dark:text-brand-300">
              Features
            </p>
            <div className="grid grid-cols-1 gap-1">
              <Link
                to="/features/competitor-page-decoder"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Competitor Ad Decoder
              </Link>
              <Link
                to="/features/keyword-research"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Keyword Revenue Radar
              </Link>
              <Link
                to="/features/ai-search-aeo"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                AI Search &amp; AEO Monitor
              </Link>
              <Link
                to="/features/local-business"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Google Maps Geo-Grid
              </Link>
              <Link
                to="/features/site-audit"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Technical Site Audit
              </Link>
              <Link
                to="/features/white-label-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Executive PDF Reports
              </Link>
            </div>
          </div>

          <div className="space-y-1 border-t border-stroke-3/50 pt-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-primary dark:text-brand-300">
              Resources
            </p>
            <div className="grid grid-cols-1 gap-1">
              <Link
                to="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Blog &amp; Playbooks
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Documentation &amp; MCP
              </Link>
              <Link
                to="/free-audit"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Free Instant Scan
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-semibold hover:bg-background-2 dark:hover:bg-background-5 rounded-lg block"
              >
                Pricing Plans
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-stroke-3/50 flex items-center justify-between gap-2">
            <CurrencyDropdown />
          </div>

          <div className="pt-2 border-t border-stroke-3/50 flex flex-col gap-2">
            {!session?.user ? (
              <>
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn border border-stroke-3 dark:border-stroke-7 bg-base-100 hover:bg-base-200 dark:bg-background-7 text-secondary dark:text-accent w-full rounded-full text-xs font-bold py-2.5 text-center transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full rounded-full text-xs font-bold py-2.5 text-center text-white"
                >
                  Get Started Free
                </Link>
              </>
            ) : (
              <Link
                to="/my-brands"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary w-full rounded-full text-xs font-bold py-2.5 text-center text-white"
              >
                Open Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
