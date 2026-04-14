import { db } from "@/drizzle/db";
import { bookChunks, books } from "@/drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");

  // Check DB for book pages (both migrated sample books and uploaded books)
  try {
    const chunk = await db.query.bookChunks.findFirst({
      where: (chunks, { and, eq: eqFn }) =>
        and(eqFn(chunks.bookId, bookId), eqFn(chunks.pageNumber, page)),
    });

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
      // Book exists but page not found — might be out of bounds
    }
  } catch (error) {
    console.error("Error fetching book page:", error);
  }

  return NextResponse.json({ error: "Book page not found" }, { status: 404 });
}
