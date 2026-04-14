import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;

  try {
    const chunks = await db
      .select({ pageNumber: bookChunks.pageNumber, chunkIndex: bookChunks.chunkIndex, content: bookChunks.content })
      .from(bookChunks)
      .where(eq(bookChunks.bookId, bookId))
      .orderBy(asc(bookChunks.chunkIndex));

    const chaps: { title: string; page: number }[] = [];
    const chapterRegex = /^(Chương|Phần)\s+[IVXLCDMC0-9]+\b/i;

    for (const chunk of chunks) {
      if (chunk.content) {
        const firstLine = chunk.content.trim().split("\n")[0];
        if (firstLine && chapterRegex.test(firstLine)) {
          chaps.push({ title: firstLine.trim(), page: chunk.pageNumber || chunk.chunkIndex });
        }
      }
    }

    return NextResponse.json({ chapters: chaps });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}
