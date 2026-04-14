ALTER TABLE "books" ADD COLUMN "era" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "cover_gradient" jsonb;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "is_sample" boolean DEFAULT false NOT NULL;