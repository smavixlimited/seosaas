import { db } from "@/db";
import {
  brandProfiles,
  brandCompetitors,
  projects,
  userOnboardingAnswers,
  projectCompetitors,
  projectContextSections,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CompanySize, Industry } from "@/config/industries";

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface CompetitorInput {
  domain: string;
  name?: string;
  websiteUrl?: string;
  socialHandles?: SocialLinks;
  notes?: string;
}

export interface BrandProfileInput {
  projectId: string;
  brandName?: string;
  websiteUrl?: string;
  industry?: Industry | string;
  companySize?: CompanySize | string;
  targetCountry?: string;
  targetLanguage?: string;
  socialLinks?: SocialLinks;
  brandDescription?: string;
  valueProposition?: string;
}

export const BrandCompetitorService = {
  /**
   * Retrieves or initializes the brand profile for a project.
   */
  async getBrandProfile(projectId: string) {
    const [existing] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.projectId, projectId))
      .limit(1);

    if (existing) {
      let socialLinks: SocialLinks = {};
      try {
        socialLinks = JSON.parse(existing.socialLinksJson || "{}");
      } catch {
        socialLinks = {};
      }

      return {
        ...existing,
        socialLinks,
      };
    }

    // If not found in brandProfiles, inspect parent project
    const [projectRow] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    return {
      projectId,
      brandName: projectRow?.name || "My Brand",
      websiteUrl: projectRow?.domain ? `https://${projectRow.domain}` : "",
      industry: "SaaS / Software",
      companySize: "1-5",
      targetCountry: "US",
      targetLanguage: "en",
      socialLinks: {},
      brandDescription: "",
      valueProposition: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Upserts the brand profile and syncs project name/domain.
   */
  async saveBrandProfile(input: BrandProfileInput) {
    const now = new Date().toISOString();
    const socialJson = JSON.stringify(input.socialLinks || {});

    const [existing] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.projectId, input.projectId))
      .limit(1);

    if (existing) {
      await db
        .update(brandProfiles)
        .set({
          brandName: input.brandName !== undefined ? input.brandName : existing.brandName,
          websiteUrl:
            input.websiteUrl !== undefined
              ? input.websiteUrl
              : existing.websiteUrl,
          industry: input.industry || existing.industry,
          companySize: input.companySize || existing.companySize,
          targetCountry: input.targetCountry || existing.targetCountry,
          targetLanguage: input.targetLanguage || existing.targetLanguage,
          socialLinksJson: socialJson,
          brandDescription:
            input.brandDescription !== undefined
              ? input.brandDescription
              : existing.brandDescription,
          valueProposition:
            input.valueProposition !== undefined
              ? input.valueProposition
              : existing.valueProposition,
          updatedAt: now,
        })
        .where(eq(brandProfiles.projectId, input.projectId));
    } else {
      await db.insert(brandProfiles).values({
        projectId: input.projectId,
        brandName: input.brandName || "My Brand",
        websiteUrl: input.websiteUrl || null,
        industry: input.industry || "SaaS / Software",
        companySize: input.companySize || "1-5",
        targetCountry: input.targetCountry || "US",
        targetLanguage: input.targetLanguage || "en",
        socialLinksJson: socialJson,
        brandDescription: input.brandDescription || null,
        valueProposition: input.valueProposition || null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Keep parent project name and domain synchronized
    try {
      const cleanDom = input.websiteUrl
        ? input.websiteUrl
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .replace(/\/.*$/, "")
        : undefined;

      const projectUpdates: Record<string, unknown> = {};
      if (input.brandName && input.brandName.trim()) {
        projectUpdates.name = input.brandName.trim();
      }
      if (cleanDom) {
        projectUpdates.domain = cleanDom;
      }

      if (Object.keys(projectUpdates).length > 0) {
        await db
          .update(projects)
          .set(projectUpdates)
          .where(eq(projects.id, input.projectId));
      }
    } catch (err) {
      console.warn("Failed to sync project name/domain in saveBrandProfile:", err);
    }

    return this.getBrandProfile(input.projectId);
  },

  /**
   * Lists all competitors for a given project/brand.
   */
  async listCompetitors(projectId: string) {
    const rows = await db
      .select()
      .from(brandCompetitors)
      .where(eq(brandCompetitors.projectId, projectId));

    return rows.map((r) => {
      let socialHandles: SocialLinks = {};
      try {
        socialHandles = JSON.parse(r.socialHandlesJson || "{}");
      } catch {
        socialHandles = {};
      }
      return {
        ...r,
        socialHandles,
      };
    });
  },

  /**
   * Adds or updates competitors for a project.
   */
  async syncCompetitors(projectId: string, list: CompetitorInput[]) {
    const now = new Date().toISOString();

    for (const comp of list) {
      const cleanDomain = comp.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "");

      if (!cleanDomain) continue;

      const socialJson = JSON.stringify(comp.socialHandles || {});
      const [existing] = await db
        .select()
        .from(brandCompetitors)
        .where(
          and(
            eq(brandCompetitors.projectId, projectId),
            eq(brandCompetitors.domain, cleanDomain),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(brandCompetitors)
          .set({
            name: comp.name || existing.name || cleanDomain,
            websiteUrl: comp.websiteUrl || `https://${cleanDomain}`,
            socialHandlesJson: socialJson,
            notes: comp.notes !== undefined ? comp.notes : existing.notes,
            updatedAt: now,
          })
          .where(eq(brandCompetitors.id, existing.id));
      } else {
        await db.insert(brandCompetitors).values({
          id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          projectId,
          domain: cleanDomain,
          name: comp.name || cleanDomain,
          websiteUrl: comp.websiteUrl || `https://${cleanDomain}`,
          socialHandlesJson: socialJson,
          notes: comp.notes || null,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Also ensure projectCompetitors table stays synchronized
      try {
        const [existingProjComp] = await db
          .select()
          .from(projectCompetitors)
          .where(
            and(
              eq(projectCompetitors.projectId, projectId),
              eq(projectCompetitors.domain, cleanDomain),
            ),
          )
          .limit(1);

        if (existingProjComp) {
          await db
            .update(projectCompetitors)
            .set({
              name: comp.name || existingProjComp.name || cleanDomain,
              notes: comp.notes !== undefined ? comp.notes : existingProjComp.notes,
              updatedAt: now,
              updatedBy: "user",
            })
            .where(eq(projectCompetitors.id, existingProjComp.id));
        } else {
          await db.insert(projectCompetitors).values({
            id: `pcomp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            projectId,
            domain: cleanDomain,
            name: comp.name || cleanDomain,
            notes: comp.notes || null,
            updatedAt: now,
            updatedBy: "user",
          });
        }
      } catch (err) {
        // Ignored if non-fatal
      }
    }

    return this.listCompetitors(projectId);
  },

  /**
   * Deletes a competitor by ID.
   */
  async deleteCompetitor(projectId: string, competitorId: string) {
    const [existing] = await db
      .select()
      .from(brandCompetitors)
      .where(
        and(
          eq(brandCompetitors.projectId, projectId),
          eq(brandCompetitors.id, competitorId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .delete(brandCompetitors)
        .where(
          and(
            eq(brandCompetitors.projectId, projectId),
            eq(brandCompetitors.id, competitorId),
          ),
        );

      try {
        await db
          .delete(projectCompetitors)
          .where(
            and(
              eq(projectCompetitors.projectId, projectId),
              eq(projectCompetitors.domain, existing.domain),
            ),
          );
      } catch {
        // Ignored
      }
    }

    return { ok: true };
  },

  /**
   * Updates a single competitor.
   */
  async updateCompetitor(
    projectId: string,
    competitorId: string,
    data: Partial<CompetitorInput>,
  ) {
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = { updatedAt: now };

    if (data.domain) {
      updatePayload.domain = data.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "");
    }
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.websiteUrl !== undefined)
      updatePayload.websiteUrl = data.websiteUrl;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.socialHandles) {
      updatePayload.socialHandlesJson = JSON.stringify(data.socialHandles);
    }

    await db
      .update(brandCompetitors)
      .set(updatePayload)
      .where(
        and(
          eq(brandCompetitors.projectId, projectId),
          eq(brandCompetitors.id, competitorId),
        ),
      );

    return { ok: true };
  },

  /**
   * Comprehensive Onboarding Finisher:
   * Saves Brand Profile, Competitors, and Marks Onboarding as Complete in DB.
   */
  async completeOnboarding({
    userId,
    organizationId,
    projectId,
    brand,
    competitorsList,
  }: {
    userId: string;
    organizationId: string;
    projectId: string;
    brand: BrandProfileInput;
    competitorsList: CompetitorInput[];
  }) {
    const now = new Date().toISOString();

    // 1. Resolve / Ensure valid Organization
    let validOrgId = organizationId;
    try {
      const { organization, member } = await import("@/db/better-auth-schema");
      const [existingMem] = await db
        .select()
        .from(member)
        .where(eq(member.userId, userId))
        .limit(1);

      if (existingMem?.organizationId) {
        validOrgId = existingMem.organizationId;
      } else if (!validOrgId || validOrgId === "default") {
        validOrgId = `org_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
        await db
          .insert(organization)
          .values({
            id: validOrgId,
            name: brand.brandName
              ? `${brand.brandName}'s Workspace`
              : "My Workspace",
            slug: `workspace-${userId.slice(0, 8)}-${Date.now().toString(36)}`,
            createdAt: new Date(),
          })
          .onConflictDoNothing();

        await db
          .insert(member)
          .values({
            id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            organizationId: validOrgId,
            userId,
            role: "owner",
            createdAt: new Date(),
          })
          .onConflictDoNothing();
      }
    } catch (err) {
      console.warn("Failed to ensure organization in completeOnboarding:", err);
    }

    // 2. Resolve / Create valid Project
    let finalProjectId = projectId;
    const cleanDom = brand.websiteUrl
      ? brand.websiteUrl
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\//i, "")
          .replace(/\/.*$/, "")
      : null;

    try {
      let existingProj = null;
      if (finalProjectId && finalProjectId !== "default") {
        const [p] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, finalProjectId))
          .limit(1);
        existingProj = p;
      }

      if (!existingProj) {
        // Look for any existing project for this org
        const [orgProj] = await db
          .select()
          .from(projects)
          .where(eq(projects.organizationId, validOrgId))
          .limit(1);
        existingProj = orgProj;
      }

      if (existingProj) {
        finalProjectId = existingProj.id;
        await db
          .update(projects)
          .set({
            name: brand.brandName || existingProj.name || "My Brand",
            ...(cleanDom ? { domain: cleanDom } : {}),
          })
          .where(eq(projects.id, finalProjectId));
      } else {
        // Create new project
        finalProjectId =
          finalProjectId && finalProjectId !== "default"
            ? finalProjectId
            : crypto.randomUUID();

        await db.insert(projects).values({
          id: finalProjectId,
          organizationId: validOrgId,
          name: brand.brandName || "My Brand",
          domain: cleanDom,
          locationCode: 2840,
          languageCode: "en",
          createdAt: now,
        });
      }
    } catch (err) {
      console.warn(
        "Failed to update/create project in completeOnboarding:",
        err,
      );
    }

    // 3. Save Brand Profile
    try {
      await this.saveBrandProfile({
        ...brand,
        projectId: finalProjectId,
      });
    } catch (err) {
      console.warn("Failed to save brand profile in completeOnboarding:", err);
    }

    // 3b. Seed Project Context Sections (Business Overview & Positioning)
    try {
      const overviewParts: string[] = [];
      if (brand.brandName) overviewParts.push(`Brand: ${brand.brandName}`);
      if (brand.industry) overviewParts.push(`Industry: ${brand.industry}`);
      if (brand.companySize) overviewParts.push(`Company Size: ${brand.companySize}`);
      if (brand.targetCountry) overviewParts.push(`Target Market: ${brand.targetCountry}`);
      if (brand.brandDescription) overviewParts.push(brand.brandDescription);

      const overviewText = overviewParts.join(" · ");
      if (overviewText) {
        await db
          .insert(projectContextSections)
          .values({
            projectId: finalProjectId,
            key: "business_overview",
            content: overviewText,
            updatedAt: now,
            updatedBy: "user",
          })
          .onConflictDoUpdate({
            target: [
              projectContextSections.projectId,
              projectContextSections.key,
            ],
            set: {
              content: overviewText,
              updatedAt: now,
              updatedBy: "user",
            },
          });
      }

      if (brand.valueProposition) {
        await db
          .insert(projectContextSections)
          .values({
            projectId: finalProjectId,
            key: "positioning",
            content: brand.valueProposition,
            updatedAt: now,
            updatedBy: "user",
          })
          .onConflictDoUpdate({
            target: [
              projectContextSections.projectId,
              projectContextSections.key,
            ],
            set: {
              content: brand.valueProposition,
              updatedAt: now,
              updatedBy: "user",
            },
          });
      }
    } catch (err) {
      console.warn(
        "Failed to seed project context sections in completeOnboarding:",
        err,
      );
    }

    // 4. Save Competitors
    if (competitorsList && competitorsList.length > 0) {
      try {
        await this.syncCompetitors(finalProjectId, competitorsList);
      } catch (err) {
        console.warn("Failed to sync competitors in completeOnboarding:", err);
      }
    }

    // 5. Mark Onboarding as Completed in userOnboardingAnswers
    try {
      await db
        .insert(userOnboardingAnswers)
        .values({
          userId,
          organizationId: validOrgId,
          interestedFeatures: JSON.stringify([
            "brand_analysis",
            "competitors",
            "ad_readiness",
          ]),
          workFor: brand.industry || "SaaS",
          clientWebsiteCount: brand.companySize || "1-5",
          completedAt: now,
          gscNudgeDismissedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userOnboardingAnswers.userId,
          set: {
            organizationId: validOrgId,
            completedAt: now,
            gscNudgeDismissedAt: now,
            updatedAt: now,
          },
        });
    } catch (err) {
      console.warn(
        "Failed to record onboarding answers in completeOnboarding:",
        err,
      );
    }

    return { ok: true, projectId: finalProjectId };
  },

  /**    * Generates a 360-degree Brand Analysis Scorecard evaluating
   * brand identity, social channels, strengths, weaknesses, and opportunities
   * powered by a Senior Business Developer with 25+ years in Sales, Growth, Copywriting, and SEO.
   */
  async getBrandAnalysis(projectId: string) {
    return this.runBrandAnalysis(projectId);
  },

  /**
   * Executes a fresh, in-depth 360-degree Brand Teardown with AI synthesis.
   */
  async runBrandAnalysis(projectId: string) {
    const profile = await this.getBrandProfile(projectId);
    const competitors = await this.listCompetitors(projectId);

    const socialLinks = profile.socialLinks || {};
    const activeSocials = Object.entries(socialLinks).filter(
      ([_, url]) => typeof url === "string" && url.trim().length > 0,
    );

    // Compute base Brand Score factors
    let score = 55;
    if (profile.brandName && profile.brandName !== "My Brand") score += 10;
    if (profile.websiteUrl) score += 10;
    if (profile.brandDescription && profile.brandDescription.length > 20) score += 10;
    if (profile.valueProposition && profile.valueProposition.length > 10) score += 10;
    score += Math.min(10, activeSocials.length * 2);
    if (competitors.length > 0) score += 5;

    let strengths = [
      {
        id: "s1",
        title: "Defined Core Value Proposition",
        description: profile.valueProposition
          ? `Clear positioning established: "${profile.valueProposition}"`
          : "Brand has registered core business positioning in the system context.",
        impact: "HIGH" as const,
        tag: "Positioning",
      },
      {
        id: "s2",
        title: `Industry Authority in ${profile.industry || "Target Market"}`,
        description: `Positioned within ${profile.industry || "your industry"} targeting ${profile.targetCountry || "global"} audiences.`,
        impact: "HIGH" as const,
        tag: "Market Fit",
      },
      ...(activeSocials.length > 0
        ? [
            {
              id: "s3",
              title: `Multi-Channel Digital Presence (${activeSocials.length} Connected)`,
              description: `Active presence verified on ${activeSocials.map(([net]) => net.toUpperCase()).join(", ")}.`,
              impact: "MEDIUM" as const,
              tag: "Social Channels",
            },
          ]
        : []),
      ...(competitors.length > 0
        ? [
            {
              id: "s4",
              title: `Active Competitor Radar (${competitors.length} Tracked)`,
              description: `Benchmarking traffic and ad strategies against key rivals: ${competitors.slice(0, 3).map((c) => c.domain).join(", ")}.`,
              impact: "MEDIUM" as const,
              tag: "Intelligence",
            },
          ]
        : []),
    ];

    let weaknesses = [
      ...(activeSocials.length < 3
        ? [
            {
              id: "w1",
              title: "Under-Leveraged Social Distribution Channels",
              description:
                "Only limited social channels are connected. Connecting YouTube, LinkedIn, Twitter/X, and TikTok establishes high entity authority for Google & AI search engines.",
              priority: "CRITICAL" as const,
              action: "Connect your official LinkedIn, Twitter/X, and YouTube channel URLs in Brand Settings.",
              suggestedPromptForSam:
                "Generate an omnichannel social media setup and distribution plan for my brand.",
            },
          ]
        : []),
      ...(!profile.valueProposition || profile.valueProposition.length < 25
        ? [
            {
              id: "w2",
              title: "Vague or Undifferentiated Value Proposition",
              description:
                "Your Unique Selling Proposition lacks specific quantifiable outcomes. Searchers and ad clicks convert 2.4x higher with distinct differentiators.",
              priority: "HIGH" as const,
              action: "Refine your USP with quantifiable benefits (e.g., 'Save 10 hrs/wk', 'Increase rank by 40%').",
              suggestedPromptForSam:
                "Help me write 3 high-converting, crisp Unique Selling Propositions (USPs) for my brand.",
            },
          ]
        : []),
      ...(competitors.length === 0
        ? [
            {
              id: "w3",
              title: "Zero Competitor Benchmarks Active",
              description:
                "No competitors are currently monitored. Adding 3-5 rivals unlocks automated keyword gap alerts and ad spy teardowns.",
              priority: "HIGH" as const,
              action: "Add 3 top competitors in the Competitors Directory to enable automated ad spying & keyword radar.",
              suggestedPromptForSam:
                "Identify top 5 direct organic and paid search competitors for my brand.",
            },
          ]
        : []),
      {
        id: "w4",
        title: "AEO Entity Profile & Knowledge Graph Optimization",
        description:
          "AI search engines (Perplexity, ChatGPT, Claude) need structured schema and third-party entity co-citations to confidently recommend your brand in answers.",
        priority: "MEDIUM" as const,
        action: "Deploy Organization schema markup and claim your brand profiles across reputable tech directories.",
        suggestedPromptForSam:
          "Generate JSON-LD Organization schema markup for my brand with sameAs social links.",
      },
    ];

    let opportunities = [
      {
        id: "o1",
        title: "High-Intent Competitor Keyword Conquesting",
        description:
          "Target search terms where competitors are ranking with thin or outdated content to capture their organic clicks.",
        potentialGain: "+35% Traffic",
      },
      {
        id: "o2",
        title: "Paid Ad Creative Angle Arbitrage",
        description:
          "Analyze competitor Meta & Google ads in the Ad Spying tool and run counter-messaging hooks targeting their common customer complaints.",
        potentialGain: "Lower CAC by 20%",
      },
      {
        id: "o3",
        title: "AI Answer Engine Optimization (AEO)",
        description:
          "Seed targeted comparison content so LLMs cite your brand as the #1 recommended solution in your niche.",
        potentialGain: "Capture AI Buyers",
      },
    ];

    // Attempt AI Generation with 25-Year Senior Business Developer Persona
    try {
      const { getChatAgentModel } = await import("@/server/lib/openrouter");
      const { generateText } = await import("ai");
      const model = await getChatAgentModel();

      const prompt = `You are a Principal Business Developer, Growth Architect, Master Copywriter, and SEO Director with over 25 years of multi-disciplinary experience scaling category leaders across every major industry.
Analyze the following brand profile and competitive landscape to generate an authoritative 360° Brand Health & Strategy Teardown.

Brand Profile:
- Brand Name: ${profile.brandName || "My Brand"}
- Official Website: ${profile.websiteUrl || "Not set"}
- Industry / Sector: ${profile.industry || "SaaS / Technology"}
- Target Market / Country: ${profile.targetCountry || "US"} (${profile.targetLanguage || "English"})
- Unique Value Proposition (USP): ${profile.valueProposition || "Not set"}
- Brand Description / Bio: ${profile.brandDescription || "Not set"}
- Active Social Channels: ${activeSocials.map(([net]) => net).join(", ") || "None connected"}
- Monitored Competitors: ${competitors.map((c) => c.domain).join(", ") || "None yet"}

Provide a valid JSON response matching this exact schema:
{
  "score": number (0-100, reflecting commercial positioning, copy sharpness, and SEO/AEO authority),
  "strengths": [
    {
      "id": string,
      "title": string,
      "description": string (specific 1-2 sentence evidence for this brand),
      "impact": "HIGH" | "MEDIUM",
      "tag": "Positioning" | "Market Fit" | "Social Channels" | "Intelligence" | "Conversion"
    }
  ],
  "weaknesses": [
    {
      "id": string,
      "title": string,
      "description": string (commercial or SEO leak explanation),
      "priority": "CRITICAL" | "HIGH" | "MEDIUM",
      "action": string (prescriptive fix),
      "suggestedPromptForSam": string (actionable prompt to implement the fix)
    }
  ],
  "opportunities": [
    {
      "id": string,
      "title": string,
      "description": string (growth, sales, copy, or SEO unlock),
      "potentialGain": string (e.g. "+40% Pipeline", "Lower CAC by 25%")
    }
  ]
}
Return ONLY raw JSON, no markdown backticks, no other text.`;

      const aiResponse = await generateText({
        model,
        prompt,
        temperature: 0.3,
      });

      let cleanJson = aiResponse.text.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7).replace(/```$/, "").trim();
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.slice(3).replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleanJson);
      if (typeof parsed.score === "number") {
        score = Math.min(100, Math.max(20, parsed.score));
      }
      if (Array.isArray(parsed.strengths) && parsed.strengths.length > 0) {
        strengths = parsed.strengths;
      }
      if (Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0) {
        weaknesses = parsed.weaknesses;
      }
      if (Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0) {
        opportunities = parsed.opportunities;
      }
    } catch (aiErr) {
      console.warn("AI generation fallback used for brand analysis:", aiErr);
    }

    return {
      profile,
      competitors,
      score: Math.min(100, Math.max(20, score)),
      strengths,
      weaknesses,
      opportunities,
      activeSocialCount: activeSocials.length,
      trackedCompetitorCount: competitors.length,
    };
  },
};;
