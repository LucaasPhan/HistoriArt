import { NextRequest, NextResponse, after } from "next/server";
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

    // If Gutenberg ID is provided but no pages were sent, fetch on the backend using background queues
    if (gutenbergId && (!pages || Object.keys(pages).length === 0)) {
      console.log(`Server backgrounding Gutenberg text fetch for ID ${gutenbergId}...`);
      
      // 1. Instantly create the database entry
      const [newBook] = await db
        .insert(books)
        .values({
          title: title || `Book ${gutenbergId}`,
          author: author || "Unknown",
          fileName: `gutenberg-${gutenbergId}`,
          coverUrl: coverUrl || null,
          description: description || null,
          totalPages: totalPages || 0,
          totalChunks: 0, // 0 = Processing
        })
        .returning({ id: books.id });

      // 2. Queue the slow networking/parsing job
      after(async () => {
        try {
          console.log(`[Background Queue] Processing ${gutenbergId} for Book ${newBook.id}...`);
          const bookData = await fetchAndPaginateGutenbergBook(gutenbergId);
          
          const pagesToSave = bookData.pages;
          const chunkInserts = Object.entries(pagesToSave).map(
            ([pageNum, content]) => ({
              bookId: newBook.id,
              chunkIndex: parseInt(pageNum),
              pageNumber: parseInt(pageNum),
              content: content as string,
            })
          );

          // Insert in chunks
          for (let i = 0; i < chunkInserts.length; i += 50) {
             const batch = chunkInserts.slice(i, i + 50);
             await db.insert(bookChunks).values(batch);
          }

          // Complete the book record
          await db.update(books).set({
            title: title || bookData.title,
            author: author || bookData.author,
            description: description || bookData.subjects.join(", "),
            coverUrl: coverUrl || bookData.coverUrl,
            totalPages: bookData.totalPages,
            totalChunks: bookData.totalPages,
          }).where(eq(books.id, newBook.id));
          
          console.log(`[Background Queue] Job finished for ${gutenbergId}!`);
        } catch (err) {
          console.error(`[Background Queue] Error processing ${gutenbergId}:`, err);
        }
      });

      // 3. Immediately return success to the browser!
      return NextResponse.json({
        id: newBook.id,
        alreadyExists: false,
        message: "Book added! Text is processing in the background.",
      });
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

export async function DELETE(request: NextRequest) {
  try {
    const { bookId } = await request.json();
    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Check the book exists in DB (sample books can't be deleted)
    const existing = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book not found in database. Sample books cannot be deleted." },
        { status: 404 },
      );
    }

    // Delete chunks first, then the book (cascade should handle it, but be explicit)
    await db.delete(bookChunks).where(eq(bookChunks.bookId, bookId));
    await db.delete(books).where(eq(books.id, bookId));

    return NextResponse.json({ success: true, message: "Book deleted." });
  } catch (err) {
    console.error("Error deleting book:", err);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
