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
  Store,
  Gauge,
  Flame,
  Users,
  Swords,
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
    solarIcon: "solar:widget-6-bold-duotone",
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/roadmap" as const,
    label: "Action Roadmap",
    benefit:
      "Get prioritized, step-by-step action items engineered to deliver the fastest organic traffic & conversion gains for your Brand.",
    icon: CheckSquare,
    solarIcon: "solar:checklist-minimalistic-bold-duotone",
  },
  {
    to: "/p/$projectId/my-analysis" as const,
    label: "My Analysis",
    benefit:
      "Access and export all your historical Brand Analyses, Competitor Benchmarks, and Ad Readiness Reports with PDF download.",
    icon: FileText,
    solarIcon: "solar:document-text-bold-duotone",
  },

  // 2. BRAND & AD READINESS
  {
    to: "/p/$projectId/brand-analysis" as const,
    label: "Brand Analysis",
    benefit:
      "Full 6-dimension credibility & conversion readiness audit. Get graded with actionable solutions and 1-click export to your Roadmap.",
    icon: Gauge,
    solarIcon: "solar:shield-star-bold-duotone",
  },
  {
    to: "/p/$projectId/trust-sentiment" as const,
    label: "Audience Trust & Sentiment",
    benefit:
      "Pre-Ad Gate: Verify customer sentiment, review credibility, and social trust before spending paid ad budget.",
    icon: ShieldCheck,
    solarIcon: "solar:heart-bold-duotone",
  },
  {
    to: "/p/$projectId/viral-detector" as const,
    label: "Viral Content & Detector",
    benefit:
      "Discover trending angles, high-performing competitor hooks, and viral social patterns tailored to your niche.",
    icon: Flame,
    solarIcon: "solar:fire-bold-duotone",
  },

  // 3. COMPETITOR INTELLIGENCE
  {
    to: "/p/$projectId/competitors" as const,
    label: "Competitors Directory",
    benefit:
      "Directory of tracked competitors with website URLs and social media links. Add, edit, or delete rivals anytime.",
    icon: Users,
    solarIcon: "solar:users-group-two-rounded-bold-duotone",
  },
  {
    to: "/p/$projectId/competitor-analysis" as const,
    label: "Competitor Analysis & Decoder",
    benefit:
      "Compare your Brand 1-on-1 head-to-head against any competitor to uncover keyword gaps, ad copy hooks, and attack plays.",
    icon: Swords,
    solarIcon: "solar:swords-bold-duotone",
  },

  // 4. ORGANIC SEARCH (SEO)
  {
    to: "/p/$projectId/keywords" as const,
    label: "Keyword Research",
    benefit:
      "Find easy-to-rank keywords with real search volume that bring paying customers to your website instead of high-competition dead ends.",
    icon: Search,
    solarIcon: "solar:minimalistic-magnifer-bold-duotone",
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Saved Keywords",
    benefit:
      "Organize target keywords into high-value clusters, track seasonal demand, and assign them directly to content briefs.",
    icon: Bookmark,
    solarIcon: "solar:bookmark-opened-bold-duotone",
  },
  {
    to: "/p/$projectId/search-performance" as const,
    label: "GSC Insights",
    benefit:
      "Turn raw Google data into revenue. Spot high-impression keywords where quick title tweaks can immediately double your organic clicks.",
    icon: GoogleGlyphMuted,
    solarIcon: "solar:chart-2-bold-duotone",
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Rank Tracker",
    benefit:
      "Never guess your Google positions. Track daily rank movements on mobile & desktop, and get alerted the moment you hit page #1.",
    icon: TrendingUp,
    solarIcon: "solar:chart-square-bold-duotone",
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks & Site Health",
    benefit:
      "Build domain authority that Google respects. Find out who links to your competitors and claim high-impact backlinks to outrank them.",
    icon: Link2,
    solarIcon: "solar:link-circle-bold-duotone",
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Technical Site Audit",
    benefit:
      "Prevent silent ranking penalties. Automatically find and fix broken links, slow pages, and technical crawl blockers before Google demotes you.",
    icon: ClipboardCheck,
    solarIcon: "solar:shield-check-bold-duotone",
  },

  // 5. LOCAL BUSINESS
  {
    to: "/p/$projectId/local-business" as const,
    label: "Local Business Hub",
    benefit:
      "Listing Management, Google Business Profile (GBP) Optimization, Unified Review Inbox, and Map Rank Tracker Geo-Grid Heatmap.",
    icon: Store,
    solarIcon: "solar:shop-2-bold-duotone",
  },

  // 6. AI SEARCH & RADAR
  {
    to: "/p/$projectId/brand-lookup" as const,
    label: "Brand Lookup",
    benefit:
      "Evaluate brand perception and identity signals across digital channels to strengthen overall brand authority and search trust.",
    icon: Sparkles,
    solarIcon: "solar:stars-bold-duotone",
  },
  {
    to: "/p/$projectId/brand-mentions" as const,
    label: "Brand Mentions & AEO",
    benefit:
      "Protect your brand authority 24/7. Get alerted when blogs, forums, or AI engines talk about your brand or your competitors.",
    icon: MessageSquare,
    solarIcon: "solar:chat-round-line-bold-duotone",
  },
  {
    to: "/p/$projectId/prompt-explorer" as const,
    label: "Prompt Explorer",
    benefit:
      "Get recommended by ChatGPT, Perplexity & Claude. Find the exact articles AI models cite so you can get featured and win AI buyers.",
    icon: MessageSquare,
    solarIcon: "solar:magnifer-bug-bold-duotone",
  },
] as const;

