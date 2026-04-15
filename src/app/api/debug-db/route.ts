import { db } from "@/drizzle/db";
import { mediaAnnotations } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const annotations = await db.select().from(mediaAnnotations).limit(1);
    return NextResponse.json({ success: true, annotations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
