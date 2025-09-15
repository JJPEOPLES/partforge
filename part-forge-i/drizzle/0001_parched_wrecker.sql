CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"retailer_id" integer NOT NULL,
	"retailer_sku" varchar(120),
	"url" text NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retailers" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(120) NOT NULL,
	CONSTRAINT "retailers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "upc" varchar(64);--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "mpn" varchar(128);--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "image_url" text;