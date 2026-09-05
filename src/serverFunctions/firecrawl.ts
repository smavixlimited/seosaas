import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  FirecrawlService,
  type FirecrawlScrapeOptions,
} from "@/services/firecrawl.service";
import { CreditGuardService } from "@/services/credit-guard.service";

const scrapeWebpageSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url(),
  formats: z
    .array(z.enum(["markdown", "html", "rawHtml", "screenshot"]))
    .optional(),
  onlyMainContent: z.boolean().optional(),
});

const searchAndScrapeSchema = z.object({
  projectId: z.string().min(1),
  query: z.string().min(1).max(200),
});

const mapDomainSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().min(1),
});

const competitorBlueprintSchema = z.object({
  projectId: z.string().min(1),
  targetKeyword: z.string().min(1),
  competitorUrls: z.array(z.string().url()).min(1).max(5),
  userUrl: z.string().url().optional(),
});

const generateLlmsTxtSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().min(1),
});

const testConnectionSchema = z.object({
  apiKey: z.string().optional(),
  apiUrl: z.string().optional(),
});

export const scrapeWebpageServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(scrapeWebpageSchema)
  .handler(async ({ data, context }) => {
    // Deduct 1 credit atomically
    await CreditGuardService.deductCreditsAtomic({
      userId: context.userId,
      amount: 1,
    });

    return FirecrawlService.scrapeUrl(data.url, {
      formats: data.formats as FirecrawlScrapeOptions["formats"],
      onlyMainContent: data.onlyMainContent,
    });
  });

export const searchAndScrapeServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(searchAndScrapeSchema)
  .handler(async ({ data, context }) => {
    await CreditGuardService.deductCreditsAtomic({
      userId: context.userId,
      amount: 2,
    });

    return FirecrawlService.searchAndScrape(data.query);
  });

export const mapDomainServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(mapDomainSchema)
  .handler(async ({ data, context }) => {
    await CreditGuardService.deductCreditsAtomic({
      userId: context.userId,
      amount: 1,
    });

    return FirecrawlService.mapDomain(data.domain);
  });

export const generateCompetitorBlueprintServerFn = createServerFn({
  method: "POST",
})
  .middleware(requireProjectContext)
  .validator(competitorBlueprintSchema)
  .handler(async ({ data, context }) => {
    await CreditGuardService.deductCreditsAtomic({
      userId: context.userId,
      amount: 3,
    });

    return FirecrawlService.generateCompetitorBlueprint({
      targetKeyword: data.targetKeyword,
      competitorUrls: data.competitorUrls,
      userUrl: data.userUrl,
    });
  });

export const generateLlmsTxtServerFn = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(generateLlmsTxtSchema)
  .handler(async ({ data, context }) => {
    await CreditGuardService.deductCreditsAtomic({
      userId: context.userId,
      amount: 2,
    });

    return FirecrawlService.generateLlmsTxt(data.domain);
  });

export const testFirecrawlConnectionServerFn = createServerFn({
  method: "POST",
})
  .validator(testConnectionSchema)
  .handler(async ({ data }) => {
    return FirecrawlService.testConnection(data.apiKey, data.apiUrl);
  });
