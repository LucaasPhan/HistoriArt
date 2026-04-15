ALTER TABLE "media_annotations" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "media_annotations" ADD COLUMN "sources" jsonb DEFAULT '[]'::jsonb;