CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"due_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"archived_at" timestamp,
	"estimated_minutes" integer,
	"focus_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_user_status_position_idx" ON "tasks" USING btree ("user_id","status","position");--> statement-breakpoint
CREATE INDEX "tasks_user_completed_at_idx" ON "tasks" USING btree ("user_id","completed_at");