CREATE TABLE `competitor_strategy_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`target_domain` text NOT NULL,
	`location_code` integer DEFAULT 2840 NOT NULL,
	`positioning_hook_json` text NOT NULL,
	`funnel_angles_json` text NOT NULL,
	`content_moat_json` text NOT NULL,
	`vulnerabilities_json` text NOT NULL,
	`attack_playbook_json` text NOT NULL,
	`raw_metrics_summary_json` text,
	`model_used` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `competitor_strategy_project_idx` ON `competitor_strategy_reports` (`project_id`);--> statement-breakpoint
CREATE INDEX `competitor_strategy_target_idx` ON `competitor_strategy_reports` (`target_domain`);