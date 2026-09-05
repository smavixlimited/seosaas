import type { Autumn } from "autumn-js";
import { getRequiredEnvValue } from "@/server/lib/runtime-env";

let autumnPromise: Promise<Autumn> | undefined;

// Lazy: keeps the ~450 kB autumn-js SDK out of the eager isolate startup
// graph (self-hosted deployments never load it at all); resolves instantly
// after the first call.
function loadAutumn(): Promise<Autumn | null> {
  return (autumnPromise ??= import("autumn-js")
    .then(async ({ Autumn }) => {
      let key = "";
      try {
        key = await getRequiredEnvValue("AUTUMN_SECRET_KEY");
      } catch {
        key = "";
      }

      if (!key) {
        return null as unknown as Autumn;
      }

      return new Autumn({
        secretKey: async () => key,
        retryConfig: {
          strategy: "backoff",
          backoff: {
            initialInterval: 250,
            maxInterval: 1000,
            exponent: 1.5,
            maxElapsedTime: 2500,
          },
          retryConnectionErrors: true,
        },
      });
    })
    .catch((err) => {
      console.warn("Failed to load Autumn SDK:", err);
      return null as unknown as Autumn;
    }));
}

/** Shape-preserving lazy facade over the SDK client with robust offline fallbacks */
export const autumn = {
  check: async (...args: Parameters<Autumn["check"]>) => {
    try {
      const client = await loadAutumn();
      if (!client) {
        return {
          allowed: true,
          balance: { remaining: 10000, total: 10000, used: 0 },
        } as unknown as Awaited<ReturnType<Autumn["check"]>>;
      }
      return await client.check(...args);
    } catch (err) {
      console.warn("Autumn check error, falling back to allowed:", err);
      return {
        allowed: true,
        balance: { remaining: 10000, total: 10000, used: 0 },
      } as unknown as Awaited<ReturnType<Autumn["check"]>>;
    }
  },
  track: async (...args: Parameters<Autumn["track"]>) => {
    try {
      const client = await loadAutumn();
      if (!client)
        return { success: true } as unknown as Awaited<
          ReturnType<Autumn["track"]>
        >;
      return await client.track(...args);
    } catch (err) {
      console.warn("Autumn track error:", err);
      return { success: true } as unknown as Awaited<
        ReturnType<Autumn["track"]>
      >;
    }
  },
  customers: {
    getOrCreate: async (
      ...args: Parameters<Autumn["customers"]["getOrCreate"]>
    ) => {
      try {
        const client = await loadAutumn();
        if (!client) {
          const custId = args[0]?.customerId || "default_customer";
          return { id: custId } as unknown as Awaited<
            ReturnType<Autumn["customers"]["getOrCreate"]>
          >;
        }
        return await client.customers.getOrCreate(...args);
      } catch (err) {
        console.warn("Autumn getOrCreate error, falling back:", err);
        const custId = args[0]?.customerId || "default_customer";
        return { id: custId } as unknown as Awaited<
          ReturnType<Autumn["customers"]["getOrCreate"]>
        >;
      }
    },
  },
};

// track() has no idempotency key, so replaying a deduction Autumn already
// processed (5xx after a successful write, dropped connection) would
// double-charge. Retry only 429s, which are rejected before processing.
export const AUTUMN_TRACK_RETRY_OPTIONS: Parameters<Autumn["track"]>[1] = {
  retryCodes: ["429"],
  retries: {
    strategy: "backoff",
    backoff: {
      initialInterval: 250,
      maxInterval: 2000,
      exponent: 1.5,
      maxElapsedTime: 8000,
    },
    retryConnectionErrors: false,
  },
};
