CREATE TABLE `gateway_settings` (
	`gateway_id` text PRIMARY KEY NOT NULL,
	`is_enabled` integer DEFAULT false NOT NULL,
	`public_key` text,
	`secret_key` text,
	`manual_instructions` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`domain` text NOT NULL,
	`email` text NOT NULL,
	`audit_score` integer,
	`converted_to_user` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_email_idx` ON `leads` (`email`);--> statement-breakpoint
CREATE INDEX `leads_domain_idx` ON `leads` (`domain`);--> statement-breakpoint
CREATE TABLE `manual_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`plan_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'NGN' NOT NULL,
	`transaction_reference` text NOT NULL,
	`receipt_url` text,
	`user_notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`rejection_reason` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `manual_payments_user_id_idx` ON `manual_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `manual_payments_status_idx` ON `manual_payments` (`status`);--> statement-breakpoint
CREATE TABLE `saas_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_usd` integer NOT NULL,
	`price_ngn` integer NOT NULL,
	`billing_interval` text DEFAULT 'month' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`limits_json` text NOT NULL,
	`features_json` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uptime_monitors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text,
	`url` text NOT NULL,
	`status` text DEFAULT 'up' NOT NULL,
	`last_checked_at` text,
	`last_status_code` integer,
	`ssl_expires_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `uptime_monitors_user_id_idx` ON `uptime_monitors` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_quotas` (
	`user_id` text PRIMARY KEY NOT NULL,
	`plan_id` text DEFAULT 'starter' NOT NULL,
	`monthly_credits_limit` integer DEFAULT 500 NOT NULL,
	`credits_used` integer DEFAULT 0 NOT NULL,
	`crawl_pages_used` integer DEFAULT 0 NOT NULL,
	`uptime_monitors_count` integer DEFAULT 0 NOT NULL,
	`reset_at` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `white_label_configs` (
	`user_id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`logo_url` text,
	`primary_color` text DEFAULT '#17199b' NOT NULL,
	`custom_domain` text,
	`report_footer_notes` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
