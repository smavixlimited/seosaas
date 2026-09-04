CREATE TABLE `cached_queries` (
	`query_hash` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`params_json` text NOT NULL,
	`response_json` text NOT NULL,
	`cost_saved_usd` integer DEFAULT 0 NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cached_queries_expires_at_idx` ON `cached_queries` (`expires_at`);