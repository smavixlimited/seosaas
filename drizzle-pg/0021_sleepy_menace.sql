CREATE TABLE "aeo_sentiment_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"target_brand_name" text NOT NULL,
	"ai_engine" text NOT NULL,
	"sentiment_score" integer DEFAULT 85 NOT NULL,
	"sentiment_summary" text NOT NULL,
	"entity_citation_status" text DEFAULT 'present' NOT NULL,
	"key_strengths_highlighted_json" text NOT NULL,
	"key_missing_gaps_json" text NOT NULL,
	"model_used" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"target_id" text,
	"target_type" text,
	"ip_address" text,
	"metadata_json" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'SEO Guides' NOT NULL,
	"cover_image_url" text,
	"author_name" text DEFAULT 'Skorvia SEO Editorial' NOT NULL,
	"author_role" text DEFAULT 'Senior SEO Strategist',
	"meta_title" text,
	"meta_description" text,
	"focus_keywords" text,
	"canonical_url" text,
	"status" text DEFAULT 'published' NOT NULL,
	"reading_time_minutes" integer DEFAULT 5 NOT NULL,
	"published_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brand_mentions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"source_url" text NOT NULL,
	"source_domain" text NOT NULL,
	"source_title" text NOT NULL,
	"mention_context" text NOT NULL,
	"mention_type" text DEFAULT 'unlinked' NOT NULL,
	"domain_authority" integer DEFAULT 35 NOT NULL,
	"sentiment" text DEFAULT 'positive' NOT NULL,
	"claim_status" text DEFAULT 'unclaimed' NOT NULL,
	"generated_pitch_subject" text,
	"generated_pitch_body" text,
	"target_brand_name" text NOT NULL,
	"target_brand_url" text NOT NULL,
	"discovered_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cached_queries" (
	"query_hash" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"params_json" text NOT NULL,
	"response_json" text NOT NULL,
	"cost_saved_usd" integer DEFAULT 0 NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cancellation_surveys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"plan_id" text NOT NULL,
	"reason" text NOT NULL,
	"feedback" text,
	"accepted_retention_discount" boolean DEFAULT false NOT NULL,
	"discount_percent" integer DEFAULT 0,
	"discount_expires_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_strategy_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"target_domain" text NOT NULL,
	"location_code" integer DEFAULT 2840 NOT NULL,
	"positioning_hook_json" text NOT NULL,
	"funnel_angles_json" text NOT NULL,
	"content_moat_json" text NOT NULL,
	"vulnerabilities_json" text NOT NULL,
	"attack_playbook_json" text NOT NULL,
	"raw_metrics_summary_json" text,
	"model_used" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversion_ad_readiness_audits" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"target_url" text NOT NULL,
	"overall_score" integer DEFAULT 78 NOT NULL,
	"grade" text DEFAULT 'B+' NOT NULL,
	"ad_wasted_spend_risk" text DEFAULT 'moderate' NOT NULL,
	"trust_and_credibility_score" integer DEFAULT 85 NOT NULL,
	"cta_and_offer_clarity_score" integer DEFAULT 75 NOT NULL,
	"page_speed_and_mobile_score" integer DEFAULT 70 NOT NULL,
	"social_proof_and_reviews_score" integer DEFAULT 80 NOT NULL,
	"friction_and_form_length_score" integer DEFAULT 80 NOT NULL,
	"checks_passed_json" text NOT NULL,
	"critical_friction_points_json" text NOT NULL,
	"recommended_fixes_json" text NOT NULL,
	"model_used" text,
	"audited_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"coupon_code" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"plan_id" text NOT NULL,
	"original_price" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"final_price" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_reference" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gateway_settings" (
	"gateway_id" text PRIMARY KEY NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"public_key" text,
	"secret_key" text,
	"manual_instructions" text,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indexing_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" text,
	"host" text NOT NULL,
	"url_count" integer NOT NULL,
	"urls_json" text NOT NULL,
	"engine" text DEFAULT 'indexnow' NOT NULL,
	"status_code" integer DEFAULT 200 NOT NULL,
	"status_message" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"email" text NOT NULL,
	"audit_score" integer,
	"converted_to_user" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_business_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"business_name" text NOT NULL,
	"street_address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country_code" text DEFAULT 'US' NOT NULL,
	"phone_number" text,
	"website_url" text,
	"primary_category" text DEFAULT 'General Business' NOT NULL,
	"gbp_claimed" boolean DEFAULT true NOT NULL,
	"gbp_health_score" integer DEFAULT 85 NOT NULL,
	"average_rating" double precision DEFAULT 4.8 NOT NULL,
	"total_reviews" integer DEFAULT 38 NOT NULL,
	"nap_consistency_score" integer DEFAULT 92 NOT NULL,
	"citations_list_json" text NOT NULL,
	"reviews_list_json" text NOT NULL,
	"audit_highlights_json" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_rank_grid_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"keyword" text NOT NULL,
	"grid_size" text DEFAULT '3x3' NOT NULL,
	"center_lat" double precision NOT NULL,
	"center_lng" double precision NOT NULL,
	"radius_km" double precision DEFAULT 5 NOT NULL,
	"average_rank" double precision DEFAULT 2.4 NOT NULL,
	"top_three_coverage_rate" integer DEFAULT 80 NOT NULL,
	"grid_points_json" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"transaction_reference" text NOT NULL,
	"receipt_url" text,
	"user_notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"impact_badge" text DEFAULT 'High Impact' NOT NULL,
	"estimated_minutes" integer DEFAULT 15 NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"verification_type" text DEFAULT 'manual' NOT NULL,
	"verified_at" text,
	"source_type" text DEFAULT 'audit' NOT NULL,
	"source_issue_id" text,
	"target_url" text,
	"ai_prompt" text,
	"ai_fix_code_snippet" text,
	"completed_by_user_id" text,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text DEFAULT 'percentage' NOT NULL,
	"discount_value" integer NOT NULL,
	"currency" text,
	"applicable_plans_json" text,
	"customer_eligibility" text DEFAULT 'all' NOT NULL,
	"max_redemptions" integer,
	"times_redeemed" integer DEFAULT 0 NOT NULL,
	"max_redemptions_per_user" integer DEFAULT 1 NOT NULL,
	"expires_at" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "saas_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "saas_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_usd" integer NOT NULL,
	"price_ngn" integer NOT NULL,
	"billing_interval" text DEFAULT 'month' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"limits_json" text NOT NULL,
	"features_json" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_alert_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_email" text NOT NULL,
	"rank_drop_threshold" integer DEFAULT 3 NOT NULL,
	"rank_drop_alerts" boolean DEFAULT true NOT NULL,
	"critical_audit_alerts" boolean DEFAULT true NOT NULL,
	"ssl_expiration_alerts" boolean DEFAULT true NOT NULL,
	"uptime_downtime_alerts" boolean DEFAULT true NOT NULL,
	"weekly_digest_email" boolean DEFAULT true NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_json" text NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"assigned_project_ids_json" text DEFAULT '[]' NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "team_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"member_user_id" text NOT NULL,
	"member_email" text NOT NULL,
	"member_name" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"assigned_project_ids_json" text DEFAULT '[]' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uptime_monitors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" text,
	"url" text NOT NULL,
	"status" text DEFAULT 'up' NOT NULL,
	"last_checked_at" text,
	"last_status_code" integer,
	"ssl_expires_at" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_devices_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text NOT NULL,
	"browser" text DEFAULT 'Unknown Browser' NOT NULL,
	"os" text DEFAULT 'Unknown OS' NOT NULL,
	"device_type" text DEFAULT 'desktop' NOT NULL,
	"location" text DEFAULT 'Unknown Location' NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"last_active_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_quotas" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan_id" text DEFAULT 'starter' NOT NULL,
	"monthly_credits_limit" integer DEFAULT 500 NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"crawl_pages_used" integer DEFAULT 0 NOT NULL,
	"uptime_monitors_count" integer DEFAULT 0 NOT NULL,
	"reset_at" text NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret" text NOT NULL,
	"backup_codes_json" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "user_two_factor_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_two_factor_pending" (
	"user_id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes_json" text NOT NULL,
	"backup_codes_hashed_json" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_error_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event" text NOT NULL,
	"payload_json" text NOT NULL,
	"error_message" text NOT NULL,
	"error_stack" text,
	"response_status" integer DEFAULT 500,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'failed' NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"resolved_at" text
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"gateway" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'processed' NOT NULL,
	"payload_json" text NOT NULL,
	"processed_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "white_label_configs" (
	"user_id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#17199b' NOT NULL,
	"custom_domain" text,
	"report_footer_notes" text,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_saas_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."saas_coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexing_submissions" ADD CONSTRAINT "indexing_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_payments" ADD CONSTRAINT "manual_payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_monitors" ADD CONSTRAINT "uptime_monitors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quotas" ADD CONSTRAINT "user_quotas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "white_label_configs" ADD CONSTRAINT "white_label_configs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aeo_sentiment_project_idx" ON "aeo_sentiment_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "aeo_sentiment_engine_idx" ON "aeo_sentiment_snapshots" USING btree ("ai_engine");--> statement-breakpoint
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_category_idx" ON "blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_mentions_project_idx" ON "brand_mentions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "brand_mentions_type_idx" ON "brand_mentions" USING btree ("mention_type");--> statement-breakpoint
CREATE INDEX "brand_mentions_claim_status_idx" ON "brand_mentions" USING btree ("claim_status");--> statement-breakpoint
CREATE INDEX "cached_queries_expires_at_idx" ON "cached_queries" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "cancellation_surveys_user_id_idx" ON "cancellation_surveys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "competitor_strategy_project_idx" ON "competitor_strategy_reports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "competitor_strategy_target_idx" ON "competitor_strategy_reports" USING btree ("target_domain");--> statement-breakpoint
CREATE INDEX "conversion_audit_project_idx" ON "conversion_ad_readiness_audits" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "conversion_audit_target_idx" ON "conversion_ad_readiness_audits" USING btree ("target_url");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_code_idx" ON "coupon_redemptions" USING btree ("coupon_code");--> statement-breakpoint
CREATE INDEX "indexing_submissions_user_id_idx" ON "indexing_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_domain_idx" ON "leads" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "local_business_project_idx" ON "local_business_profiles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "local_grid_project_idx" ON "local_rank_grid_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "local_grid_keyword_idx" ON "local_rank_grid_snapshots" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "manual_payments_user_id_idx" ON "manual_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "manual_payments_status_idx" ON "manual_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_project_idx" ON "roadmap_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_status_idx" ON "roadmap_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "roadmap_tasks_category_idx" ON "roadmap_tasks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "saas_coupons_code_idx" ON "saas_coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "saas_coupons_is_active_idx" ON "saas_coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "seo_alert_configs_project_id_idx" ON "seo_alert_configs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "team_invitations_owner_id_idx" ON "team_invitations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "team_invitations_token_idx" ON "team_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "team_invitations_email_idx" ON "team_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "team_members_owner_id_idx" ON "team_members" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "team_members_member_user_id_idx" ON "team_members" USING btree ("member_user_id");--> statement-breakpoint
CREATE INDEX "team_members_member_email_idx" ON "team_members" USING btree ("member_email");--> statement-breakpoint
CREATE INDEX "uptime_monitors_user_id_idx" ON "uptime_monitors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_devices_sessions_user_id_idx" ON "user_devices_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_devices_sessions_ip_idx" ON "user_devices_sessions" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "user_two_factor_user_id_idx" ON "user_two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_error_logs_provider_idx" ON "webhook_error_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "webhook_error_logs_status_idx" ON "webhook_error_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_error_logs_created_at_idx" ON "webhook_error_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_events_event_id_idx" ON "webhook_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_gateway_idx" ON "webhook_events" USING btree ("gateway");