CREATE TABLE "brand_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"overall_score" integer DEFAULT 85 NOT NULL,
	"brand_equity_score" integer DEFAULT 82 NOT NULL,
	"social_proof_score" integer DEFAULT 88 NOT NULL,
	"conversion_readiness_score" integer DEFAULT 80 NOT NULL,
	"ad_clarity_score" integer DEFAULT 85 NOT NULL,
	"technical_health_score" integer DEFAULT 90 NOT NULL,
	"reputation_sentiment_score" integer DEFAULT 84 NOT NULL,
	"strengths_json" text NOT NULL,
	"weaknesses_json" text NOT NULL,
	"action_plan_json" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_competitors" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"domain" text NOT NULL,
	"name" text,
	"website_url" text,
	"social_handles_json" text DEFAULT '{}' NOT NULL,
	"notes" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"project_id" text PRIMARY KEY NOT NULL,
	"brand_name" text NOT NULL,
	"website_url" text,
	"industry" text DEFAULT 'SaaS / Software' NOT NULL,
	"company_size" text DEFAULT '1-5' NOT NULL,
	"target_country" text DEFAULT 'US' NOT NULL,
	"target_language" text DEFAULT 'en' NOT NULL,
	"social_links_json" text DEFAULT '{}' NOT NULL,
	"brand_description" text,
	"value_proposition" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_tracked_ads" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"brand_competitor_id" text,
	"competitor_domain" text NOT NULL,
	"competitor_name" text,
	"platform" text NOT NULL,
	"headline" text NOT NULL,
	"body_copy" text,
	"media_url" text,
	"media_type" text DEFAULT 'image' NOT NULL,
	"landing_page_url" text,
	"cta_type" text DEFAULT 'Learn More',
	"angle_category" text DEFAULT 'problem_solution' NOT NULL,
	"estimated_active_days" integer DEFAULT 14 NOT NULL,
	"is_winning_ad" boolean DEFAULT false NOT NULL,
	"is_ai_opportunity" boolean DEFAULT false NOT NULL,
	"metadata_json" text DEFAULT '{}' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_sentiment_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"trust_score" integer DEFAULT 82 NOT NULL,
	"pre_ad_gate_status" text DEFAULT 'approved' NOT NULL,
	"sentiment_distribution_json" text NOT NULL,
	"trust_signals_json" text NOT NULL,
	"risk_alerts_json" text NOT NULL,
	"recommended_action" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viral_content_items" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"platform" text NOT NULL,
	"opportunity_type" text NOT NULL,
	"viral_potential_score" integer DEFAULT 88 NOT NULL,
	"hook_text" text NOT NULL,
	"script_outline" text NOT NULL,
	"target_audience" text NOT NULL,
	"tags_json" text DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'suggested' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"company" text,
	"website" text,
	"use_case" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"ip_address" text,
	"notes" text,
	"invited_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE INDEX "brand_audits_project_idx" ON "brand_audits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "brand_competitors_project_idx" ON "brand_competitors" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "brand_competitors_domain_idx" ON "brand_competitors" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "competitor_ads_project_idx" ON "competitor_tracked_ads" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "competitor_ads_competitor_domain_idx" ON "competitor_tracked_ads" USING btree ("competitor_domain");--> statement-breakpoint
CREATE INDEX "competitor_ads_platform_idx" ON "competitor_tracked_ads" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "trust_sentiment_project_idx" ON "trust_sentiment_audits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "viral_content_project_idx" ON "viral_content_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "viral_content_platform_idx" ON "viral_content_items" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "pg_waitlist_email_idx" ON "waitlist_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pg_waitlist_status_idx" ON "waitlist_users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pg_waitlist_created_at_idx" ON "waitlist_users" USING btree ("created_at");