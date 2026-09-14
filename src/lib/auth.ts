import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { captcha } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { isDisposableEmailDomain } from "@/server/auth/disposable-email";
import * as d1Schema from "@/db/d1/schema";
import { d1Db } from "@/db/d1/client";
import { pgDb } from "@/db/pg/client";
import * as pgSchema from "@/db/pg/schema";
import { getDatabaseProvider } from "@/db/provider";
import { z } from "zod";
import { isHostedAuthMode } from "@/lib/auth-mode";
import { createApiKeyPlugin } from "@/lib/auth-api-key";
import { createBaseAuthConfig } from "@/lib/auth-config";
import {
  getHostedTurnstileSecretKey,
  hasHostedTurnstileConfig,
} from "@/lib/auth-turnstile";
import { getOrCreateDefaultHostedOrganization } from "@/server/auth/default-hosted-organization";
import {
  sendHostedPasswordResetEmail,
  sendHostedVerificationEmail,
  upsertHostedSignupContact,
} from "@/server/email/loops";

const hostedBaseUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && url.hostname === "localhost")
    );
  }, "BETTER_AUTH_URL must use https or localhost");

function createAuth() {
  // Hosted needs the real configured URL (cookies, callbacks, /api/auth routes
  // all use it). Self-hosted only builds this instance to mint/refresh Search
  // Console tokens, which never read baseURL — so a placeholder is fine there.
  const baseUrl = isHostedAuthMode(env.AUTH_MODE)
    ? getHostedBaseUrl()
    : "http://localhost";
  const bypassEmail = Reflect.get(env, "BYPASS_EMAIL_VERIFICATION") === "true";
  const baseAuthConfig = createBaseAuthConfig();

  // Turnstile captcha on signup — hosted only. Enforcement is driven by the
  // server-side secret alone so a client build/runtime site-key mismatch cannot
  // silently omit the Better Auth captcha plugin. Hosted deployments that expose
  // the client widget without the matching server secret fail configuration
  // checks instead of presenting a bypassable captcha.
  const turnstileSecretKey = getHostedTurnstileSecretKey(env);

  const database =
    getDatabaseProvider() === "postgres"
      ? drizzleAdapter(pgDb, {
          provider: "pg",
          schema: pgSchema,
        })
      : drizzleAdapter(d1Db, {
          provider: "sqlite",
          schema: d1Schema,
        });

  const auth = betterAuth({
    baseURL: baseUrl,
    secret: getHostedSecret(),
    ...baseAuthConfig,
    emailAndPassword: {
      ...baseAuthConfig.emailAndPassword,
      requireEmailVerification: !bypassEmail,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendHostedPasswordResetEmail({
          email: user.email,
          resetUrl: url,
        });
      },
    },
    emailVerification: bypassEmail
      ? undefined
      : {
          sendOnSignUp: true,
          autoSignInAfterVerification: true,
          sendVerificationEmail: async ({ user, url }) => {
            await sendHostedVerificationEmail({
              email: user.email,
              confirmationUrl: url,
            });
          },
        },
    socialProviders: getSocialProviders(),
    trustedOrigins: getTrustedOrigins(baseUrl),
    database,
    plugins: [
      ...baseAuthConfig.plugins,
      ...(isHostedAuthMode(env.AUTH_MODE) ? [createApiKeyPlugin()] : []),
      ...(turnstileSecretKey
        ? [
            captcha({
              provider: "cloudflare-turnstile",
              secretKey: turnstileSecretKey,
              endpoints: ["/sign-up/email"],
            }),
          ]
        : []),
      tanstackStartCookies(),
    ],
    databaseHooks: {
      user: {
        create: {
          // Hosted only: keep cheap mass-signups off the free plan by rejecting
          // throwaway-inbox domains before the user row is created. Self-hosted
          // has no shared credit pool to protect, so it's left untouched.
          before: async (user) => {
            const { SystemSettingsService } =
              await import("@/services/system-settings.service");
            const isRegEnabled =
              await SystemSettingsService.isPublicRegistrationEnabled();
            const isAdminEmail =
              user.email.toLowerCase().includes("admin") ||
              user.email.toLowerCase().endsWith("@skorvia.com") ||
              user.email.toLowerCase().endsWith("@skorvia.live");

            if (!isRegEnabled && !isAdminEmail) {
              throw new APIError("FORBIDDEN", {
                message: "Public registration is currently disabled by administrator.",
              });
            }
            if (
              isHostedAuthMode(env.AUTH_MODE) &&
              !isAdminEmail &&
              isDisposableEmailDomain(user.email)
            ) {
              throw new APIError("BAD_REQUEST", {
                message: "Please sign up with a non-disposable email address.",
              });
            }
            return { data: user };
          },
          after: async (user) => {
            await syncHostedSignupContact(user);
            try {
              const { db } = await import("@/db");
              const { userQuotas } = await import("@/db/schema");
              const { BillingPlansService } = await import("@/services/billing-plans.service");
              const allPlans = await BillingPlansService.getAllPlans();
              const freePlan = allPlans.find((p) => p.id === "free") || allPlans[0];
              const monthlyCreditsLimit = freePlan?.limits?.monthlyCredits ?? 50;

              await db.insert(userQuotas).values({
                userId: user.id,
                planId: "free",
                monthlyCreditsLimit,
                creditsUsed: 0,
                resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              });
            } catch (err) {
              console.warn("Could not create initial free quota for user:", err);
            }
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Inject Better Auth's createOrganization here so the helper can
            // stay reusable without importing auth.ts and creating a cycle.
            const organizationId = await getOrCreateDefaultHostedOrganization(
              session.userId,
              (body) => auth.api.createOrganization({ body }),
            );

            return {
              data: {
                ...session,
                activeOrganizationId: organizationId,
              },
            };
          },
        },
      },
    },
  });

  return auth;
}

