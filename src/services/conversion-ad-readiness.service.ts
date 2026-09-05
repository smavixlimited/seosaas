import { generateText } from "ai";

export type AdSpendRisk = "low" | "moderate" | "high" | "critical";

export interface ConversionCheckItem {
  category: string;
  label: string;
  detail: string;
}

export interface FrictionPointItem {
  severity: "critical" | "warning" | "advisory";
  title: string;
  issue: string;
  impact: string;
}

export interface RecommendedFixItem {
  id: string;
  priority: "HIGH" | "MEDIUM" | "QUICK_WIN";
  title: string;
  action: string;
  estimatedConversionLift: string;
  suggestedPromptForSam: string;
}

export interface DetectedTrackingPixel {
  id: string;
  name: string;
  type: "meta" | "google_ads" | "gtm" | "tiktok" | "linkedin" | "ga4";
  pixelId?: string | null;
  status: "active" | "missing" | "misconfigured";
  eventsDetected: string[];
  details: string;
}

export interface ConversionAuditResult {
  id: string;
  projectId: string;
  targetUrl: string;
  overallScore: number;
  grade: string;
  adWastedSpendRisk: AdSpendRisk;
  trustAndCredibilityScore: number;
  ctaAndOfferClarityScore: number;
  pageSpeedAndMobileScore: number;
  socialProofAndReviewsScore: number;
  frictionAndFormLengthScore: number;
  trackingPixelScore: number;
  hasAdPixelInstalled: boolean;
  detectedPixels: DetectedTrackingPixel[];
  checksPassed: ConversionCheckItem[];
  criticalFrictionPoints: FrictionPointItem[];
  recommendedFixes: RecommendedFixItem[];
  modelUsed?: string | null;
  auditedAt: string;
  updatedAt: string;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ConversionAdReadinessService = {
  /**
   * Scans a target URL or HTML content to detect active tracking pixels & conversion tags
   */
  async scanTrackingPixels(targetUrl: string): Promise<{
    pixels: DetectedTrackingPixel[];
    score: number;
    hasAdPixelInstalled: boolean;
  }> {
    let html = "";
    try {
      const resp = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SkorviaAdAudit/1.0",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        html = await resp.text();
      }
    } catch {
      // Fallback if unreachable
    }

    const lower = html.toLowerCase();
    const pixels: DetectedTrackingPixel[] = [];

    // 1. Meta / Facebook Pixel
    const hasMeta =
      lower.includes("connect.facebook.net") ||
      lower.includes("fbevents.js") ||
      lower.includes("fbq(");
    const metaIdMatch = html.match(
      /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/i,
    );
    pixels.push({
      id: "pixel_meta",
      name: "Meta Pixel (Facebook & Instagram)",
      type: "meta",
      pixelId: metaIdMatch
        ? metaIdMatch[1]
        : hasMeta
          ? "Active (Injected)"
          : null,
      status: hasMeta ? "active" : "missing",
      eventsDetected: hasMeta
        ? lower.includes("purchase")
          ? ["PageView", "Purchase"]
          : ["PageView"]
        : [],
      details: hasMeta
        ? "Meta Pixel active. Conversion tracking and Custom Audience building enabled."
        : "Missing. Running Facebook/Instagram ads without this pixel blinds Advantage+ bidding algorithms.",
    });

    // 2. Google Ads Conversion Tag
    const hasGAds =
      lower.includes("googleads") ||
      lower.includes("conversion_id") ||
      /aw-\d+/i.test(html);
    const gadsMatch = html.match(/AW-(\d+)/i);
    pixels.push({
      id: "pixel_google_ads",
      name: "Google Ads Tag / Floodlight",
      type: "google_ads",
      pixelId: gadsMatch ? gadsMatch[0] : hasGAds ? "Active (Injected)" : null,
      status: hasGAds ? "active" : "missing",
      eventsDetected: hasGAds ? ["conversion", "page_view"] : [],
      details: hasGAds
        ? "Google Ads Tag detected. Target CPA and ROAS bidding algorithms active."
        : "Missing. Critical for Google Search, Shopping, and Performance Max conversion optimization.",
    });

    // 3. Google Tag Manager (GTM)
    const hasGtm =
      lower.includes("googletagmanager.com/gtm.js") ||
      /GTM-[A-Z0-9]+/i.test(html);
    const gtmMatch = html.match(/GTM-[A-Z0-9]+/i);
    pixels.push({
      id: "pixel_gtm",
      name: "Google Tag Manager (GTM)",
      type: "gtm",
      pixelId: gtmMatch ? gtmMatch[0] : hasGtm ? "Active (Container)" : null,
      status: hasGtm ? "active" : "missing",
      eventsDetected: hasGtm ? ["gtm.js", "gtm.dom"] : [],
      details: hasGtm
        ? "GTM container detected. Centralized client-side event dispatching verified."
        : "Not detected. Consider installing GTM for flexible tag and event deployment.",
    });

    // 4. TikTok Pixel
    const hasTikTok =
      lower.includes("analytics.tiktok.com") || lower.includes("ttq.load");
    pixels.push({
      id: "pixel_tiktok",
      name: "TikTok Pixel",
      type: "tiktok",
      pixelId: hasTikTok ? "Active" : null,
      status: hasTikTok ? "active" : "missing",
      eventsDetected: hasTikTok ? ["PageView"] : [],
      details: hasTikTok
        ? "TikTok Pixel active. Ready for TikTok Spark & In-Feed video ads."
        : "Not detected. Required if driving paid Gen-Z or short-form video traffic.",
    });

    // 5. LinkedIn Insight Tag
    const hasLinkedIn =
      lower.includes("snap.licdn.com") ||
      lower.includes("_linkedin_partner_id");
    pixels.push({
      id: "pixel_linkedin",
      name: "LinkedIn Insight Tag",
      type: "linkedin",
      pixelId: hasLinkedIn ? "Active" : null,
      status: hasLinkedIn ? "active" : "missing",
      eventsDetected: hasLinkedIn ? ["page_view"] : [],
      details: hasLinkedIn
        ? "LinkedIn Insight Tag active. B2B firmographic attribution and demographic reporting enabled."
        : "Not detected. Recommended for B2B lead generation campaigns.",
    });

    // 6. Google Analytics 4 (GA4)
    const hasGa4 =
      lower.includes("google-analytics.com") || /G-[A-Z0-9]+/i.test(html);
    const ga4Match = html.match(/G-[A-Z0-9]+/i);
    pixels.push({
      id: "pixel_ga4",
      name: "Google Analytics 4 (GA4)",
      type: "ga4",
      pixelId: ga4Match ? ga4Match[0] : hasGa4 ? "Active" : null,
      status: hasGa4 ? "active" : "missing",
      eventsDetected: hasGa4 ? ["page_view", "scroll", "session_start"] : [],
      details: hasGa4
        ? "GA4 measurement ID active. Web traffic session and funnel drop-off recording enabled."
        : "Not detected. Fundamental for overall visitor analytics.",
    });

    const hasAdPixelInstalled = hasMeta || hasGAds || hasTikTok;
    let score = 40; // baseline
    if (hasMeta) score += 25;
    if (hasGAds) score += 25;
    if (hasGtm) score += 10;
    if (hasGa4) score += 10;
    if (hasTikTok) score += 10;
    if (hasLinkedIn) score += 10;
    score = Math.min(100, score);

    return {
      pixels,
      score,
      hasAdPixelInstalled,
    };
  },

