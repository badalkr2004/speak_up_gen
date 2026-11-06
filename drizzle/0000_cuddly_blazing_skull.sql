CREATE TYPE "public"."application_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('pending', 'active', 'rejected', 'suspended', 'alumni');--> statement-breakpoint
CREATE TYPE "public"."org_unit_level" AS ENUM('national', 'state', 'city', 'unit');--> statement-breakpoint
CREATE TYPE "public"."org_unit_status" AS ENUM('active', 'pending', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role_key" AS ENUM('national_admin', 'state_lead', 'city_lead', 'unit_lead', 'member', 'volunteer');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_org_unit_id" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"motivation" text,
	"photo_url" text,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geo_city" (
	"id" text PRIMARY KEY NOT NULL,
	"state_code" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geo_state" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "id_card" (
	"id" text PRIMARY KEY NOT NULL,
	"membership_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"asset_url" text,
	"qr_payload" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"org_unit_id" text NOT NULL,
	"role_key" "role_key" DEFAULT 'member' NOT NULL,
	"status" "membership_status" DEFAULT 'pending' NOT NULL,
	"member_code" text,
	"photo_url" text,
	"approved_by_user_id" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_member_code_unique" UNIQUE("member_code")
);
--> statement-breakpoint
CREATE TABLE "org_unit" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"level" "org_unit_level" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "org_unit_status" DEFAULT 'active' NOT NULL,
	"state_code" text,
	"city_id" text,
	"unit_kind_id" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_kind" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unit_kind_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_target_org_unit_id_org_unit_id_fk" FOREIGN KEY ("target_org_unit_id") REFERENCES "public"."org_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_city" ADD CONSTRAINT "geo_city_state_code_geo_state_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."geo_state"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "id_card" ADD CONSTRAINT "id_card_membership_id_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_org_unit_id_org_unit_id_fk" FOREIGN KEY ("org_unit_id") REFERENCES "public"."org_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_unit" ADD CONSTRAINT "org_unit_state_code_geo_state_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."geo_state"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_unit" ADD CONSTRAINT "org_unit_city_id_geo_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geo_city"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_unit" ADD CONSTRAINT "org_unit_unit_kind_id_unit_kind_id_fk" FOREIGN KEY ("unit_kind_id") REFERENCES "public"."unit_kind"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_unit" ADD CONSTRAINT "org_unit_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "geo_city_state_slug_uidx" ON "geo_city" USING btree ("state_code","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_user_unit_uidx" ON "membership" USING btree ("user_id","org_unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_unit_slug_uidx" ON "org_unit" USING btree ("slug");