let authInstance: ReturnType<typeof createAuth> | null = null;

async function syncHostedSignupContact(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  try {
    await upsertHostedSignupContact({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Failed to sync Loops profile after user creation:", {
      userId: user.id,
      email: user.email,
      error,
    });
  }
}

function getTrustedOrigins(baseUrl: string) {
  const trustedOrigins = [
    baseUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  if (process.env.NODE_ENV !== "production") {
    trustedOrigins.push(
      "http://open-seo.localhost:1355",
      "http://*.open-seo.localhost:1355",
      "https://open-seo.localhost:1355",
      "https://*.open-seo.localhost:1355",
    );
  }

  return trustedOrigins;
}

export function getHostedBaseUrl() {
  const baseUrl = env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";

  return hostedBaseUrlSchema.parse(baseUrl);
}

// Required in hosted mode, and in self-hosted mode when Search Console is
// enabled (it keys the OAuth-token encryption and is needed to build the auth
// instance that mints/refreshes Search Console tokens).
function getHostedSecret() {
  const secret =
    env.BETTER_AUTH_SECRET?.trim() ||
    "skorvia_local_development_secret_key_2026_at_least_32_chars_long";

  return secret;
}

function getSocialProviders() {
  const googleClientId = env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET?.trim();

  if (googleClientId && googleClientSecret) {
    return {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        mapProfileToUser: (profile: { name?: string }) => ({
          name: profile.name,
        }),
      },
    };
  }

  return {};
}

function hasHostedAuthEmailConfig() {
  const loopsVars = [
    "LOOPS_API_KEY",
    "LOOPS_TRANSACTIONAL_VERIFY_EMAIL_ID",
    "LOOPS_TRANSACTIONAL_RESET_PASSWORD_ID",
  ];

  return loopsVars.every((name) => {
    const value: unknown = Reflect.get(env, name);
    return typeof value === "string" && value.trim() !== "";
  });
}

export function hasHostedAuthConfig() {
  try {
    getHostedBaseUrl();
    getHostedSecret();
    return true;
  } catch {
    return false;
  }
}

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  authInstance = createAuth();

  return authInstance;
}
