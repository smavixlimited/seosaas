CREATE TABLE `conversion_ad_readiness_audits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`target_url` text NOT NULL,
	`overall_score` integer DEFAULT 78 NOT NULL,
	`grade` text DEFAULT 'B+' NOT NULL,
	`ad_wasted_spend_risk` text DEFAULT 'moderate' NOT NULL,
	`trust_and_credibility_score` integer DEFAULT 85 NOT NULL,
	`cta_and_offer_clarity_score` integer DEFAULT 75 NOT NULL,
	`page_speed_and_mobile_score` integer DEFAULT 70 NOT NULL,
	`social_proof_and_reviews_score` integer DEFAULT 80 NOT NULL,
	`friction_and_form_length_score` integer DEFAULT 80 NOT NULL,
	`checks_passed_json` text NOT NULL,
	`critical_friction_points_json` text NOT NULL,
	`recommended_fixes_json` text NOT NULL,
	`model_used` text,
	`audited_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `conversion_audit_project_idx` ON `conversion_ad_readiness_audits` (`project_id`);--> statement-breakpoint
CREATE INDEX `conversion_audit_target_idx` ON `conversion_ad_readiness_audits` (`target_url`);