ALTER TABLE `uptime_monitors` ADD `reminder_frequency` text DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE `uptime_monitors` ADD `reminder_email` text;--> statement-breakpoint
ALTER TABLE `uptime_monitors` ADD `last_reminder_sent_at` text;