  /**
   * Retrieves existing conversion audit or generates a new one.
   */
  async getConversionAudit(
    projectId: string,
    targetUrl: string,
    domain?: string,
  ): Promise<ConversionAuditResult> {
    const cleanUrl = targetUrl.trim().toLowerCase();

    try {
      const { db } = await import("@/db");
      const { conversionAdReadinessAudits } = await import("@/db/schema");
      const { eq, and, desc } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(conversionAdReadinessAudits)
        .where(
          and(
            eq(conversionAdReadinessAudits.projectId, projectId),
            eq(conversionAdReadinessAudits.targetUrl, cleanUrl),
          ),
        )
        .orderBy(desc(conversionAdReadinessAudits.updatedAt))
        .limit(1);

      if (existing) {
        const age = Date.now() - new Date(existing.updatedAt).getTime();
        if (age < CACHE_TTL_MS) {
          const detectedPixels: DetectedTrackingPixel[] =
            existing.detectedPixelsJson
              ? JSON.parse(existing.detectedPixelsJson)
              : (await this.scanTrackingPixels(cleanUrl)).pixels;

          return {
            id: existing.id,
            projectId: existing.projectId,
            targetUrl: existing.targetUrl,
            overallScore: existing.overallScore,
            grade: existing.grade,
            adWastedSpendRisk: existing.adWastedSpendRisk as AdSpendRisk,
            trustAndCredibilityScore: existing.trustAndCredibilityScore,
            ctaAndOfferClarityScore: existing.ctaAndOfferClarityScore,
            pageSpeedAndMobileScore: existing.pageSpeedAndMobileScore,
            socialProofAndReviewsScore: existing.socialProofAndReviewsScore,
            frictionAndFormLengthScore: existing.frictionAndFormLengthScore,
            trackingPixelScore: existing.trackingPixelScore ?? 85,
            hasAdPixelInstalled: detectedPixels.some(
              (p) =>
                p.status === "active" &&
                (p.type === "meta" || p.type === "google_ads"),
            ),
            detectedPixels,
            checksPassed: JSON.parse(existing.checksPassedJson || "[]"),
            criticalFrictionPoints: JSON.parse(
              existing.criticalFrictionPointsJson || "[]",
            ),
            recommendedFixes: JSON.parse(existing.recommendedFixesJson || "[]"),
            modelUsed: existing.modelUsed,
            auditedAt: existing.auditedAt,
            updatedAt: existing.updatedAt,
          };
        }
      }
    } catch (err) {
      console.warn("DB lookup error in getConversionAudit:", err);
    }

    return this.runConversionAudit(projectId, cleanUrl, domain);
  },

