CREATE TABLE "reading_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" text NOT NULL,
	"last_page_read" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_chunks" ALTER COLUMN "book_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "media_annotations" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "media_annotations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_reading_progress_user_book" ON "reading_progress" USING btree ("user_id","book_id");--> statement-breakpoint
ALTER TABLE "media_annotations" ADD CONSTRAINT "media_annotations_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;