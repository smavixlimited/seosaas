import { createFileRoute } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

function generateOgSvg(params: {
  title: string;
  description?: string;
  badge?: string;
}): string {
  const {
    title,
    description,
    badge = "Enterprise SEO & AEO Platform",
  } = params;

  // Escape XML entities
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const safeDesc = (
    description ||
    "Next-generation keyword tracking, local map geo-grid, and AI answer engine optimization."
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const safeBadge = badge
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f114a" />
      <stop offset="50%" stop-color="#17199b" />
      <stop offset="100%" stop-color="#090a2a" />
    </linearGradient>
    <linearGradient id="text-grad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#bg-grad)" />

  <!-- Ambient Glow Circles -->
  <circle cx="1000" cy="150" r="250" fill="#4338ca" opacity="0.4" filter="url(#glow)" />
  <circle cx="200" cy="500" r="200" fill="#6366f1" opacity="0.25" filter="url(#glow)" />

  <!-- Border Frame -->
  <rect x="40" y="40" width="1120" height="550" rx="32" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2" />

  <!-- Top Left Brand Badge -->
  <g transform="translate(90, 95)">
    <rect width="44" height="44" rx="14" fill="#ffffff" fill-opacity="0.15" />
    <text x="56" y="30" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="-0.5">
      ${BRAND_CONFIG.name}
    </text>
    <rect x="180" y="8" width="80" height="28" rx="8" fill="#4f46e5" />
    <text x="195" y="27" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="0.5">
      AI AEO
    </text>
  </g>

  <!-- Category Badge -->
  <g transform="translate(90, 180)">
    <rect width="320" height="38" rx="19" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.2" />
    <text x="24" y="24" fill="#a5b4fc" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">
      ✦ ${safeBadge}
    </text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(90, 290)">
    <text fill="url(#text-grad)" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1.5">
      <tspan x="0" dy="0">${safeTitle.slice(0, 42)}</tspan>
      ${safeTitle.length > 42 ? `<tspan x="0" dy="64">${safeTitle.slice(42, 85)}</tspan>` : ""}
    </text>
  </g>

  <!-- Subtitle Description -->
  <g transform="translate(90, 440)">
    <text fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">
      <tspan x="0" dy="0">${safeDesc.slice(0, 75)}</tspan>
      ${safeDesc.length > 75 ? `<tspan x="0" dy="30">${safeDesc.slice(75, 150)}...</tspan>` : ""}
    </text>
  </g>

  <!-- Bottom Proof Metrics -->
  <g transform="translate(90, 525)">
    <text fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">
      3.2B+ Indexed Keywords  •  99.9% Uptime  •  Local Map Geo-Grid  •  ChatGPT &amp; Perplexity AEO
    </text>
  </g>
</svg>`;
}

export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const title =
          url.searchParams.get("title") ||
          `${BRAND_CONFIG.name} — Modern SEO & AI Visibility Platform`;
        const description = url.searchParams.get("description") || undefined;
        const badge = url.searchParams.get("badge") || undefined;

        const svg = generateOgSvg({ title, description, badge });

        return new Response(svg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control":
              "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});
