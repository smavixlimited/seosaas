import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../drizzle-pg");

async function run() {
  const connectionString =
    process.env.POSTGRES_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("ERROR: No PostgreSQL connection string found in POSTGRES_DATABASE_URL or DATABASE_URL.");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 15,
  });

  try {
    const ping = await sql`SELECT 1 as connected`;
    if (!ping || ping.length === 0) {
      throw new Error("Unable to ping PostgreSQL server.");
    }
    console.log("Connected to PostgreSQL successfully. Applying migrations...");

    const db = drizzle(sql);
    await migrate(db, { migrationsFolder });
    console.log("✅ PostgreSQL migrations applied successfully!");
    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration error:", error?.message || error);
    try {
      await sql.end();
    } catch {}
    process.exit(1);
  }
}

run();
