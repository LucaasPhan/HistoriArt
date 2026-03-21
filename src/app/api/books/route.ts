import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { db } from "@/drizzle/db";
import { books } from "@/drizzle/schema";
import { bookChunks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { fetchAndPaginateGutenbergBook } from "@/lib/gutenberg";

export async function GET() {
  try {
    // Fetch books from the database
    const dbBooks = await db.query.books.findMany({
      orderBy: (books, { desc }) => [desc(books.createdAt)],
    });

    // Combine DB books with sample books
    const allBooks = [
      ...dbBooks.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description || "",
        coverUrl: b.coverUrl || null,
        coverGradient: ["#667eea", "#764ba2"] as [string, string],
        totalPages: b.totalPages,
        fileName: b.fileName,
      })),
      ...SAMPLE_BOOKS.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description,
        coverUrl: null as string | null,
        coverGradient: b.coverGradient,
        totalPages: b.totalPages,
        fileName: null,
      })),
    ];

    return NextResponse.json({ books: allBooks });
  } catch {
    // Fallback to sample books if DB fails
    const sampleBooks = SAMPLE_BOOKS.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description,
      coverUrl: null,
      coverGradient: b.coverGradient,
      totalPages: b.totalPages,
    }));

    return NextResponse.json({ books: sampleBooks });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { title, author, coverUrl, description, totalPages, gutenbergId, pages } = body;

    // Check if this Gutenberg book was already added
    if (gutenbergId) {
      const existing = await db.query.books.findFirst({
        where: eq(books.fileName, `gutenberg-${gutenbergId}`),
      });

      if (existing) {
        return NextResponse.json({
          id: existing.id,
          alreadyExists: true,
          message: "This book is already in your library!",
        });
      }
    }

    // If Gutenberg ID is provided but no pages were sent, fetch on the backend
    if (gutenbergId && (!pages || Object.keys(pages).length === 0)) {
      console.log(`Server fetching Gutenberg text for ID ${gutenbergId}...`);
      const bookData = await fetchAndPaginateGutenbergBook(gutenbergId);
      pages = bookData.pages;
      title = title || bookData.title;
      totalPages = totalPages || bookData.totalPages;
      description = description || bookData.subjects.join(", ");
      author = author || bookData.author;
      coverUrl = coverUrl || bookData.coverUrl;
    }

    if (!title || !totalPages) {
      return NextResponse.json(
        { error: "Missing required fields: title, totalPages" },
        { status: 400 }
      );
    }

    // Check if this Gutenberg book was already added
    if (gutenbergId) {
      const existing = await db.query.books.findFirst({
        where: eq(books.fileName, `gutenberg-${gutenbergId}`),
      });

      if (existing) {
        return NextResponse.json({
          id: existing.id,
          alreadyExists: true,
          message: "This book is already in your library!",
        });
      }
    }

    // Insert the new book
    const [newBook] = await db
      .insert(books)
      .values({
        title,
        author: author || "Unknown",
        fileName: gutenbergId ? `gutenberg-${gutenbergId}` : `manual-${Date.now()}`,
        coverUrl: coverUrl || null,
        description: description || null,
        totalPages,
        totalChunks: totalPages,
      })
      .returning({ id: books.id });

    // Save pages as book_chunks for retrieval
    if (pages && typeof pages === "object") {
      const chunkInserts = Object.entries(pages).map(
        ([pageNum, content]) => ({
          bookId: newBook.id,
          chunkIndex: parseInt(pageNum),
          pageNumber: parseInt(pageNum),
          content: content as string,
        })
      );

      // Insert in batches of 50 to avoid query size limits
      for (let i = 0; i < chunkInserts.length; i += 50) {
        const batch = chunkInserts.slice(i, i + 50);
        await db.insert(bookChunks).values(batch);
      }
    }

    return NextResponse.json({
      id: newBook.id,
      alreadyExists: false,
      message: "Book added to library!",
    });
  } catch (err) {
    console.error("Error adding book:", err);
    return NextResponse.json(
      { error: "Failed to add book" },
      { status: 500 }
    );
  }
}
