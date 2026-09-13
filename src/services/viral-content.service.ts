import { db } from "@/db";
import { viralContentItems } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { BrandCompetitorService } from "@/services/brand-competitor.service";
import { getCountryDisplayName, getCountryCode } from "@/shared/country-helper";
import { generateText } from "ai";

export type ViralPlatform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "x"
  | "linkedin";
export type OpportunityType =
  | "trending_format"
  | "hook_framework"
  | "competitor_viral"
  | "angle_gap";

export interface ViralOpportunityItem {
  id: string;
  projectId: string;
  title: string;
  platform: ViralPlatform;
  opportunityType: OpportunityType;
  viralPotentialScore: number; // 0-100
  hookText: string;
  scriptOutline: string;
  targetAudience: string;
  tags: string[];
  status: "suggested" | "saved" | "created" | "dismissed";
  createdAt: string;
}

// Curated industry + country trending viral hooks and story frameworks
const INDUSTRY_COUNTRY_VIRAL_HOOKS: Record<
  string,
  Record<
    string,
    Array<{
      title: string;
      platform: ViralPlatform;
      opportunityType: OpportunityType;
      viralPotentialScore: number;
      hookText: string;
      scriptOutline: string;
      targetAudience: string;
      tags: string[];
    }>
  >
> = {
  "SaaS / Software": {
    US: [
      {
        title: "The 'AI Overviews Killed My Traffic' Breakdown",
        platform: "tiktok",
        opportunityType: "trending_format",
        viralPotentialScore: 97,
        hookText: "If your organic traffic dropped 40% after Google's latest AI Overviews rollout, here is the exact 3-step entity injection fix we used to recover...",
        scriptOutline:
          "1. 0-3s Visual Pattern Interrupt: Show Google Search Console sudden drop graph.\n2. 3-15s Tension / Real Market Truth: Explain why legacy keyword stuffing fails in AI search engines (Perplexity, ChatGPT, SGE).\n3. 15-35s Actionable Solution: Demonstrate schema entity markup and brand positioning that forces AI citation.\n4. 35-45s High-Conversion CTA: Comment 'AUDIT' to get our free 1-click AEO visibility checklist.",
        targetAudience: "US SaaS Founders, Marketers & SEO Directors",
        tags: ["#aioptimisation", "#googleaeo", "#saasgrowth", "#techfounder", "#searchenginetips"],
      },
      {
        title: "The '$15,000 Agency Retainer Scam' Teardown",
        platform: "instagram",
        opportunityType: "angle_gap",
        viralPotentialScore: 94,
        hookText: "Why 80% of US tech startups are firing their $15,000/mo SEO agencies this year and doing this 10-minute automated audit instead...",
        scriptOutline:
          "1. 0-4s Contrarian Hook: Reveal invoices showing high retainers for basic deliverable PDFs.\n2. 4-18s The Bottleneck: Expose how manual SEO reports are obsolete in the era of automated crawl pipelines.\n3. 18-35s The Solution: Walk through autonomous site health monitoring and instant 1-click code fixes.\n4. 35-45s CTA: Save this reel before hiring your next marketing consultant.",
        targetAudience: "Startups, Growth Teams & Small Business Execs",
        tags: ["#marketingtips", "#agencysecrets", "#saashacks", "#entrepreneurship", "#growthhacking"],
      },
      {
        title: "The Contrarian Twitter/X Growth Thread",
        platform: "x",
        opportunityType: "hook_framework",
        viralPotentialScore: 95,
        hookText: "Google search is NOT dying. Bad SEO is dying. Here is how we grew to 120k organic visits/mo while competitors were complaining about AI zero-clicks: 🧵👇",
        scriptOutline:
          "Tweet 1: High-conviction contrarian hook with verifiable proof screenshot.\nTweets 2-3: The 3 Core Pillars (Structured Knowledge Graph, Deep Topic Authority, Instant Tech Hygiene).\nTweets 4-5: Exact tool breakdown and workflow automation.\nTweet 6: Bookmark reminder & RT prompt for full playbook PDF.",
        targetAudience: "Founders, Indie Hackers & Technical Marketers",
        tags: ["#buildinpublic", "#saas", "#growth", "#marketing", "#seo"],
      },
      {
        title: "The B2B Executive Boardroom Insight",
        platform: "linkedin",
        opportunityType: "competitor_viral",
        viralPotentialScore: 91,
        hookText: "We analyzed the top 50 B2B SaaS websites in North America. 72% had critical technical crawl errors blocking their highest-value landing pages.",
        scriptOutline:
          "1. Data-Backed Hook (Authority positioning).\n2. Critical Discovery: Broken canonical links, missing schema, and slow Core Web Vitals are burning enterprise ad spend.\n3. Tactical Fix Blueprint: Step-by-step roadmap to eliminate crawl waste.\n4. Thought-Leadership Prompt: What's the #1 friction point on your product landing pages today?",
        targetAudience: "CMOs, VPs of Growth & Engineering Leaders",
        tags: ["#b2bmarketing", "#enterprisetech", "#executives", "#growthstrategy"],
      },
      {
        title: "The 'Stop Manually Doing Technical SEO' Short",
        platform: "youtube",
        opportunityType: "trending_format",
        viralPotentialScore: 92,
        hookText: "Stop spending 8 hours fixing redirect loops and broken tags. Watch this 1-click AI workflow solve it in 15 seconds flat:",
        scriptOutline:
          "1. 0-5s Screen recording demonstrating painful manual debugging.\n2. 5-25s Live automation demo generating production-ready code fixes.\n3. 25-45s Before vs After metrics and link in description CTA.",
        targetAudience: "Developers, Solopreneurs & Agency Owners",
        tags: ["#shorts", "#webdev", "#automation", "#coding", "#saastips"],
      },
    ],
    NG: [
      {
        title: "The 'Getting Foreign Clients from Lagos' Breakdown",
        platform: "tiktok",
        opportunityType: "trending_format",
        viralPotentialScore: 98,
        hookText: "How Nigerian software builders and agencies are ranking on Google US & UK from Lagos with zero physical office presence...",
        scriptOutline:
          "1. 0-3s Hook: Show dashboard ranking #1 in New York & London.\n2. 3-15s The Secret: Geo-targeted technical schema, local entity signals, and zero-latency CDN hosting.\n3. 15-35s Step-by-Step Implementation: Walk through project setup, high-intent international keyword clustering, and backlink prospecting.\n4. 35-45s CTA: Drop a comment with your website niche to get the setup guide.",
        targetAudience: "Nigerian Tech Founders, Freelancers & Agency Operators",
        tags: ["#techinlagos", "#nigeriantitans", "#freelanceglobal", "#remoteincome", "#saasnigeria"],
      },
      {
        title: "The 'Stop Wasting Dollar Ad Spend' Instagram Reel",
        platform: "instagram",
        opportunityType: "angle_gap",
        viralPotentialScore: 96,
        hookText: "With dollar exchange rates rising, running Meta ads to a broken landing page is burning your capital. Fix these 3 conversion leaks before spending another naira:",
        scriptOutline:
          "1. 0-4s Direct Urgency Hook: Address FX volatility & ad CAC pressure.\n2. 4-20s The 3 Leaks: Mobile load speed, lack of instant trust proof, missing 1-click checkout.\n3. 20-35s The Solution: Run an automated conversion & ad readiness audit.\n4. 35-45s CTA: Save this post and audit your landing page today.",
        targetAudience: "African Business Owners, Founders & Growth Marketers",
        tags: ["#businessinnigeria", "#lagosstartups", "#marketinginlagos", "#growthtips"],
      },
      {
        title: "The B2B Multi-Currency Scaling Thread",
        platform: "x",
        opportunityType: "hook_framework",
        viralPotentialScore: 94,
        hookText: "Building a global SaaS from Africa is harder than Silicon Valley, but organic search is the ultimate equalizer. Here is our exact international ranking blueprint: 🧵👇",
        scriptOutline:
          "Tweet 1: Inspiring contrarian hook with proof of global organic signups.\nTweets 2-4: The 3 steps: Entity SEO, High-Converting Landing Pages, Fast Technical Indexing.\nTweet 5: The ROI breakdown compared to dollar ads.\nTweet 6: RT and follow prompt.",
        targetAudience: "African Tech Founders, Software Engineers & Product Managers",
        tags: ["#buildinpublic", "#techinlagos", "#africatech", "#growth"],
      },
    ],
  },
  "E-commerce & Retail": {
    US: [
      {
        title: "The 'TikTok Shop vs Google Shopping' Battle",
        platform: "tiktok",
        opportunityType: "trending_format",
        viralPotentialScore: 96,
        hookText: "Why DTC brands ranking in organic Google AI search are making 4x higher margins than brands burning 60% of revenue on TikTok ads...",
        scriptOutline:
          "1. 0-4s Financial Contrast Hook: Show profit margin spreadsheet comparison.\n2. 4-18s The Ad Fatigue Trap: Explain rising CPA and why owned search traffic compounds forever.\n3. 18-35s How to Rank: Schema product markup, aggregate reviews, and comparison keywords.\n4. 35-45s CTA: Grab our free DTC SEO checklist.",
        targetAudience: "E-commerce Founders, DTC Brand Owners & Shopify Merchants",
        tags: ["#shopifytips", "#dtcbrand", "#ecommercelife", "#dropshipping2026", "#marketingtips"],
      },
    ],
    NG: [
      {
        title: "The 'Instagram Vendor to Verified Brand' Transformation",
        platform: "instagram",
        opportunityType: "hook_framework",
        viralPotentialScore: 97,
        hookText: "Why customers in Nigeria stop DMing 'How much?' and buy instantly when your brand has high Google trust and structured reviews:",
        scriptOutline:
          "1. 0-4s Relatable Agitation: Show frustration of replying to 500 DMs without sales.\n2. 4-20s The Solution: Setting up an automated SEO-optimized storefront with instant search ranking.\n3. 20-35s Proof & Trust: How Google verification builds unshakeable buyer confidence.\n4. 35-45s CTA: Click link in bio to audit your brand presence.",
        targetAudience: "Instagram Merchants, Fashion & Beauty Brands in Nigeria",
        tags: ["#naijabrands", "#lagosvendors", "#nigerianentrepreneur", "#businessgrowth"],
      },
    ],
  },
};

