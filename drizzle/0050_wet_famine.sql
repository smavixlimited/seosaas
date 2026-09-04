CREATE TABLE `local_business_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`business_name` text NOT NULL,
	`street_address` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country_code` text DEFAULT 'US' NOT NULL,
	`phone_number` text,
	`website_url` text,
	`primary_category` text DEFAULT 'General Business' NOT NULL,
	`gbp_claimed` integer DEFAULT true NOT NULL,
	`gbp_health_score` integer DEFAULT 85 NOT NULL,
	`average_rating` real DEFAULT 4.8 NOT NULL,
	`total_reviews` integer DEFAULT 38 NOT NULL,
	`nap_consistency_score` integer DEFAULT 92 NOT NULL,
	`citations_list_json` text NOT NULL,
	`reviews_list_json` text NOT NULL,
	`audit_highlights_json` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `local_business_project_idx` ON `local_business_profiles` (`project_id`);--> statement-breakpoint
CREATE TABLE `local_rank_grid_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`keyword` text NOT NULL,
	`grid_size` text DEFAULT '3x3' NOT NULL,
	`center_lat` real NOT NULL,
	`center_lng` real NOT NULL,
	`radius_km` real DEFAULT 5 NOT NULL,
	`average_rank` real DEFAULT 2.4 NOT NULL,
	`top_three_coverage_rate` integer DEFAULT 80 NOT NULL,
	`grid_points_json` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `local_grid_project_idx` ON `local_rank_grid_snapshots` (`project_id`);--> statement-breakpoint
CREATE INDEX `local_grid_keyword_idx` ON `local_rank_grid_snapshots` (`keyword`);