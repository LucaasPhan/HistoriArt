import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("NEON_DATABASE_URL is not set in .env");
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Applying manual db schema changes...");

  try {
    await sql`ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "era" text;`;
    console.log("Added era column");
  } catch (e: any) {
    console.error("Error adding era:", e.message);
  }

  try {
    await sql`ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "cover_gradient" jsonb;`;
    console.log("Added cover_gradient column");
  } catch (e: any) {
    console.error("Error adding cover_gradient:", e.message);
  }

  try {
    await sql`ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "is_sample" boolean DEFAULT false NOT NULL;`;
    console.log("Added is_sample column");
  } catch (e: any) {
    console.error("Error adding is_sample:", e.message);
  }

  if (process.argv.includes("--update-media-author")) {
    try {
      await sql`ALTER TABLE "media_annotations" ADD COLUMN IF NOT EXISTS "author_id" text;`;
      console.log("Added author_id column to media_annotations");
    } catch (e: any) {
      console.error(e.message);
    }
  }

  try {
    await sql`ALTER TABLE "media_annotations" ADD COLUMN IF NOT EXISTS "source" text;`;
    console.log("Added source column to media_annotations");
  } catch (e: any) {
    console.error("Error adding media_annotations.source:", e.message);
  }

  try {
    await sql`ALTER TABLE "media_annotations" ADD COLUMN IF NOT EXISTS "sources" jsonb DEFAULT '[]'::jsonb;`;
    console.log("Added sources column to media_annotations");
  } catch (e: any) {
    console.error("Error adding media_annotations.sources:", e.message);
  }

  console.log("Done.");
}

run().catch(console.error);
