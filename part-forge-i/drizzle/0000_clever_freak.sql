CREATE TABLE "build_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"build_id" integer NOT NULL,
	"part_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"slot" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"public" boolean DEFAULT true NOT NULL,
	"total_price_usd" numeric(12, 2) DEFAULT '0' NOT NULL,
	"est_wattage" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(120) NOT NULL,
	"manufacturer" varchar(120) NOT NULL,
	"model" varchar(200) NOT NULL,
	"category" varchar(50) NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"wattage" integer,
	"socket" varchar(50),
	"chipset" varchar(50),
	"form_factor" varchar(50),
	"memory_type" varchar(50),
	"capacity_gb" integer,
	"interface" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parts_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
