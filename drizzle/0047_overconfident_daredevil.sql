CREATE TABLE `roadmap_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`impact_badge` text DEFAULT 'High Impact' NOT NULL,
	`estimated_minutes` integer DEFAULT 15 NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`verification_type` text DEFAULT 'manual' NOT NULL,
	`verified_at` text,
	`source_type` text DEFAULT 'audit' NOT NULL,
	`source_issue_id` text,
	`target_url` text,
	`ai_prompt` text,
	`ai_fix_code_snippet` text,
	`completed_by_user_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `roadmap_tasks_project_idx` ON `roadmap_tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `roadmap_tasks_status_idx` ON `roadmap_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `roadmap_tasks_category_idx` ON `roadmap_tasks` (`category`);