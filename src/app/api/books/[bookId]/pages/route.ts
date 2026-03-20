import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_BOOKS } from "@/lib/sample-books";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");

  const book = SAMPLE_BOOKS.find((b) => b.id === bookId);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const content = book.pages[page] || "";
  const chapter = book.chapters.find(
    (ch) => page >= ch.startPage && page <= ch.endPage
  );

  return NextResponse.json({
    content,
    pageNumber: page,
    totalPages: book.totalPages,
    chapter: chapter
      ? { number: chapter.number, title: chapter.title }
      : null,
  });
}
