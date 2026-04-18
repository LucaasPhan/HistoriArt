import "dotenv/config";
import { db } from "./src/drizzle/db";
import { sql } from "drizzle-orm";

async function verify() {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `);
    console.log("ACTUAL COLUMNS IN DATABASE:");
    result.rows.forEach(row => console.log("- " + row.column_name));
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}
verify();
