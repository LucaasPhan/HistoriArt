import { NextResponse } from "next/server";
import { SAMPLE_BOOKS } from "@/lib/sample-books";

export async function GET() {
  const books = SAMPLE_BOOKS.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    description: b.description,
    coverGradient: b.coverGradient,
    totalPages: b.totalPages,
    chapters: b.chapters,
  }));

  return NextResponse.json({ books });
}
