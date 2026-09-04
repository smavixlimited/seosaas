import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicTrackingCodes } from "@/serverFunctions/system-settings";

export function TrackingHeadInjector() {
  const trackingQuery = useQuery({
    queryKey: ["publicTrackingCodes"],
    queryFn: () => getPublicTrackingCodes(),
    staleTime: 5 * 60 * 1000,
  });

  const tracking = trackingQuery.data;

  React.useEffect(() => {
    if (!tracking || typeof document === "undefined") return;

    // 1. Google Search Console Verification Meta Tag
    if (tracking.gscSiteVerificationTag) {
      const existingGsc = document.querySelector('meta[name="google-site-verification"]');
      let token = tracking.gscSiteVerificationTag;
      // Extract content if full tag was pasted
      if (token.includes('content="')) {
        const match = token.match(/content=["']([^"']+)["']/);
        if (match) token = match[1];
      }
      if (!existingGsc && token) {
        const meta = document.createElement("meta");
        meta.name = "google-site-verification";
        meta.content = token;
        document.head.appendChild(meta);
      }
    }

    // 2. Google Analytics (GA4) Script
    if (tracking.ga4MeasurementId && !document.getElementById("ga4-script")) {
      const gaScript = document.createElement("script");
      gaScript.id = "ga4-script";
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.ga4MeasurementId}`;
      document.head.appendChild(gaScript);

      const gaInline = document.createElement("script");
      gaInline.id = "ga4-inline";
      gaInline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${tracking.ga4MeasurementId}');
      `;
      document.head.appendChild(gaInline);
    }

    // 3. Meta Pixel (Facebook Pixel) Script
    if (tracking.metaPixelId && !document.getElementById("meta-pixel-script")) {
      const pixelScript = document.createElement("script");
      pixelScript.id = "meta-pixel-script";
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${tracking.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
    }
  }, [tracking]);

  return null;
}
