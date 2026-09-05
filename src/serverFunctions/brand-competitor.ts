import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireAuthenticatedContext,
  requireProjectContext,
} from "./middleware";
import { BrandCompetitorService } from "@/services/brand-competitor.service";

const socialLinksSchema = z
  .object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  })
  .optional();

const competitorInputSchema = z.object({
  domain: z.string().min(1),
  name: z.string().optional(),
  websiteUrl: z.string().optional(),
  socialHandles: socialLinksSchema,
  notes: z.string().optional(),
});

const saveBrandProfileSchema = z.object({
  projectId: z.string().min(1),
  brandName: z.string().optional(),
  websiteUrl: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  targetCountry: z.string().optional(),
  targetLanguage: z.string().optional(),
  socialLinks: socialLinksSchema,
  brandDescription: z.string().optional(),
  valueProposition: z.string().optional(),
});

const completeOnboardingSchema = z.object({
  projectId: z.string().min(1),
  brand: saveBrandProfileSchema,
  competitorsList: z.array(competitorInputSchema),
});

export const getBrandProfile = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return BrandCompetitorService.getBrandProfile(data.projectId);
  });

export const saveBrandProfile = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(saveBrandProfileSchema)
  .handler(async ({ data }) => {
    return BrandCompetitorService.saveBrandProfile(data);
  });

export const listBrandCompetitors = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return BrandCompetitorService.listCompetitors(data.projectId);
  });

export const syncBrandCompetitors = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      competitors: z.array(competitorInputSchema),
    }),
  )
  .handler(async ({ data }) => {
    return BrandCompetitorService.syncCompetitors(
      data.projectId,
      data.competitors,
    );
  });

export const updateBrandCompetitor = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      competitorId: z.string().min(1),
      data: competitorInputSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    return BrandCompetitorService.updateCompetitor(
      data.projectId,
      data.competitorId,
      data.data,
    );
  });

export const deleteBrandCompetitor = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(
    z.object({
      projectId: z.string().min(1),
      competitorId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return BrandCompetitorService.deleteCompetitor(
      data.projectId,
      data.competitorId,
    );
  });

export const completeBrandOnboarding = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(completeOnboardingSchema)
  .handler(async ({ data, context }) => {
    return BrandCompetitorService.completeOnboarding({
      userId: context.userId,
      organizationId: context.organizationId,
      projectId: data.projectId,
      brand: data.brand,
      competitorsList: data.competitorsList,
    });
  });
