CREATE TABLE `user_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`category` text DEFAULT 'system' NOT NULL,
	`priority` text DEFAULT 'info' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`action_url` text,
	`details` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_notifications_user_idx` ON `user_notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_notifications_is_read_idx` ON `user_notifications` (`is_read`);--> statement-breakpoint
ALTER TABLE `conversion_ad_readiness_audits` ADD `tracking_pixel_score` integer DEFAULT 85 NOT NULL;--> statement-breakpoint
ALTER TABLE `conversion_ad_readiness_audits` ADD `detected_pixels_json` text;