import {
  Bookmark,
  Bot,
  CheckSquare,
  ClipboardCheck,
  Globe,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Activity,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  Gauge,
  Flame,
  Users,
  Swords,
  Target,
  Radio,
} from "lucide-react";
import { linkOptions } from "@tanstack/react-router";
import { GoogleGlyphMuted } from "@/client/features/gsc/GoogleGlyph";

export interface NavItemConfig {
  to: string;
  label: string;
  benefit?: string;
  icon: React.ComponentType<{ className?: string }>;
  solarIcon: string;
  activeOptions?: { exact?: boolean; includeSearch?: boolean };
}

const projectNavItems = [
  // 1. OVERVIEW
  {
    to: "/p/$projectId" as const,
    label: "Main Dashboard",
    benefit:
      "See your entire growth trajectory at a glance—spot traffic wins, score trends, and know your #1 priority task this week.",
    icon: LayoutDashboard,
    solarIcon: "icon-park-outline:dashboard-one",
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/roadmap" as const,
    label: "Action Roadmap",
    benefit:
      "Get prioritized, step-by-step action items engineered to deliver the fastest organic traffic & conversion gains for your Brand.",
    icon: CheckSquare,
    solarIcon: "icon-park-outline:list-checkbox",
  },
  {
    to: "/p/$projectId/my-analysis" as const,
    label: "My Analysis",
    benefit:
      "Access and export all your historical Brand Analyses, Competitor Benchmarks, and Ad Readiness Reports with PDF download.",
    icon: FileText,
    solarIcon: "icon-park-outline:doc-detail",
  },
  {
    to: "/p/$projectId/advanced-analytics" as const,
    label: "Advanced Analytics",
    benefit:
      "Executive Growth & SEO Command Center: Correlate GSC search impressions, Rank Tracker velocity, organic traffic value ($), and technical health with 1-click client PDF/CSV reports.",
    icon: TrendingUp,
    solarIcon: "icon-park-outline:chart-line",
  },

  // 2. BRAND INTELLIGENCE
  {
    to: "/p/$projectId/brand-analysis" as const,
    label: "Brand Analysis",
    benefit:
      "Get 360° details about your brand—social media channels, market positioning, strengths, and actionable weaknesses to improve.",
    icon: Gauge,
    solarIcon: "icon-park-outline:badge-two",
  },

  // 3. COMPETITOR INTELLIGENCE
  {
    to: "/p/$projectId/competitors" as const,
    label: "Competitors Directory",
    benefit:
      "Directory of tracked competitors with website URLs and social media links. Add, edit, or delete rivals anytime.",
    icon: Users,
    solarIcon: "icon-park-outline:peoples-two",
  },
  {
    to: "/p/$projectId/competitor-ads" as const,
    label: "Competitor Ad Spying",
    benefit:
      "Spy on winning Meta, Google, TikTok, and LinkedIn ad creatives from any competitor with zero user ad accounts needed.",
    icon: Radio,
    solarIcon: "icon-park-outline:radar",
  },
  {
    to: "/p/$projectId/competitor-analysis" as const,
    label: "Competitor Analysis",
    benefit:
      "Compare your Brand 1-on-1 head-to-head against any competitor to uncover keyword gaps, ad copy hooks, and attack plays.",
    icon: Swords,
    solarIcon: "icon-park-outline:analysis",
  },

  // 4. ORGANIC SEARCH (SEO)
  {
    to: "/p/$projectId/keywords" as const,
    label: "Keyword Research",
    benefit:
      "Find easy-to-rank keywords with real search volume that bring paying customers to your website instead of high-competition dead ends.",
    icon: Search,
    solarIcon: "icon-park-outline:search",
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Saved Keywords",
    benefit:
      "Organize target keywords into high-value clusters, track seasonal demand, and assign them directly to content briefs.",
    icon: Bookmark,
    solarIcon: "icon-park-outline:bookmark-one",
  },
  {
    to: "/p/$projectId/search-performance" as const,
    label: "GSC Insights",
    benefit:
      "Turn raw Google data into revenue. Spot high-impression keywords where quick title tweaks can immediately double your organic clicks.",
    icon: GoogleGlyphMuted,
    solarIcon: "icon-park-outline:chart-line",
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Rank Tracker",
    benefit:
      "Never guess your Google positions. Track daily rank movements on mobile & desktop, and get alerted the moment you hit page #1.",
    icon: TrendingUp,
    solarIcon: "icon-park-outline:ranking",
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks & Site Health",
    benefit:
      "Build domain authority that Google respects. Find out who links to your competitors and claim high-impact backlinks to outrank them.",
    icon: Link2,
    solarIcon: "icon-park-outline:link-one",
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Technical Site Audit",
    benefit:
      "Prevent silent ranking penalties. Automatically find and fix broken links, slow pages, and technical crawl blockers before Google demotes you.",
    icon: ClipboardCheck,
    solarIcon: "icon-park-outline:protect",
  },

  // 5. AI SEARCH & RADAR
  {
    to: "/p/$projectId/brand-lookup" as const,
    label: "Brand Lookup & AI Search",
    benefit:
      "Evaluate brand perception and identity signals across digital channels, test custom AI prompts, and strengthen overall search trust.",
    icon: Sparkles,
    solarIcon: "icon-park-outline:magic",
  },
  {
    to: "/p/$projectId/brand-mentions" as const,
    label: "Brand Mentions & AEO",
    benefit:
      "Protect your brand authority 24/7. Get alerted when blogs, forums, or AI engines talk about your brand or your competitors.",
    icon: MessageSquare,
    solarIcon: "icon-park-outline:comments",
  },
] as const;

