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
  {
    to: "/p/$projectId" as const,
    label: "Dashboard",
    benefit: "See your entire growth trajectory at a glance—spot traffic wins, catch ranking drops early, and know your #1 priority task this week.",
    icon: LayoutDashboard,
    solarIcon: "solar:widget-6-bold-duotone",
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/roadmap" as const,
    label: "Action Roadmap",
    benefit: "Get prioritized, step-by-step action items engineered to deliver the fastest organic traffic gains for your Brand.",
    icon: CheckSquare,
    solarIcon: "solar:checklist-minimalistic-bold-duotone",
  },
  {
    to: "/p/$projectId/ad-readiness" as const,
    label: "Conversion & Ad Readiness",
    benefit: "Never waste ad spend again. Catch conversion leaks, copy friction, and verify Meta & Google tracking pixels before spending on ads.",
    icon: Gauge,
    solarIcon: "solar:chart-square-bold-duotone",
  },
  {
    to: "/p/$projectId/local-business" as const,
    label: "Local Business",
    benefit: "Dominate Google Maps in your city, fix citation mismatches across 33 directories, and get more 5-star customer reviews on autopilot.",
    icon: Store,
    solarIcon: "solar:shop-2-bold-duotone",
  },
  {
    to: "/p/$projectId/keywords" as const,
    label: "Keyword Research",
    benefit: "Find easy-to-rank keywords with real search volume that bring paying customers to your website instead of high-competition dead ends.",
    icon: Search,
    solarIcon: "solar:minimalistic-magnifer-bold-duotone",
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Saved Keywords",
    benefit: "Organize target keywords into high-value clusters, track seasonal demand, and assign them directly to content briefs.",
    icon: Bookmark,
    solarIcon: "solar:bookmark-opened-bold-duotone",
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Rank Tracking",
    benefit: "Never guess your Google positions. Track daily rank movements on mobile & desktop, and get alerted the moment you hit page #1.",
    icon: TrendingUp,
    solarIcon: "solar:chart-square-bold-duotone",
  },
  {
    to: "/p/$projectId/search-performance" as const,
    label: "GSC Insights",
    benefit: "Turn raw Google data into revenue. Spot high-impression keywords where quick title tweaks can immediately double your organic clicks.",
    icon: GoogleGlyphMuted,
    solarIcon: "solar:chart-2-bold-duotone",
  },
  {
    to: "/p/$projectId/domain" as const,
    label: "Domain Overview",
    benefit: "X-ray any website's search performance. Discover what's driving their traffic, their top money pages, and where their weaknesses lie.",
    icon: Globe,
    solarIcon: "solar:global-bold-duotone",
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinks",
    benefit: "Build domain authority that Google respects. Find out who links to your competitors and claim high-impact backlinks to outrank them.",
    icon: Link2,
    solarIcon: "solar:link-circle-bold-duotone",
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Site Audit",
    benefit: "Prevent silent ranking penalties. Automatically find and fix broken links, slow pages, and technical crawl blockers before Google demotes you.",
    icon: ClipboardCheck,
    solarIcon: "solar:shield-check-bold-duotone",
  },
  {
    to: "/p/$projectId/brand-lookup" as const,
    label: "Brand Lookup",
    benefit: "Evaluate brand perception and identity signals across digital channels to strengthen overall brand authority and search trust.",
    icon: Sparkles,
    solarIcon: "solar:stars-bold-duotone",
  },
  {
    to: "/p/$projectId/brand-mentions" as const,
    label: "Brand Mentions & AEO",
    benefit: "Protect your brand authority 24/7. Get alerted when blogs, forums, or AI engines talk about your brand or your competitors.",
    icon: MessageSquare,
    solarIcon: "solar:chat-round-line-bold-duotone",
  },
  {
    to: "/p/$projectId/prompt-explorer" as const,
    label: "Prompt Explorer",
    benefit: "Get recommended by ChatGPT, Perplexity & Claude. Find the exact articles AI models cite so you can get featured and win AI buyers.",
    icon: MessageSquare,
    solarIcon: "solar:magnifer-bug-bold-duotone",
  },
  {
    to: "/p/$projectId/scraper" as const,
    label: "Competitor Page Decoder",
    benefit: "Steal your competitor's ranking playbook in 5 seconds. Uncover their target keywords, content structure, and internal link strategy.",
    icon: Flame,
    solarIcon: "solar:fire-bold-duotone",
  },
] as const;

