import {
  type CreditFeature,
  mapDataforseoPathToCreditFeature,
} from "@/shared/billing-credit-features";
import {
  assertUsageCreditsAvailable,
  getOrCreateOrganizationCustomer,
  trackUsageCreditSpend,
} from "@/server/billing/subscription";
import type { BillingCustomerContext } from "@/server/billing/subscription";
// Type-only namespace import: erased at compile, so the section modules (and
// the SDK they pull in) still only load through loadDataforseoSections below.
import type * as sections from "@/server/lib/dataforseo/sections";
import {
  DataforseoChargedTaskError,
  type DataforseoApiCallCost,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";

export { mapDataforseoPathToCreditFeature };

/** The section-fetcher barrel (sections.ts), as a type for `meter` pickers. */
export type DataforseoSections = typeof sections;

let sectionsPromise: Promise<DataforseoSections> | undefined;

/** Single lazy boundary for the DataForSEO subtree: the section fetchers and
 * the ~3 MB dataforseo-client SDK they statically import stay out of the
 * eager isolate startup graph and load once, on the first API call. */
export function loadDataforseoSections(): Promise<DataforseoSections> {
  return (sectionsPromise ??= import("@/server/lib/dataforseo/sections"));
}

/**
 * Wraps a section fetcher with billing metering. Each entry on the client is
 * `meter(customer, (s) => s.fetchX, defaultFeature?)`, which returns a function
 * with the fetcher's own input type and resolves to its unwrapped `.data`. The
 * picker indirection (rather than the fetcher itself) keeps the section
 * modules behind loadDataforseoSections.
 *
 * `defaultFeature` is the fallback credit feature; a caller can override it per
 * call by passing `creditFeature` in the input (e.g. an MCP tool attributing
 * spend to its own feature). The extra field is ignored by the fetchers, which
 * read named fields rather than spreading the input.
 */

function meter<I, T>(
  customer: BillingCustomerContext,
  pick: (
    sections: DataforseoSections,
  ) => (input: I) => Promise<DataforseoApiResponse<T>>,
  defaultFeature?: CreditFeature,
  endpointName?: string,
): (input: I & { creditFeature?: CreditFeature }) => Promise<T> {
  return (input) =>
    meterDataforseoCall(
      customer,
      async () => pick(await loadDataforseoSections())(input),
      input.creditFeature ?? defaultFeature,
      endpointName ? { endpoint: endpointName, params: input } : undefined,
    );
}

export function createDataforseoClient(customer: BillingCustomerContext) {
  return {
    business: {
      businessListings: meter(
        customer,
        (s) => s.fetchBusinessListingsSearch,
        "local_seo",
      ),
      questionsAnswers: meter(
        customer,
        (s) => s.fetchQuestionsAnswers,
        "local_seo",
      ),
      myBusinessInfo: meter(
        customer,
        (s) => s.fetchMyBusinessInfo,
        "local_seo",
      ),
      // task_post is where DataForSEO charges; collection runs unmetered
      // through fetchBusinessDataTaskResult (see index.ts).
      reviewsTaskPost: meter(
        customer,
        (s) => s.postGoogleReviewsTask,
        "local_seo",
      ),
      updatesTaskPost: meter(
        customer,
        (s) => s.postMyBusinessUpdatesTask,
        "local_seo",
      ),
    },
    backlinks: {
      summary: meter(
        customer,
        (s) => s.fetchBacklinksSummary,
        undefined,
        "backlinks.summary",
      ),
      rows: meter(
        customer,
        (s) => s.fetchBacklinksRows,
        undefined,
        "backlinks.rows",
      ),
      referringDomains: meter(
        customer,
        (s) => s.fetchReferringDomains,
        undefined,
        "backlinks.referringDomains",
      ),
      domainPages: meter(
        customer,
        (s) => s.fetchDomainPagesSummary,
        undefined,
        "backlinks.domainPages",
      ),
      history: meter(
        customer,
        (s) => s.fetchBacklinksHistory,
        undefined,
        "backlinks.history",
      ),
    },
    keywords: {
      related: meter(
        customer,
        (s) => s.fetchRelatedKeywords,
        undefined,
        "keywords.related",
      ),
      suggestions: meter(
        customer,
        (s) => s.fetchKeywordSuggestions,
        undefined,
        "keywords.suggestions",
      ),
      ideas: meter(
        customer,
        (s) => s.fetchKeywordIdeas,
        undefined,
        "keywords.ideas",
      ),
      // Google Ads endpoints for countries Labs doesn't support.
      adsIdeas: meter(
        customer,
        (s) => s.fetchAdsKeywordIdeas,
        undefined,
        "keywords.adsIdeas",
      ),
      adsSearchVolume: meter(
        customer,
        (s) => s.fetchAdsSearchVolume,
        undefined,
        "keywords.adsSearchVolume",
      ),
    },
    domain: {
      rankOverview: meter(
        customer,
        (s) => s.fetchDomainRankOverview,
        undefined,
        "domain.rankOverview",
      ),
      rankedKeywords: meter(
        customer,
        (s) => s.fetchRankedKeywords,
        undefined,
        "domain.rankedKeywords",
      ),
      relevantPages: meter(
        customer,
        (s) => s.fetchRelevantPages,
        undefined,
        "domain.relevantPages",
      ),
    },
    serp: {
      live: meter(customer, (s) => s.fetchLiveSerp, undefined, "serp.live"),
      rankCheck: meter(customer, (s) => s.fetchRankCheckSerp, "rank_tracking"),
      // Posts up to 100 queued rank check tasks; one metered charge covers the
      // whole batch (DataForSEO bills task_post at post time, collection is
      // free).
      rankCheckTaskPost: meter(
        customer,
        (s) => s.postRankCheckTasks,
        "rank_tracking",
      ),
      local: meter(
        customer,
        (s) => s.fetchLocalSerp,
        "local_seo",
        "serp.local",
      ),
    },
    labs: {
      // Callers (e.g. the keyword-metrics MCP tool) can attribute the spend to
      // their own feature by passing `creditFeature` in the input; defaults to
      // rank_tracking when omitted.
      keywordOverview: meter(
        customer,
        (s) => s.fetchKeywordOverview,
        "rank_tracking",
        "labs.keywordOverview",
      ),
      serpCompetitors: meter(
        customer,
        (s) => s.fetchSerpCompetitors,
        undefined,
        "labs.serpCompetitors",
      ),
    },
    lighthouse: {
      live: meter(customer, (s) => s.fetchLighthouseResult),
    },
    aiSearch: {
      mentionsSearch: meter(customer, (s) => s.fetchLlmMentionsSearch),
      aggregatedMetrics: meter(customer, (s) => s.fetchLlmAggregatedMetrics),
      topPages: meter(customer, (s) => s.fetchLlmTopPages),
      crossAggregatedMetrics: meter(
        customer,
        (s) => s.fetchLlmCrossAggregatedMetrics,
      ),
      llmResponse: meter(customer, (s) => s.fetchLlmResponse),
    },
  } as const;
}

async function meterDataforseoCall<T>(
  customer: BillingCustomerContext,
  execute: () => Promise<DataforseoApiResponse<T>>,
  creditFeature?: CreditFeature,
  cacheInfo?: { endpoint: string; params: unknown },
): Promise<T> {
  let cachingService:
    | typeof import("@/services/caching-guardrails.service")
    | null = null;
  try {
    cachingService = await import("@/services/caching-guardrails.service");
  } catch {
    // Ignore in standalone unit test environments
  }

  // Check cached queries first
  if (cacheInfo && cachingService) {
    try {
      const cached = await cachingService.getCachedQuery<T>(
        cacheInfo.endpoint,
        cacheInfo.params,
      );
      if (cached) return cached.data;
    } catch {
      // Fall through on cache error
    }
  }

  // Enforce user monthly quota guardrails
  if (customer.userId && cachingService) {
    try {
      await cachingService.assertUserQuotaGuardrail(customer.userId, 1);
    } catch (quotaErr) {
      if (quotaErr instanceof AppError) throw quotaErr;
    }
  }

  const isHostedMode = await isHostedServerAuthMode();

  if (!isHostedMode) {
    const result = await execute();
    if (cacheInfo && result?.data && cachingService) {
      try {
        await cachingService.setCachedQuery(
          cacheInfo.endpoint,
          cacheInfo.params,
          result.data,
          14,
          0.05,
        );
      } catch {
        // Ignore cache storage error
      }
    }
    return result.data;
  }

  const billingCustomer = await getOrCreateOrganizationCustomer(customer);

  const { monthlyRemaining } = await assertUsageCreditsAvailable(
    billingCustomer.id,
  );

  let result: DataforseoApiResponse<T>;
  try {
    result = await execute();
  } catch (error) {
    if (error instanceof DataforseoChargedTaskError) {
      if (error.isInvalidField && error.billing.costUsd <= 0) {
        throw new AppError("VALIDATION_ERROR", error.message);
      }
      await trackDataforseoCost({
        customer,
        customerId: billingCustomer.id,
        billing: error.billing,
        monthlyRemaining,
        creditFeature,
      });
    }
    throw error;
  }

  await trackDataforseoCost({
    customer,
    customerId: billingCustomer.id,
    billing: result.billing,
    monthlyRemaining,
    creditFeature,
  });

  if (customer.userId && cachingService) {
    try {
      await cachingService.consumeUserQuotaCredits(customer.userId, 1);
    } catch {
      // Ignore
    }
  }

  if (cacheInfo && result?.data && cachingService) {
    try {
      await cachingService.setCachedQuery(
        cacheInfo.endpoint,
        cacheInfo.params,
        result.data,
        14,
        result.billing.costUsd,
      );
    } catch {
      // Ignore cache storage error
    }
  }

  return result.data;
}

async function trackDataforseoCost(args: {
  customer: BillingCustomerContext;
  customerId: string;
  billing: DataforseoApiCallCost;
  monthlyRemaining: number;
  creditFeature?: CreditFeature;
}) {
  await trackUsageCreditSpend({
    customer: args.customer,
    customerId: args.customerId,
    creditFeature:
      args.creditFeature ?? mapDataforseoPathToCreditFeature(args.billing.path),
    costUsd: args.billing.costUsd,
    monthlyRemaining: args.monthlyRemaining,
    properties: {
      provider: "dataforseo",
      paths: [args.billing.path.join("/")],
      fromCache: false,
    },
  });
}
