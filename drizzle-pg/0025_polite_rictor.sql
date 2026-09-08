ALTER TABLE "uptime_monitors" ADD COLUMN "reminder_frequency" text DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE "uptime_monitors" ADD COLUMN "reminder_email" text;--> statement-breakpoint
ALTER TABLE "uptime_monitors" ADD COLUMN "last_reminder_sent_at" text;