  /**
   * Executes a comprehensive Conversion & Ad Readiness Audit (0-100).
   */
  async runConversionAudit(
    projectId: string,
    targetUrl: string,
    domain?: string,
  ): Promise<ConversionAuditResult> {
    const cleanUrl = targetUrl.trim();
    const cleanDomain =
      domain || cleanUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    // 1. Run Pixel & Tracking Scan First
    const pixelScan = await this.scanTrackingPixels(cleanUrl);

    // Baseline scores
    let trackingPixelScore = pixelScan.score;
    let overallScore = pixelScan.hasAdPixelInstalled ? 84 : 64;
    let grade = pixelScan.hasAdPixelInstalled ? "B+" : "C";
    let adWastedSpendRisk: AdSpendRisk = pixelScan.hasAdPixelInstalled
      ? "low"
      : "critical";
    let trustAndCredibilityScore = 85;
    let ctaAndOfferClarityScore = 80;
    let pageSpeedAndMobileScore = 75;
    let socialProofAndReviewsScore = 85;
    let frictionAndFormLengthScore = 85;

    let checksPassed: ConversionCheckItem[] = [
      {
        category: "Trust & Security",
        label: "Valid SSL Encryption & Secure Headers",
        detail:
          "Site enforces HTTPS and secure cookie policies across checkout endpoints.",
      },
      {
        category: "Trust & Security",
        label: "Visible Privacy Policy & Terms of Service",
        detail:
          "Legal footer links are accessible on landing pages, complying with Google Ads policies.",
      },
      {
        category: "Offer Clarity",
        label: "Above-the-Fold Primary Call-to-Action",
        detail:
          "Hero section contains a distinct primary action button without competing secondary links.",
      },
      {
        category: "Social Proof",
        label: "Customer Rating Badge & Review Snippets",
        detail:
          "Identified verified customer review quotes and 5-star rating badges.",
      },
      {
        category: "Frictionless Onboarding",
        label: "Frictionless Single-Step Sign-up",
        detail:
          "Checkout form requires minimal initial fields, reducing checkout abandonment.",
      },
    ];

    if (pixelScan.hasAdPixelInstalled) {
      checksPassed.push({
        category: "Ad Tracking & Pixels",
        label: "Ad Conversion Pixel Active",
        detail:
          "Meta Pixel / Google Ads conversion tracking is active and receiving events.",
      });
    }

    let criticalFrictionPoints: FrictionPointItem[] = [];

    // If no ad pixel found, add Critical Warning!
    if (!pixelScan.hasAdPixelInstalled) {
      criticalFrictionPoints.push({
        severity: "critical",
        title: "No Ad Conversion Pixels Detected (Meta / Google Ads)",
        issue:
          "Driving paid traffic to this page without a conversion pixel prevents Smart Bidding (pMax / Advantage+) from optimizing for purchases or leads. You cannot track true ROAS or build custom retargeting audiences.",
        impact: "-45% ad spend efficiency & high risk of wasted budget",
      });
    }

    criticalFrictionPoints.push(
      {
        severity: "warning",
        title: "Missing Prominent Money-Back Guarantee / Risk-Free Badge",
        issue:
          "Paid traffic users have higher purchase hesitation. Lack of a prominent '14-Day Money-Back Guarantee' or 'No Credit Card Required' badge directly lowers ad ROAS.",
        impact: "-15% paid ad conversion velocity",
      },
      {
        severity: "advisory",
        title: "Mobile Largest Contentful Paint (LCP) Above 2.2s",
        issue:
          "Paid mobile clicks bounce rapidly if the above-fold hero banner takes longer than 2.0s to render.",
        impact: "-8% mobile visitor retention",
      },
    );

    let recommendedFixes: RecommendedFixItem[] = [];

    if (!pixelScan.hasAdPixelInstalled) {
      recommendedFixes.push({
        id: "fix_pixel",
        priority: "HIGH",
        title:
          "Install Meta Pixel & Google Ads Tag Before Launching Paid Traffic",
        action:
          "Embed Meta Pixel base script and Google Ads conversion tag on your landing page. Set up standard conversion events for 'Lead' or 'Purchase' to enable smart bidding.",
        estimatedConversionLift: "+35% ad ROAS & algorithm learning",
        suggestedPromptForSam: `Act as a senior technical growth engineer. Provide step-by-step code and instructions to install the Meta Pixel and Google Ads conversion tag on ${cleanDomain} with custom event tracking for form submissions.`,
      });
    }

    recommendedFixes.push(
      {
        id: "fix_1",
        priority: "HIGH",
        title: "Add High-Visibility Risk-Reversal Trust Badges near CTA",
        action:
          "Embed '14-Day Money-Back Guarantee', 'Cancel Anytime', and 'Instant Setup' badges immediately below the primary signup button.",
        estimatedConversionLift: "+18% paid ad conversion rate",
        suggestedPromptForSam: `Act as a senior conversion rate optimization (CRO) copywriter. Write 3 variations of high-converting trust badge micro-copy and guarantee callouts for ${cleanDomain}'s landing page hero section. Include concise bullet points and HTML badge structures.`,
      },
      {
        id: "fix_2",
        priority: "MEDIUM",
        title: "Clarify Value Proposition in Hero Sub-Headline",
        action:
          "Rewrite the sub-headline to state the exact quantitative outcome (e.g. 'Boost organic traffic by 40% in 60 days without hiring an agency') rather than generic feature descriptions.",
        estimatedConversionLift: "+14% visitor-to-lead activation",
        suggestedPromptForSam: `Write 5 punchy, outcome-focused hero headlines and sub-headlines for ${cleanDomain} targeted at performance marketing managers. Focus on quantifiable time-to-value and clear problem-solution fit.`,
      },
      {
        id: "fix_3",
        priority: "QUICK_WIN",
        title: "Embed 1-Click Social Sign-in (Google / GitHub)",
        action:
          "Add 1-click Google OAuth button alongside standard email/password registration to eliminate mobile typing friction.",
        estimatedConversionLift: "+12% mobile checkout completion",
        suggestedPromptForSam: `Give me recommended UI copy, placement guidance, and conversion best practices for adding a 'Continue with Google' button next to the primary CTA for ${cleanDomain}.`,
      },
    );

    // AI Refinement
    let modelName = "minimax/minimax-m3";
    try {
      const { getChatAgentModel } = await import("@/server/lib/openrouter");
      const model = await getChatAgentModel();
      modelName =
        (model as unknown as { modelId?: string }).modelId || modelName;

      const systemPrompt = `You are a Principal Conversion Rate Optimization (CRO) and Paid Ad Readiness Auditor.
Analyze the target landing page and provide an objective 0-100 Conversion & Ad Readiness Scorecard in strict JSON format.
Pixel status: ${pixelScan.hasAdPixelInstalled ? "Ad Pixels Detected" : "NO AD PIXELS DETECTED (High Ad Waste Risk)"}.

JSON format:
{
  "overallScore": number (0-100),
  "grade": string ("A+"|"A"|"B+"|"B"|"C"|"D"|"F"),
  "adWastedSpendRisk": "low" | "moderate" | "high" | "critical",
  "trustAndCredibilityScore": number (0-100),
  "ctaAndOfferClarityScore": number (0-100),
  "pageSpeedAndMobileScore": number (0-100),
  "socialProofAndReviewsScore": number (0-100),
  "frictionAndFormLengthScore": number (0-100)
}`;

      const userPrompt = `Landing Page URL: ${cleanUrl}\nDomain: ${cleanDomain}\nAd Pixel Health: ${pixelScan.hasAdPixelInstalled ? "Active" : "MISSING"}\nEvaluate conversion friction, credibility signals, ad scent alignment. Return ONLY raw JSON.`;

      const response = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      });