export const indexingNavItem = linkOptions({
  to: "/indexing" as const,
  label: "Instant Indexing",
  benefit: "Get Google & Bing to index your new articles in hours rather than weeks, so you capture traffic and rankings ahead of everyone else.",
  icon: Sparkles,
  solarIcon: "solar:bolt-bold-duotone",
});

export const uptimeNavItem = linkOptions({
  to: "/uptime" as const,
  label: "Uptime & SSL",
  benefit: "Never lose sales to silent website outages or expired SSL warnings with 24/7 proactive monitoring before customers bounce.",
  icon: Activity,
  solarIcon: "solar:radar-bold-duotone",
});

export const whiteLabelNavItem = linkOptions({
  to: "/white-label" as const,
  label: "White-Label Reports",
  benefit: "Win more clients and justify retainers with stunning, presentation-ready PDF audit reports stamped with your agency's logo and colors.",
  icon: FileText,
  solarIcon: "solar:document-text-bold-duotone",
});

export const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "Skorvia AI & MCP",
  benefit: "Supercharge your workflow with your personal 24/7 CMO agent and Model Context Protocol server that turns data into instant growth plays.",
  icon: Bot,
  solarIcon: "solar:cpu-bolt-bold-duotone",
});

export const billingNavItem = linkOptions({
  to: "/billing" as const,
  label: "Billing & Plans",
  benefit: "Manage your subscription, credit usage balance, auto-recharge settings, and upgrade to unlock advanced agency tiers.",
  icon: CreditCard,
  solarIcon: "solar:card-2-bold-duotone",
});

export const settingsNavItem = linkOptions({
  to: "/settings" as const,
  label: "Settings",
  icon: Settings,
  solarIcon: "solar:settings-bold-duotone",
});

// SaaS expansion tools - White-Label Reports is exclusive to Agency & Scale plan subscribers
export function getGrowthToolsNavGroup(isAgency = false) {
  return {
    label: "Growth & Agency Suite",
    items: [
      indexingNavItem,
      uptimeNavItem,
      ...(isAgency ? [whiteLabelNavItem] : []),
      aiNavItem,
    ],
  };
}

export const growthToolsNavGroup = getGrowthToolsNavGroup(false);

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

// Grouped by scope matching Venix Sidebar architecture
export function getProjectNavGroups(projectId: string) {
  const all = getProjectNavItems(projectId);
  const byPath = (path: (typeof projectNavItems)[number]["to"]) =>
    all.find((i) => i.to === path)!;

  return [
    {
      label: "Brand Command Center",
      items: [
        byPath("/p/$projectId"),
        byPath("/p/$projectId/roadmap"),
        byPath("/p/$projectId/ad-readiness"),
      ],
    },
    {
      label: "Local Business",
      items: [
        byPath("/p/$projectId/local-business"),
      ],
    },
    {
      label: "SEO & Search Research",
      items: [
        byPath("/p/$projectId/keywords"),
        byPath("/p/$projectId/saved"),
        byPath("/p/$projectId/domain"),
        byPath("/p/$projectId/backlinks"),
        byPath("/p/$projectId/rank-tracking"),
        byPath("/p/$projectId/search-performance"),
        byPath("/p/$projectId/audit"),
      ],
    },
    {
      label: "AI Search & AEO Radar",
      items: [
        byPath("/p/$projectId/brand-lookup"),
        byPath("/p/$projectId/brand-mentions"),
        byPath("/p/$projectId/prompt-explorer"),
      ],
    },
    {
      label: "Competitive Intelligence",
      items: [
        byPath("/p/$projectId/scraper"),
      ],
    },
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
