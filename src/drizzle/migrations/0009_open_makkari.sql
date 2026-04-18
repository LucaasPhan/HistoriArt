CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" text NOT NULL,
	"chapter_number" integer NOT NULL,
	"title" text NOT NULL,
	"start_page" integer NOT NULL,
	"end_page" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" text NOT NULL,
	"suppress_popup" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'vi' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "question_type" text DEFAULT 'multiple_choice' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "accepted_answers" jsonb;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "chapter_number" integer;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD COLUMN "chapter_number" integer;--> statement-breakpoint
ALTER TABLE "quiz_preferences" ADD CONSTRAINT "quiz_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chapter_book" ON "chapters" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_chapter_book_num" ON "chapters" USING btree ("book_id","chapter_number");--> statement-breakpoint
CREATE INDEX "idx_quiz_pref_user_book" ON "quiz_preferences" USING btree ("user_id","book_id");--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;