CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`admin_email` text NOT NULL,
	`action` text NOT NULL,
	`target_id` text,
	`target_type` text,
	`ip_address` text,
	`metadata_json` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_admin_id_idx` ON `audit_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`category` text DEFAULT 'SEO Guides' NOT NULL,
	`cover_image_url` text,
	`author_name` text DEFAULT 'Skorvia SEO Editorial' NOT NULL,
	`author_role` text DEFAULT 'Senior SEO Strategist',
	`meta_title` text,
	`meta_description` text,
	`focus_keywords` text,
	`canonical_url` text,
	`status` text DEFAULT 'published' NOT NULL,
	`reading_time_minutes` integer DEFAULT 5 NOT NULL,
	`published_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_category_idx` ON `blog_posts` (`category`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_idx` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE TABLE `cancellation_surveys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`plan_id` text NOT NULL,
	`reason` text NOT NULL,
	`feedback` text,
	`accepted_retention_discount` integer DEFAULT false NOT NULL,
	`discount_percent` integer DEFAULT 0,
	`discount_expires_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cancellation_surveys_user_id_idx` ON `cancellation_surveys` (`user_id`);--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` text PRIMARY KEY NOT NULL,
	`coupon_id` text NOT NULL,
	`coupon_code` text NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`plan_id` text NOT NULL,
	`original_price` integer NOT NULL,
	`discount_amount` integer NOT NULL,
	`final_price` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`payment_reference` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`coupon_id`) REFERENCES `saas_coupons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `coupon_redemptions_coupon_id_idx` ON `coupon_redemptions` (`coupon_id`);--> statement-breakpoint
CREATE INDEX `coupon_redemptions_user_id_idx` ON `coupon_redemptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `coupon_redemptions_coupon_code_idx` ON `coupon_redemptions` (`coupon_code`);--> statement-breakpoint
CREATE TABLE `indexing_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text,
	`host` text NOT NULL,
	`url_count` integer NOT NULL,
	`urls_json` text NOT NULL,
	`engine` text DEFAULT 'indexnow' NOT NULL,
	`status_code` integer DEFAULT 200 NOT NULL,
	`status_message` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `indexing_submissions_user_id_idx` ON `indexing_submissions` (`user_id`);--> statement-breakpoint
CREATE TABLE `saas_coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`discount_type` text DEFAULT 'percentage' NOT NULL,
	`discount_value` integer NOT NULL,
	`currency` text,
	`applicable_plans_json` text,
	`customer_eligibility` text DEFAULT 'all' NOT NULL,
	`max_redemptions` integer,
	`times_redeemed` integer DEFAULT 0 NOT NULL,
	`max_redemptions_per_user` integer DEFAULT 1 NOT NULL,
	`expires_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saas_coupons_code_unique` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE INDEX `saas_coupons_code_idx` ON `saas_coupons` (`code`);--> statement-breakpoint
CREATE INDEX `saas_coupons_is_active_idx` ON `saas_coupons` (`is_active`);--> statement-breakpoint
CREATE TABLE `seo_alert_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_email` text NOT NULL,
	`rank_drop_threshold` integer DEFAULT 3 NOT NULL,
	`rank_drop_alerts` integer DEFAULT true NOT NULL,
	`critical_audit_alerts` integer DEFAULT true NOT NULL,
	`ssl_expiration_alerts` integer DEFAULT true NOT NULL,
	`uptime_downtime_alerts` integer DEFAULT true NOT NULL,
	`weekly_digest_email` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `seo_alert_configs_project_id_idx` ON `seo_alert_configs` (`project_id`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `team_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`assigned_project_ids_json` text DEFAULT '[]' NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_token_unique` ON `team_invitations` (`token`);--> statement-breakpoint
CREATE INDEX `team_invitations_owner_id_idx` ON `team_invitations` (`owner_id`);--> statement-breakpoint
CREATE INDEX `team_invitations_token_idx` ON `team_invitations` (`token`);--> statement-breakpoint
CREATE INDEX `team_invitations_email_idx` ON `team_invitations` (`email`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`member_user_id` text NOT NULL,
	`member_email` text NOT NULL,
	`member_name` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`assigned_project_ids_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `team_members_owner_id_idx` ON `team_members` (`owner_id`);--> statement-breakpoint
CREATE INDEX `team_members_member_user_id_idx` ON `team_members` (`member_user_id`);--> statement-breakpoint
CREATE INDEX `team_members_member_email_idx` ON `team_members` (`member_email`);--> statement-breakpoint
CREATE TABLE `user_devices_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`browser` text DEFAULT 'Unknown Browser' NOT NULL,
	`os` text DEFAULT 'Unknown OS' NOT NULL,
	`device_type` text DEFAULT 'desktop' NOT NULL,
	`location` text DEFAULT 'Unknown Location' NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`is_revoked` integer DEFAULT false NOT NULL,
	`last_active_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_devices_sessions_user_id_idx` ON `user_devices_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_devices_sessions_ip_idx` ON `user_devices_sessions` (`ip_address`);--> statement-breakpoint
CREATE TABLE `user_two_factor` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`secret` text NOT NULL,
	`backup_codes_json` text NOT NULL,
	`is_enabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_two_factor_user_id_unique` ON `user_two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_two_factor_user_id_idx` ON `user_two_factor` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_two_factor_pending` (
	`user_id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`backup_codes_json` text NOT NULL,
	`backup_codes_hashed_json` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_error_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`event` text NOT NULL,
	`payload_json` text NOT NULL,
	`error_message` text NOT NULL,
	`error_stack` text,
	`response_status` integer DEFAULT 500,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'failed' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `webhook_error_logs_provider_idx` ON `webhook_error_logs` (`provider`);--> statement-breakpoint
CREATE INDEX `webhook_error_logs_status_idx` ON `webhook_error_logs` (`status`);--> statement-breakpoint
CREATE INDEX `webhook_error_logs_created_at_idx` ON `webhook_error_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`gateway` text NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`status` text DEFAULT 'processed' NOT NULL,
	`payload_json` text NOT NULL,
	`processed_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_events_event_id_unique` ON `webhook_events` (`event_id`);--> statement-breakpoint
CREATE INDEX `webhook_events_event_id_idx` ON `webhook_events` (`event_id`);--> statement-breakpoint
CREATE INDEX `webhook_events_gateway_idx` ON `webhook_events` (`gateway`);