export const ViralContentService = {
  /**
   * Retrieves viral content opportunities for a project.
   */
  async getOpportunities(
    projectId: string,
    platform?: ViralPlatform,
  ): Promise<ViralOpportunityItem[]> {
    try {
      const rows = await db
        .select()
        .from(viralContentItems)
        .where(eq(viralContentItems.projectId, projectId))
        .orderBy(desc(viralContentItems.createdAt));

      if (rows.length > 0) {
        let list = rows.map((r) => {
          let tags: string[] = [];
          try {
            tags = JSON.parse(r.tagsJson || "[]");
          } catch {
            tags = [];
          }
          return {
            id: r.id,
            projectId: r.projectId,
            title: r.title,
            platform: r.platform as ViralPlatform,
            opportunityType: r.opportunityType as OpportunityType,
            viralPotentialScore: r.viralPotentialScore,
            hookText: r.hookText,
            scriptOutline: r.scriptOutline,
            targetAudience: r.targetAudience,
            tags,
            status: r.status as any,
            createdAt: r.createdAt,
          };
        });

        if (platform) {
          list = list.filter((item) => item.platform === platform);
        }
        return list;
      }
    } catch (err) {
      console.warn("Could not fetch viral items from DB:", err);
    }

    // Generate initial viral opportunities if none found
    return this.generateOpportunities(projectId, platform);
  },

  /**
   * Generates tailored viral hooks & video scripts using AI contextualized
   * by what is currently trending in the brand's specific industry and target country.
   */
  async generateOpportunities(
    projectId: string,
    targetPlatform?: ViralPlatform,
    customTopic?: string,
  ): Promise<ViralOpportunityItem[]> {
    const brand = await BrandCompetitorService.getBrandProfile(projectId);
    const competitors = await BrandCompetitorService.listCompetitors(projectId);

    const industry = brand.industry || "SaaS / Software";
    const brandName = brand.brandName || "Our Brand";
    const usp = brand.valueProposition || "Fast, modern, ROI-focused solutions";
    const bio = brand.brandDescription || "";
    const countryName = getCountryDisplayName(brand.targetCountry);
    const countryCode = getCountryCode(brand.targetCountry);
    const competitorNames = competitors.map((c) => c.domain).slice(0, 3).join(", ");

    let generatedItems: Array<{
      title: string;
      platform: ViralPlatform;
      opportunityType: OpportunityType;
      viralPotentialScore: number;
      hookText: string;
      scriptOutline: string;
      targetAudience: string;
      tags: string[];
    }> = [];

    // Attempt AI Generation via multi-provider LLM cascade
    try {
      const { getChatAgentModel } = await import("@/server/lib/openrouter");
      const model = await getChatAgentModel();

      const systemPrompt = `You are a world-class Viral Content Strategist, Short-Form Scriptwriter, and Organic Growth Architect.
Generate 5 distinct, high-converting organic viral content hooks and video scripts tailored specifically for the user's brand, industry, target country, and unique value proposition.

CRITICAL REQUIREMENTS:
1. Every hook and script MUST directly relate to what is trending, high-converting, or controversial in the brand's industry within ${countryName} (NOT generic boilerplate).
2. Exploit current market shifts, algorithm changes, pricing frictions, or contrarian angles that buyers and creators in ${countryName} care about.
3. Cover multiple platforms: TikTok, Instagram Reels, YouTube Shorts, X (Twitter), and LinkedIn.
4. For each item provide:
   - title: Short punchy title describing the angle
   - platform: "tiktok" | "instagram" | "youtube" | "x" | "linkedin"
   - opportunityType: "trending_format" | "hook_framework" | "competitor_viral" | "angle_gap"
   - viralPotentialScore: number between 88 and 98
   - hookText: First 0-3 second opening hook line that creates intense curiosity, challenges conventional wisdom, or presents undeniable proof.
   - scriptOutline: Step-by-step structure breakdown (0-3s visual/audio hook, 3-15s problem/tension in ${countryName}, 15-35s solution showcasing ${brandName}'s USP, 35-45s high-CTR CTA).
   - targetAudience: Specific buyer persona in ${countryName} (e.g. "US SaaS Founders & Growth Marketers" or "African E-commerce Merchants").
   - tags: Array of 3-4 trending, platform-optimized hashtags.

Return ONLY a valid JSON array of objects.`;

      const userPrompt = `BRAND CONTEXT:
- Brand Name: ${brandName}
- Website: ${brand.websiteUrl || "Not set"}
- Industry: ${industry}
- Target Country / Region: ${countryName} (${countryCode})
- Unique Value Proposition (USP): ${usp}
- Brand Bio / Description: ${bio || "Not specified"}
${competitorNames ? `- Key Competitors Tracked: ${competitorNames}` : ""}
${targetPlatform ? `- Target Platform Requested: ${targetPlatform}` : ""}
${customTopic ? `- Specific Topic / Product Feature / Angle to Focus On: "${customTopic}"` : ""}

Generate 5 high-converting, viral content hooks tailored specifically to ${brandName}'s value proposition ("${usp}"), ${customTopic ? `focusing heavily on the custom angle "${customTopic}",` : ""} and current market trends in ${countryName}.`;

      const aiResponse = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      });

      const cleanJson = aiResponse.text
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        generatedItems = parsed.map((it: any) => ({
          title: String(it.title || "High-Converting Viral Hook"),
          platform: (["tiktok", "instagram", "youtube", "x", "linkedin"].includes(it.platform)
            ? it.platform
            : "tiktok") as ViralPlatform,
          opportunityType: (["trending_format", "hook_framework", "competitor_viral", "angle_gap"].includes(it.opportunityType)
            ? it.opportunityType
            : "hook_framework") as OpportunityType,
          viralPotentialScore: Number(it.viralPotentialScore) || 92,
          hookText: String(it.hookText || ""),
          scriptOutline: String(it.scriptOutline || ""),
          targetAudience: String(it.targetAudience || `Target Buyers in ${countryName}`),
          tags: Array.isArray(it.tags) ? it.tags.map(String) : ["#growth", "#viral", "#seo"],
        }));
      }
    } catch (aiErr) {
      console.warn("AI generation failed in ViralContentService, using dynamic country/industry heuristics:", aiErr);
    }

    // Dynamic brand + country tailored fallback if AI call fails
    if (generatedItems.length === 0) {
      const industryHooks = INDUSTRY_COUNTRY_VIRAL_HOOKS[industry] || INDUSTRY_COUNTRY_VIRAL_HOOKS["SaaS / Software"];
      const countryHooks = industryHooks[countryCode] || industryHooks["US"] || Object.values(industryHooks)[0];

      generatedItems = countryHooks.map((h) => ({
        ...h,
        hookText: h.hookText.replace("${brandName}", brandName).replace("${usp}", usp),
        scriptOutline: h.scriptOutline.replace(/\$\{brandName\}/g, brandName).replace(/\$\{usp\}/g, usp),
      }));
    }

    const now = new Date().toISOString();
    const results: ViralOpportunityItem[] = [];

    // Clean up previous "suggested" items for this project to eliminate duplicate cards
    try {
      if (targetPlatform) {
        await db
          .delete(viralContentItems)
          .where(
            and(
              eq(viralContentItems.projectId, projectId),
              eq(viralContentItems.platform, targetPlatform),
              eq(viralContentItems.status, "suggested"),
            ),
          );
      } else {
        await db
          .delete(viralContentItems)
          .where(
            and(
              eq(viralContentItems.projectId, projectId),
              eq(viralContentItems.status, "suggested"),
            ),
          );
      }
    } catch (cleanErr) {
      console.warn("Could not clean old suggested viral items:", cleanErr);
    }

    // Insert fresh, deduplicated viral items
    for (const it of generatedItems) {
      if (targetPlatform && it.platform !== targetPlatform) continue;

      const id = crypto.randomUUID();
      const fullItem: ViralOpportunityItem = {
        id,
        projectId,
        title: it.title,
        platform: it.platform,
        opportunityType: it.opportunityType,
        viralPotentialScore: it.viralPotentialScore,
        hookText: it.hookText,
        scriptOutline: it.scriptOutline,
        targetAudience: it.targetAudience,
        tags: it.tags,
        status: "suggested",
        createdAt: now,
      };

      try {
        await db.insert(viralContentItems).values({
          id: fullItem.id,
          projectId: fullItem.projectId,
          title: fullItem.title,
          platform: fullItem.platform,
          opportunityType: fullItem.opportunityType,
          viralPotentialScore: fullItem.viralPotentialScore,
          hookText: fullItem.hookText,
          scriptOutline: fullItem.scriptOutline,
          targetAudience: fullItem.targetAudience,
          tagsJson: JSON.stringify(fullItem.tags),
          status: fullItem.status,
          createdAt: fullItem.createdAt,
        });
      } catch (insertErr) {
        console.warn("Could not insert viral item to DB:", insertErr);
      }

      results.push(fullItem);
    }

    return results;
  },

  /**
   * Updates status of a viral opportunity (e.g. 'saved', 'created', 'dismissed').
   */
  async updateStatus(
    projectId: string,
    opportunityId: string,
    status: "suggested" | "saved" | "created" | "dismissed",
  ) {
    await db
      .update(viralContentItems)
      .set({ status })
      .where(eq(viralContentItems.id, opportunityId));

    return { ok: true };
  },
};

