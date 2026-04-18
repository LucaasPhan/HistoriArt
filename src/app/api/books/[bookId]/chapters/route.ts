import { db } from "@/drizzle/db";
import { bookChunks, chapters } from "@/drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;

  try {
    // 1. Try to fetch from DB first
    const existingChapters = await db.query.chapters.findMany({
      where: eq(chapters.bookId, bookId),
      orderBy: asc(chapters.chapterNumber),
    });

    if (existingChapters && existingChapters.length > 0) {
      return NextResponse.json({ chapters: existingChapters });
    }

    // 2. If nothing exists in DB, fallback to regex and parse chunks
    const chunks = await db
      .select({
        pageNumber: bookChunks.pageNumber,
        chunkIndex: bookChunks.chunkIndex,
        content: bookChunks.content,
      })
      .from(bookChunks)
      .where(eq(bookChunks.bookId, bookId))
      .orderBy(asc(bookChunks.chunkIndex));

    if (chunks.length === 0) {
      return NextResponse.json({ chapters: [] });
    }

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

    // 3. Map to DB structure and compute endPage
    const mappedChaps = chaps.map((chap, i) => {
      const isLast = i === chaps.length - 1;
      const endPage = isLast
        ? chunks[chunks.length - 1].pageNumber || chunks[chunks.length - 1].chunkIndex
        : chaps[i + 1].page - 1;

      return {
        bookId,
        chapterNumber: i + 1,
        title: chap.title,
        startPage: chap.page,
        endPage: endPage,
      };
    });

    // 4. Save to DB for future use
    if (mappedChaps.length > 0) {
      await db.insert(chapters).values(mappedChaps);
    }

    return NextResponse.json({ chapters: mappedChaps });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}