export const indexingNavItem = linkOptions({
  to: "/indexing" as const,
  label: "Instant Indexing",
  benefit:
    "Get Google & Bing to index your new articles in hours rather than weeks, so you capture traffic and rankings ahead of everyone else.",
  icon: Sparkles,
  solarIcon: "solar:bolt-bold-duotone",
});

export const uptimeNavItem = linkOptions({
  to: "/uptime" as const,
  label: "Uptime & SSL",
  benefit:
    "Never lose sales to silent website outages or expired SSL warnings with 24/7 proactive monitoring before customers bounce.",
  icon: Activity,
  solarIcon: "solar:radar-bold-duotone",
});

export const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "Skorvia AI & MCP",
  benefit:
    "Supercharge your workflow with your personal 24/7 CMO agent and Model Context Protocol server that turns data into instant growth plays.",
  icon: Bot,
  solarIcon: "solar:cpu-bolt-bold-duotone",
});

export const billingNavItem = linkOptions({
  to: "/billing" as const,
  label: "Billing & Plans",
  benefit:
    "Manage your subscription, credit usage balance, auto-recharge settings, and upgrade to unlock advanced agency tiers.",
  icon: CreditCard,
  solarIcon: "solar:card-2-bold-duotone",
});

export const settingsNavItem = linkOptions({
  to: "/settings" as const,
  label: "Settings",
  icon: Settings,
  solarIcon: "solar:settings-bold-duotone",
});

export const helpNavItem = linkOptions({
  to: "/help/dataforseo-api-key" as const,
  label: "Help & Documentation",
  benefit:
    "Guides, API credentials setup, and step-by-step tutorials to get the most out of Skorvia.",
  icon: FileText,
  solarIcon: "solar:question-circle-bold-duotone",
});

export function getGrowthToolsNavGroup(isAgency = false) {
  return {
    label: "Growth & Platform Tools",
    items: [indexingNavItem, uptimeNavItem, aiNavItem, helpNavItem],
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
      solarIcon: "solar:widget-6-bold-duotone",
      items: [
        byPath("/p/$projectId"),
        byPath("/p/$projectId/roadmap"),
        byPath("/p/$projectId/my-analysis"),
      ],
    },
    {
      label: "Brand & Ad Readiness",
      solarIcon: "solar:shield-star-bold-duotone",
      items: [
        byPath("/p/$projectId/brand-analysis"),
        byPath("/p/$projectId/trust-sentiment"),
        byPath("/p/$projectId/viral-detector"),
      ],
    },
    {
      label: "Competitor Intelligence",
      solarIcon: "solar:swords-bold-duotone",
      items: [
        byPath("/p/$projectId/competitors"),
        byPath("/p/$projectId/competitor-analysis"),
      ],
    },
    {
      label: "Organic Search (SEO)",
      solarIcon: "solar:minimalistic-magnifer-bold-duotone",
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
      label: "Local Business",
      solarIcon: "solar:shop-2-bold-duotone",
      items: [byPath("/p/$projectId/local-business")],
    },
    {
      label: "AI Search & Radar",
      solarIcon: "solar:radar-bold-duotone",
      items: [
        byPath("/p/$projectId/brand-lookup"),
        byPath("/p/$projectId/brand-mentions"),
        byPath("/p/$projectId/prompt-explorer"),
      ],
    },
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
