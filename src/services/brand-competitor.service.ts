import { db } from "@/db";
import {
  brandProfiles,
  brandCompetitors,
  projects,
  userOnboardingAnswers,
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
   * Upserts the brand profile.
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
          brandName: input.brandName || existing.brandName,
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
    }

    return this.listCompetitors(projectId);
  },

  /**
   * Deletes a competitor by ID.
   */
  async deleteCompetitor(projectId: string, competitorId: string) {
    await db
      .delete(brandCompetitors)
      .where(
        and(
          eq(brandCompetitors.projectId, projectId),
          eq(brandCompetitors.id, competitorId),
        ),
      );
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

    // 1. Update Project Domain & Name if provided
    if (brand.websiteUrl || brand.brandName) {
      const cleanDom = brand.websiteUrl
        ? brand.websiteUrl
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//i, "")
            .replace(/\/.*$/, "")
        : null;

      await db
        .update(projects)
        .set({
          name: brand.brandName || "My Brand",
          ...(cleanDom ? { domain: cleanDom } : {}),
        })
        .where(eq(projects.id, projectId));
    }

    // 2. Save Brand Profile
    await this.saveBrandProfile({
      ...brand,
      projectId,
    });

    // 3. Save Competitors
    if (competitorsList && competitorsList.length > 0) {
      await this.syncCompetitors(projectId, competitorsList);
    }

    // 4. Mark Onboarding as Completed in userOnboardingAnswers
    await db
      .insert(userOnboardingAnswers)
      .values({
        userId,
        organizationId,
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
          completedAt: now,
          gscNudgeDismissedAt: now,
          updatedAt: now,
        },
      });

    return { ok: true, projectId };
  },
};
