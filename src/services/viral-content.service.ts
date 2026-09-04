import { db } from "@/db";
import { viralContentItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BrandCompetitorService } from "@/services/brand-competitor.service";

export type ViralPlatform = "tiktok" | "instagram" | "youtube" | "x" | "linkedin";
export type OpportunityType = "trending_format" | "hook_framework" | "competitor_viral" | "angle_gap";

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

export const ViralContentService = {
  /**
   * Retrieves viral content opportunities for a project.
   */
  async getOpportunities(projectId: string, platform?: ViralPlatform): Promise<ViralOpportunityItem[]> {
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
    } catch {
      // fallback to initial generation
    }

    // Generate initial viral opportunities
    return this.generateOpportunities(projectId);
  },

  /**
   * Generates a fresh batch of viral hooks & scripts tailored to the brand's industry.
   */
  async generateOpportunities(
    projectId: string,
    targetPlatform?: ViralPlatform
  ): Promise<ViralOpportunityItem[]> {
    const brand = await BrandCompetitorService.getBrandProfile(projectId);
    const industry = brand.industry || "SaaS / Software";
    const brandName = brand.brandName || "Your Brand";

    const generatedTemplates: Array<{
      title: string;
      platform: ViralPlatform;
      opportunityType: OpportunityType;
      viralPotentialScore: number;
      hookText: string;
      scriptOutline: string;
      targetAudience: string;
      tags: string[];
    }> = [
      {
        title: "The 'Nobody is talking about this' Pattern",
        platform: "tiktok",
        opportunityType: "hook_framework",
        viralPotentialScore: 94,
        hookText: `If you are running a ${industry} business in 2026, stop doing this one outdated strategy immediately...`,
        scriptOutline: "1. Visual Hook: Fast text on screen + hand gesture (0-3s)\n2. Problem Agitation: Why standard approaches fail (3-12s)\n3. The Solution Breakdown: 3 step actionable framework (12-35s)\n4. CTA: Check the bio link for full cheat sheet (35-45s)",
        targetAudience: "Founders, Growth Marketers & Agency Leads",
        tags: ["#growthtips", "#entrepreneur", "#businesshacks", "#viralhook"],
      },
      {
        title: "Competitor Comparison / Feature Expose",
        platform: "instagram",
        opportunityType: "competitor_viral",
        viralPotentialScore: 91,
        hookText: `Here is why 500+ teams switched from bloated legacy tools to ${brandName} this month...`,
        scriptOutline: "1. Hook: Show side-by-side speed/cost comparison\n2. Highlight top 2 customer pain points with traditional alternatives\n3. Demonstrate live 10-second workflow demo\n4. Offer limited-time free tier onboarding",
        targetAudience: "SMB Owners & Growth Teams",
        tags: ["#software", "#saasgrowth", "#productivitytools", "#techreview"],
      },
      {
        title: "The Reverse Psychology Hook",
        platform: "youtube",
        opportunityType: "trending_format",
        viralPotentialScore: 89,
        hookText: `Do NOT use this growth tool unless you are ready to double your inbound pipeline...`,
        scriptOutline: "1. Intense statement hook with screen recording\n2. Breakdown of the exact workflow and metrics gained\n3. Quantified ROI before and after\n4. Next step action prompt in description",
        targetAudience: "Digital Agencies & Solopreneurs",
        tags: ["#shorts", "#businesstips", "#aitools", "#marketing2026"],
      },
      {
        title: "The Counter-Intuitive Truth (Text Breakdown)",
        platform: "x",
        opportunityType: "angle_gap",
        viralPotentialScore: 92,
        hookText: `Most advice in ${industry} is completely backward. Here are 5 unconventional rules that generated \$100k+ with zero ad spend: 🧵👇`,
        scriptOutline: "Tweet 1: Strong contrarian hook with curiosity loop\nTweets 2-5: Punchy 1-line tactical insights with examples\nTweet 6: The compound effect & core tool recommendation\nTweet 7: Retweet CTA & follow prompt",
        targetAudience: "Tech Twitter & Startup Founders",
        tags: ["#buildinpublic", "#marketing", "#saas", "#growth"],
      },
      {
        title: "The Executive Case Study Breakdown",
        platform: "linkedin",
        opportunityType: "trending_format",
        viralPotentialScore: 87,
        hookText: `We audited 50 top brands in ${industry}. 82% of them are failing this basic conversion check:`,
        scriptOutline: "1. Clear statistical hook that establishes authority\n2. Key finding #1: Where money is being wasted\n3. Key finding #2: The modern AI advantage\n4. Actionable 3-point checklist\n5. Question prompt to drive comments",
        targetAudience: "VPs, Directors & C-Level Decision Makers",
        tags: ["#leadership", "#marketingstrategy", "#innovation", "#b2b"],
      },
    ];

    const results: ViralOpportunityItem[] = [];
    const now = new Date().toISOString();

    for (const t of generatedTemplates) {
      if (targetPlatform && t.platform !== targetPlatform) continue;

      const item: ViralOpportunityItem = {
        id: `viral_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        projectId,
        title: t.title,
        platform: t.platform,
        opportunityType: t.opportunityType,
        viralPotentialScore: t.viralPotentialScore,
        hookText: t.hookText,
        scriptOutline: t.scriptOutline,
        targetAudience: t.targetAudience,
        tags: t.tags,
        status: "suggested",
        createdAt: now,
      };

      try {
        await db.insert(viralContentItems).values({
          id: item.id,
          projectId: item.projectId,
          title: item.title,
          platform: item.platform,
          opportunityType: item.opportunityType,
          viralPotentialScore: item.viralPotentialScore,
          hookText: item.hookText,
          scriptOutline: item.scriptOutline,
          targetAudience: item.targetAudience,
          tagsJson: JSON.stringify(item.tags),
          status: item.status,
          createdAt: item.createdAt,
        });
      } catch (err) {
        console.warn("Failed to persist viral item to DB:", err);
      }

      results.push(item);
    }

    return results;
  },

  /**
   * Updates status of a viral opportunity (e.g. 'saved', 'created', 'dismissed').
   */
  async updateStatus(
    projectId: string,
    opportunityId: string,
    status: "suggested" | "saved" | "created" | "dismissed"
  ) {
    await db
      .update(viralContentItems)
      .set({ status })
      .where(eq(viralContentItems.id, opportunityId));

    return { ok: true };
  },
};
