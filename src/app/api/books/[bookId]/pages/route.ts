import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");

  // First, check sample books
  const sampleBook = SAMPLE_BOOKS.find((b) => b.id === bookId);
  if (sampleBook) {
    const content = sampleBook.pages[page] || "";
    return NextResponse.json({
      content,
      pageNumber: page,
      totalPages: sampleBook.totalPages,
    });
  }

  // Then, check DB books (Gutenberg imports)
  try {
    const chunk = await db.query.bookChunks.findFirst({
      where: (chunks, { and, eq: eqFn }) =>
        and(eqFn(chunks.bookId, bookId), eqFn(chunks.pageNumber, page)),
    });

    if (!chunk) {
      // Check if the book exists but is still processing
      const hasBook = await db.query.books.findFirst({
        where: (books, { eq: eqFn }) => eqFn(books.id, bookId),
      });
      if (hasBook) {
        if (hasBook.totalChunks === 0) {
          // Processing state
          return NextResponse.json({
            content: null,
            isProcessing: true,
            pageNumber: page,
            totalPages: 1,
          });
        }
        return NextResponse.json({ error: "Page out of bounds" }, { status: 404 });
      }
    }

    if (chunk) {
      // Get total pages count
      const allChunks = await db
        .select({ pageNumber: bookChunks.pageNumber })
        .from(bookChunks)
        .where(eq(bookChunks.bookId, bookId))
        .orderBy(asc(bookChunks.pageNumber));

      return NextResponse.json({
        content: chunk.content,
        pageNumber: page,
        totalPages: allChunks.length,
      });
    }

    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}