export const indexingNavItem = linkOptions({
  to: "/indexing" as const,
  label: "Instant Indexing",
  benefit:
    "Get Google & Bing to index your new articles in hours rather than weeks, so you capture traffic and rankings ahead of everyone else.",
  icon: Sparkles,
  solarIcon: "icon-park-outline:lightning",
});

export const uptimeNavItem = linkOptions({
  to: "/uptime" as const,
  label: "Uptime & SSL",
  benefit:
    "Never lose sales to silent website outages or expired SSL warnings with 24/7 proactive monitoring before customers bounce.",
  icon: Activity,
  solarIcon: "icon-park-outline:radar",
});

export const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "Skorvia AI & MCP",
  benefit:
    "Supercharge your workflow with your personal 24/7 CMO agent and Model Context Protocol server that turns data into instant growth plays.",
  icon: Bot,
  solarIcon: "icon-park-outline:brain",
});

export const billingNavItem = linkOptions({
  to: "/billing" as const,
  label: "Billing & Plans",
  benefit:
    "Manage your subscription, credit usage balance, auto-recharge settings, and upgrade to unlock advanced agency tiers.",
  icon: CreditCard,
  solarIcon: "icon-park-outline:bank-card",
});

export const settingsNavItem = linkOptions({
  to: "/settings" as const,
  label: "Settings",
  icon: Settings,
  solarIcon: "icon-park-outline:setting-two",
});

export const helpNavItem = linkOptions({
  to: "/help/dataforseo-api-key" as const,
  label: "Help & Documentation",
  benefit:
    "Guides, API credentials setup, and step-by-step tutorials to get the most out of Skorvia.",
  icon: FileText,
  solarIcon: "icon-park-outline:help",
});

export function getGrowthToolsNavGroup(isAgency = false) {
  return {
    label: "Growth & Platform Tools",
    items: [indexingNavItem, uptimeNavItem, aiNavItem],
  };
}

export const growthToolsNavGroup = getGrowthToolsNavGroup();

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

// Grouped by the 7 Master Skorvia Pillars
export function getProjectNavGroups(projectId: string) {
  const all = getProjectNavItems(projectId);
  const byPath = (path: (typeof projectNavItems)[number]["to"]) =>
    all.find((i) => i.to === path)!;

  return [
    {
      label: "Overview",
      solarIcon: "icon-park-outline:dashboard-one",
      items: [
        byPath("/p/$projectId"),
        byPath("/p/$projectId/advanced-analytics"),
        byPath("/p/$projectId/roadmap"),
        byPath("/p/$projectId/my-analysis"),
      ],
    },
    {
      label: "Brand Intelligence",
      solarIcon: "icon-park-outline:badge-two",
      items: [
        byPath("/p/$projectId/brand-analysis"),
      ],
    },

    {
      label: "Competitor Intelligence",
      solarIcon: "icon-park-outline:peoples-two",
      items: [
        byPath("/p/$projectId/competitors"),
        byPath("/p/$projectId/competitor-ads"),
        byPath("/p/$projectId/competitor-analysis"),
      ],
    },
    {
      label: "Organic Search (SEO)",
      solarIcon: "icon-park-outline:search",
      items: [
        byPath("/p/$projectId/keywords"),
        byPath("/p/$projectId/saved"),
        byPath("/p/$projectId/search-performance"),
        byPath("/p/$projectId/rank-tracking"),
        byPath("/p/$projectId/backlinks"),
        byPath("/p/$projectId/audit"),
      ],
    },
    {
      label: "AI Search & Radar",
      solarIcon: "icon-park-outline:radar",
      items: [
        byPath("/p/$projectId/brand-lookup"),
        byPath("/p/$projectId/brand-mentions"),
      ],
    },
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
