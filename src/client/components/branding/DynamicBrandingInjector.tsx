import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicBranding } from "@/serverFunctions/system-settings";

export function DynamicBrandingInjector() {
  const brandingQuery = useQuery({
    queryKey: ["publicBranding"],
    queryFn: () => getPublicBranding(),
    staleTime: 5 * 60 * 1000,
  });

  const branding = brandingQuery.data;

  React.useEffect(() => {
    if (!branding || typeof document === "undefined") return;

    // 1. Dynamic Favicon injection
    if (branding.faviconUrl) {
      const faviconUrl = branding.faviconUrl;

      // Update existing or create favicon links
      const iconSelectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
      ];

      const existingIcons = document.querySelectorAll(iconSelectors.join(", "));
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          el.setAttribute("href", faviconUrl);
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    }

    // 2. Dynamic Document Title update if configured
    if (branding.siteTitle) {
      const currentTitle = document.title;
      if (!currentTitle || currentTitle.includes("OpenSEO") || currentTitle.includes("Skorvia")) {
        const tagline = branding.tagline || "Enterprise SEO & Growth SaaS";
        document.title = `${branding.siteTitle} — ${tagline}`;
      }
    }
  }, [branding]);

  return null;
}
