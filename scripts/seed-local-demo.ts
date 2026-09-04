/**
 * Seed local D1 database with demo data:
 * - Plans (Starter, Pro, Agency, Enterprise)
 * - System API Defaults
 * - Demo Project (Stripe Analytics)
 *
 * Usage:
 *   pnpm tsx scripts/seed-local-demo.ts
 */

import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import * as saasSchema from "../src/db/saas.schema";
import * as appSchema from "../src/db/app.schema";
import { organization, user } from "../src/db/better-auth-schema";

async function seed() {
  console.log("🌱 Connecting to local Cloudflare D1 database...");
  const proxy = await getPlatformProxy<{ DB: D1Database }>();
  const db = drizzle(proxy.env.DB, {
    schema: { ...saasSchema, ...appSchema, organization, user },
  });

  console.log("📦 Seeding SaaS Plans...");
  const plans = [
    {
      id: "starter",
      name: "Starter",
      priceUsd: 29,
      priceNgn: 45000,
      billingInterval: "month",
      isActive: true,
      limitsJson: JSON.stringify({
        maxDomains: 3,
        monthlyCredits: 250,
        auditPages: 5000,
        uptimeMonitors: 0,
      }),
      featuresJson: JSON.stringify({
        keyword_research: true,
        rank_tracker: true,
        backlink_analysis: false,
        site_audit: true,
        gbp_integration: false,
        map_rank_tracker: false,
        review_management: false,
        listing_management: false,
        ai_visibility: false,
        ai_content_studio: false,
        ai_seo_fixer: false,
        indexnow_submitter: false,
        uptime_ssl_monitoring: false,
        my_reports_builder: false,
        white_label_pdf: false,
        team_management: false,
        mcp_api_access: false,
        priority_support: false,
        whiteLabelPdf: false,
        mcpAccess: false,
        indexnowSubmit: false,
        aeoAudit: false,
        customBranding: false,
        prioritySupport: false,
      }),
    },
    {
      id: "pro",
      name: "Pro",
      priceUsd: 79,
      priceNgn: 120000,
      billingInterval: "month",
      isActive: true,
      limitsJson: JSON.stringify({
        maxDomains: 10,
        monthlyCredits: 1000,
        auditPages: 50000,
        uptimeMonitors: 5,
      }),
      featuresJson: JSON.stringify({
        keyword_research: true,
        rank_tracker: true,
        backlink_analysis: true,
        site_audit: true,
        gbp_integration: true,
        map_rank_tracker: true,
        review_management: false,
        listing_management: false,
        ai_visibility: true,
        ai_content_studio: true,
        ai_seo_fixer: false,
        indexnow_submitter: true,
        uptime_ssl_monitoring: true,
        my_reports_builder: false,
        white_label_pdf: false,
        team_management: false,
        mcp_api_access: true,
        priority_support: false,
        whiteLabelPdf: false,
        mcpAccess: true,
        indexnowSubmit: true,
        aeoAudit: true,
        customBranding: false,
        prioritySupport: false,
      }),
    },
    {
      id: "agency",
      name: "Agency",
      priceUsd: 199,
      priceNgn: 300000,
      billingInterval: "month",
      isActive: true,
      limitsJson: JSON.stringify({
        maxDomains: 50,
        monthlyCredits: 5000,
        auditPages: 250000,
        uptimeMonitors: 25,
      }),
      featuresJson: JSON.stringify({
        keyword_research: true,
        rank_tracker: true,
        backlink_analysis: true,
        site_audit: true,
        gbp_integration: true,
        map_rank_tracker: true,
        review_management: true,
        listing_management: true,
        ai_visibility: true,
        ai_content_studio: true,
        ai_seo_fixer: true,
        indexnow_submitter: true,
        uptime_ssl_monitoring: true,
        my_reports_builder: true,
        white_label_pdf: true,
        team_management: true,
        mcp_api_access: true,
        priority_support: true,
        whiteLabelPdf: true,
        mcpAccess: true,
        indexnowSubmit: true,
        aeoAudit: true,
        customBranding: true,
        prioritySupport: true,
      }),
    },
  ];

  for (const plan of plans) {
    try {
      await db.insert(saasSchema.saasPlans).values(plan).onConflictDoUpdate({
        target: saasSchema.saasPlans.id,
        set: plan,
      });
    } catch {
      // ignore conflict
    }
  }

  console.log("✅ SaaS Plans seeded successfully!");

  const { eq } = await import("drizzle-orm");
  const orgs = await db.select().from(organization);
  for (const org of orgs) {
    const existingProjects = await db
      .select()
      .from(appSchema.projects)
      .where(eq(appSchema.projects.organizationId, org.id));

    if (existingProjects.length === 0) {
      await db.insert(appSchema.projects).values({
        id: `demo-${org.id.slice(0, 8)}`,
        organizationId: org.id,
        name: "Stripe Demo Workspace",
        domain: "stripe.com",
        locationCode: 2840,
        languageCode: "en",
      });
      console.log(`📦 Seeded demo project for organization: ${org.name}`);
    }
  }

  await proxy.dispose();
  console.log("🎉 Local database seeded and ready for testing!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
