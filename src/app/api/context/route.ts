import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  const page = parseInt(searchParams.get("page") || "1");
  const range = parseInt(searchParams.get("range") || "2");

  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  try {
    const chunks = await db
      .select({
        content: bookChunks.content,
        pageNumber: bookChunks.pageNumber,
        chapterNumber: bookChunks.chapterNumber,
      })
      .from(bookChunks)
      .where(
        and(
          eq(bookChunks.bookId, bookId),
          sql`${bookChunks.pageNumber} >= ${page}`,
          sql`${bookChunks.pageNumber} <= ${page + range - 1}`
        )
      )
      .orderBy(bookChunks.pageNumber);

    return NextResponse.json({ chunks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