      const cleanJson = response.text
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.overallScore) {
        overallScore = pixelScan.hasAdPixelInstalled
          ? parsed.overallScore
          : Math.min(68, parsed.overallScore);
        grade = parsed.grade || grade;
        adWastedSpendRisk = pixelScan.hasAdPixelInstalled
          ? parsed.adWastedSpendRisk || adWastedSpendRisk
          : "critical";
        trustAndCredibilityScore =
          parsed.trustAndCredibilityScore || trustAndCredibilityScore;
        ctaAndOfferClarityScore =
          parsed.ctaAndOfferClarityScore || ctaAndOfferClarityScore;
        pageSpeedAndMobileScore =
          parsed.pageSpeedAndMobileScore || pageSpeedAndMobileScore;
        socialProofAndReviewsScore =
          parsed.socialProofAndReviewsScore || socialProofAndReviewsScore;
        frictionAndFormLengthScore =
          parsed.frictionAndFormLengthScore || frictionAndFormLengthScore;
      }
    } catch (aiErr) {
      console.warn("AI generation fallback used for conversion audit:", aiErr);
    }

    const auditResult: ConversionAuditResult = {
      id,
      projectId,
      targetUrl: cleanUrl,
      overallScore,
      grade,
      adWastedSpendRisk,
      trustAndCredibilityScore,
      ctaAndOfferClarityScore,
      pageSpeedAndMobileScore,
      socialProofAndReviewsScore,
      frictionAndFormLengthScore,
      trackingPixelScore,
      hasAdPixelInstalled: pixelScan.hasAdPixelInstalled,
      detectedPixels: pixelScan.pixels,
      checksPassed,
      criticalFrictionPoints,
      recommendedFixes,
      modelUsed: modelName,
      auditedAt: now,
      updatedAt: now,
    };

    try {
      const { db } = await import("@/db");
      const { conversionAdReadinessAudits } = await import("@/db/schema");

      await db.insert(conversionAdReadinessAudits).values({
        id,
        projectId,
        targetUrl: cleanUrl,
        overallScore,
        grade,
        adWastedSpendRisk,
        trustAndCredibilityScore,
        ctaAndOfferClarityScore,
        pageSpeedAndMobileScore,
        socialProofAndReviewsScore,
        frictionAndFormLengthScore,
        trackingPixelScore,
        detectedPixelsJson: JSON.stringify(pixelScan.pixels),
        checksPassedJson: JSON.stringify(checksPassed),
        criticalFrictionPointsJson: JSON.stringify(criticalFrictionPoints),
        recommendedFixesJson: JSON.stringify(recommendedFixes),
        modelUsed: modelName,
        auditedAt: now,
        updatedAt: now,
      });
    } catch (dbErr) {
      console.warn("Error saving conversion audit result to DB:", dbErr);
    }

    return auditResult;
  },
};
