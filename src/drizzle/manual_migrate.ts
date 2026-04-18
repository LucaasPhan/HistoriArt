import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  try {
    console.log("Manually applying migration 0009...");
    const content = fs.readFileSync(
      path.join(__dirname, "migrations", "0009_open_makkari.sql"),
      "utf-8",
    );

    // Split by statement breakpoint
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      console.log("Executing statement " + (i + 1) + "/" + statements.length + "...");
      try {
        await db.execute(drizzleSql.raw(statements[i]));
        console.log("Success.");
      } catch (e: any) {
        if (e.message?.includes("already exists") || e.message?.includes("multiple primary keys")) {
          console.log("Skipping (already exists): " + e.message);
        } else if (
          e.message?.includes('column "chapter_number" of relation "quiz_questions" already exists')
        ) {
          console.log("Skipping (column already exists): " + e.message);
        } else {
          // Check if column already exists
          if (e.message?.includes("already exists") || e.message?.includes("Duplicate column")) {
            console.log("Skipping (exists): " + e.message);
          } else {
            console.error("Failed statement " + (i + 1) + ":", e.message);
          }
        }
      }
    }
    console.log("Migration applied via manual script.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
