CREATE TABLE "favorite_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" text NOT NULL,
	"chapter_id" text,
	"page_number" integer,
	"passage_text" text,
	"media_type" text NOT NULL,
	"media_url" text,
	"caption" text,
	"thumbnail_url" text,
	"autoplay" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" text NOT NULL,
	"chapter_id" text,
	"page_number" integer,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" text NOT NULL,
	"chapter_id" text,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scene_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" text NOT NULL,
	"page_number" integer NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_highlights" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "book_highlights" CASCADE;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "estimated_read_time" integer;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "first_name" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "last_name" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "reading_goal" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "personality" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "gen_z_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "favorite_books" ADD CONSTRAINT "favorite_books_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_images" ADD CONSTRAINT "scene_images_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fav_user_book" ON "favorite_books" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "idx_annotation_book" ON "media_annotations" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_annotation_book_page" ON "media_annotations" USING btree ("book_id","page_number");--> statement-breakpoint
CREATE INDEX "idx_quiz_book" ON "quiz_questions" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_result_user" ON "quiz_results" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "idx_scene_user_book_page" ON "scene_images" USING btree ("user_id","book_id","page_number");