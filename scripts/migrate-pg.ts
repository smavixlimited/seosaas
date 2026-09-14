import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../drizzle-pg");

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

// PostgreSQL error codes that indicate an idempotent/already-applied schema element:
// 42P07: duplicate_table / duplicate_relation
// 42701: duplicate_column
// 42710: duplicate_object (constraint, type, etc.)
// 42P06: duplicate_schema
// 42P16: invalid_table_definition (e.g. multiple primary keys if PK exists)
const IGNORABLE_ERROR_CODES = new Set([
  "42P07",
  "42701",
  "42710",
  "42P06",
  "42P16",
]);

async function run() {
  const connectionString =
    process.env.POSTGRES_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "ERROR: No PostgreSQL connection string found in POSTGRES_DATABASE_URL or DATABASE_URL.",
    );
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
    console.log("Connected to PostgreSQL successfully.");

    // Ensure Drizzle migrations tracking table exists
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS drizzle;`);
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // Fetch already-applied migration hashes
    const appliedRows = await sql<{ hash: string; created_at: number }[]>`
      SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id ASC;
    `;
    const appliedHashes = new Set(appliedRows.map((r) => r.hash));

    const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
    if (!fs.existsSync(journalPath)) {
      throw new Error(`Cannot find migration journal at ${journalPath}`);
    }

    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8")) as {
      entries: JournalEntry[];
    };

    let appliedCount = 0;

    for (const entry of journal.entries) {
      const sqlFilePath = path.join(migrationsFolder, `${entry.tag}.sql`);
      if (!fs.existsSync(sqlFilePath)) {
        console.warn(`Migration file missing: ${sqlFilePath}, skipping.`);
        continue;
      }

      const fileContent = fs.readFileSync(sqlFilePath, "utf-8");
      const hash = crypto
        .createHash("sha256")
        .update(fileContent)
        .digest("hex");

      if (appliedHashes.has(hash)) {
        continue;
      }

      console.log(`Applying migration: ${entry.tag}...`);
      const statements = fileContent
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
        } catch (err: any) {
          if (IGNORABLE_ERROR_CODES.has(err?.code)) {
            console.log(
              `  [Notice] Schema object already exists (${err.code}), continuing.`,
            );
          } else {
            console.error(
              `  ❌ Error executing statement in ${entry.tag}:`,
              err?.message || err,
            );
            console.error(`  Statement: ${statement.substring(0, 150)}...`);
            throw err;
          }
        }
      }

      // Record applied migration
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when});
      `;
      appliedHashes.add(hash);
      appliedCount++;
      console.log(`  ✓ Applied ${entry.tag}`);
    }

    if (appliedCount === 0) {
      console.log("PostgreSQL schema is already up to date.");
    } else {
      console.log(`✅ Successfully applied ${appliedCount} migration(s).`);
    }

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
