import { env } from "cloudflare:workers";

type DatabaseProvider = "d1" | "postgres";

export function getDatabaseProvider(): DatabaseProvider {
  let provider: unknown;
  try {
    if (typeof env !== "undefined" && env !== null) {
      provider = Reflect.get(env, "DATABASE_PROVIDER");
    }
  } catch {}

  if (!provider && typeof process !== "undefined" && process.env) {
    provider = process.env.DATABASE_PROVIDER;
  }

  if (provider === "postgres") {
    return "postgres";
  }

  if (provider === "d1" || provider === undefined || provider === "") {
    return "d1";
  }

  throw new Error(
    `Unsupported DATABASE_PROVIDER "${String(provider)}". Expected "d1" or "postgres".`,
  );
}

export function getPostgresConnectionString(): string {
  // 1. Check Cloudflare Hyperdrive binding if running on Cloudflare
  try {
    const hyperdrive = Reflect.get(env, "HYPERDRIVE") as
      | { connectionString?: string }
      | undefined;
    const hyperdriveUrl = hyperdrive?.connectionString?.trim();
    if (hyperdriveUrl) {
      return hyperdriveUrl;
    }
  } catch {}

  // 2. Check worker env bindings
  try {
    if (typeof env !== "undefined" && env !== null) {
      const workerUrl =
        (Reflect.get(env, "DATABASE_URL") as string) ||
        (Reflect.get(env, "POSTGRES_URL") as string) ||
        (Reflect.get(env, "POSTGRES_DATABASE_URL") as string);
      if (workerUrl?.trim()) {
        return workerUrl.trim();
      }
    }
  } catch {}

  // 3. Check Node.js / standalone server process.env
  if (typeof process !== "undefined" && process.env) {
    const directUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_DATABASE_URL;
    if (directUrl?.trim()) {
      return directUrl.trim();
    }
  }

  throw new Error(
    "DATABASE_PROVIDER=postgres requires a PostgreSQL connection string via DATABASE_URL, POSTGRES_URL, or HYPERDRIVE binding.",
  );
}
