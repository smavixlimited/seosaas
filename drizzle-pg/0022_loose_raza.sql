CREATE TABLE "local_business_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"location_name" text NOT NULL,
	"place_id" text,
	"business_name" text NOT NULL,
	"street_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country_code" text DEFAULT 'US' NOT NULL,
	"phone_number" text,
	"website_url" text,
	"primary_category" text DEFAULT 'General Business' NOT NULL,
	"lat" double precision DEFAULT 37.7749 NOT NULL,
	"lng" double precision DEFAULT -122.4194 NOT NULL,
	"review_link" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"gbp_health_score" integer DEFAULT 90 NOT NULL,
	"average_rating" double precision DEFAULT 4.8 NOT NULL,
	"total_reviews" integer DEFAULT 42 NOT NULL,
	"nap_consistency_score" integer DEFAULT 95 NOT NULL,
	"created_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL,
	"updated_at" text DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
);
--> statement-breakpoint
ALTER TABLE "local_rank_grid_snapshots" ADD COLUMN "location_id" text;--> statement-breakpoint
CREATE INDEX "local_locations_project_idx" ON "local_business_locations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "local_grid_location_idx" ON "local_rank_grid_snapshots" USING btree ("location_id");