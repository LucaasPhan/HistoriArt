import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

function createAuth() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a minimal auth instance for build time
    return null;
  }
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
  });
}

const _auth = createAuth();

export const auth = _auth!;
