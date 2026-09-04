CREATE TABLE `aeo_sentiment_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`target_brand_name` text NOT NULL,
	`ai_engine` text NOT NULL,
	`sentiment_score` integer DEFAULT 85 NOT NULL,
	`sentiment_summary` text NOT NULL,
	`entity_citation_status` text DEFAULT 'present' NOT NULL,
	`key_strengths_highlighted_json` text NOT NULL,
	`key_missing_gaps_json` text NOT NULL,
	`model_used` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `aeo_sentiment_project_idx` ON `aeo_sentiment_snapshots` (`project_id`);--> statement-breakpoint
CREATE INDEX `aeo_sentiment_engine_idx` ON `aeo_sentiment_snapshots` (`ai_engine`);--> statement-breakpoint
CREATE TABLE `brand_mentions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`source_url` text NOT NULL,
	`source_domain` text NOT NULL,
	`source_title` text NOT NULL,
	`mention_context` text NOT NULL,
	`mention_type` text DEFAULT 'unlinked' NOT NULL,
	`domain_authority` integer DEFAULT 35 NOT NULL,
	`sentiment` text DEFAULT 'positive' NOT NULL,
	`claim_status` text DEFAULT 'unclaimed' NOT NULL,
	`generated_pitch_subject` text,
	`generated_pitch_body` text,
	`target_brand_name` text NOT NULL,
	`target_brand_url` text NOT NULL,
	`discovered_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `brand_mentions_project_idx` ON `brand_mentions` (`project_id`);--> statement-breakpoint
CREATE INDEX `brand_mentions_type_idx` ON `brand_mentions` (`mention_type`);--> statement-breakpoint
CREATE INDEX `brand_mentions_claim_status_idx` ON `brand_mentions` (`claim_status`);