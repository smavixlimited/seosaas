import { eq, and, gt, sql } from "drizzle-orm";
import { cachedQueries, userQuotas } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

/**
 * Creates a deterministic SHA-256 hash string for an API endpoint and query parameters.
 */
export async function generateQueryHash(
  endpoint: string,
  params: unknown,
): Promise<string> {
  const normalized = JSON.stringify({
    endpoint,
    params,
  });

  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Retrieves a cached query response if valid and unexpired.
 */
export async function getCachedQuery<T>(
  endpoint: string,
  params: unknown,
): Promise<{ fromCache: true; data: T } | null> {
  const { db } = await import("@/db");
  const hash = await generateQueryHash(endpoint, params);
  const now = new Date().toISOString();

  const [hit] = await db
    .select()
    .from(cachedQueries)
    .where(
      and(eq(cachedQueries.queryHash, hash), gt(cachedQueries.expiresAt, now)),
    )
    .limit(1);

  if (!hit) return null;

  try {
    const data = JSON.parse(hit.responseJson) as T;
    return { fromCache: true, data };
  } catch {
    return null;
  }
}

/**
 * Persists an API query response to the cache with a specified TTL (default: 14 days).
 */
export async function setCachedQuery(
  endpoint: string,
  params: unknown,
  response: unknown,
  ttlDays = 14,
  costSavedUsd = 0,
): Promise<void> {
  const { db } = await import("@/db");
  const hash = await generateQueryHash(endpoint, params);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db
    .insert(cachedQueries)
    .values({
      queryHash: hash,
      endpoint,
      paramsJson: JSON.stringify(params),
      responseJson: JSON.stringify(response),
      costSavedUsd: Math.round(costSavedUsd * 100), // stored in cents
      expiresAt,
      createdAt: now.toISOString(),
    })
    .onConflictDoUpdate({
      target: cachedQueries.queryHash,
      set: {
        responseJson: JSON.stringify(response),
        costSavedUsd: Math.round(costSavedUsd * 100),
        expiresAt,
      },
    });
}

/**
 * Enforces user monthly quota guardrails. Throws LIMIT_EXCEEDED if credits are exhausted.
 */
export async function assertUserQuotaGuardrail(
  userId: string,
  requiredCredits = 1,
): Promise<{ remaining: number; planId: string }> {
  const { db } = await import("@/db");
  const [quota] = await db
    .select()
    .from(userQuotas)
    .where(eq(userQuotas.userId, userId))
    .limit(1);

  // If no quota record exists yet, create default starter/trial record
  if (!quota) {
    const nextReset = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const [newUserQuota] = await db
      .insert(userQuotas)
      .values({
        userId,
        planId: "free",
        monthlyCreditsLimit: 50,
        creditsUsed: 0,
        crawlPagesUsed: 0,
        uptimeMonitorsCount: 0,
        resetAt: nextReset,
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const remaining =
      (newUserQuota?.monthlyCreditsLimit ?? 50) -
      (newUserQuota?.creditsUsed ?? 0);
    return { remaining, planId: "free" };
  }

  // Check if reset period has elapsed
  const now = new Date();
  const resetDate = new Date(quota.resetAt);
  if (now > resetDate) {
    const nextReset = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    await db
      .update(userQuotas)
      .set({
        creditsUsed: 0,
        crawlPagesUsed: 0,
        resetAt: nextReset,
        updatedAt: now.toISOString(),
      })
      .where(eq(userQuotas.userId, userId));
    return { remaining: quota.monthlyCreditsLimit, planId: quota.planId };
  }

  const remaining = quota.monthlyCreditsLimit - quota.creditsUsed;

  if (remaining < requiredCredits) {
    throw new AppError(
      "INSUFFICIENT_CREDITS",
      `Monthly credit quota reached (${quota.creditsUsed}/${quota.monthlyCreditsLimit} credits used). Please upgrade your Skorvia plan to continue.`,
    );
  }

  return { remaining, planId: quota.planId };
}

/**
 * Deducts / records credit consumption for a user.
 */
export async function consumeUserQuotaCredits(
  userId: string,
  credits: number,
): Promise<void> {
  const { db } = await import("@/db");
  await db
    .update(userQuotas)
    .set({
      creditsUsed: sql`${userQuotas.creditsUsed} + ${credits}`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userQuotas.userId, userId));
}
