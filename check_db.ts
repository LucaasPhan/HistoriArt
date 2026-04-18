import { db } from "./src/drizzle/db";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name IN ('failed_login_attempts', 'lockout_until');
    `);
    console.log("Columns found:", JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error("Query failed:", err);
  }
}
check();
