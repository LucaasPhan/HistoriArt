import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { db } from "@/drizzle/db";
import { books } from "@/drizzle/schema";
import { bookChunks } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/dal/verifySession";

export async function GET() {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;

    // Sample books are always visible
    const sampleBooksMapped = SAMPLE_BOOKS.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description,
      coverUrl: null as string | null,
      coverGradient: b.coverGradient,
      totalPages: b.totalPages,
      fileName: null,
    }));

    // Only fetch user's own DB books if authenticated
    if (!userId) {
      return NextResponse.json({ books: sampleBooksMapped });
    }

    const dbBooks = await db.query.books.findMany({
      where: eq(books.userId, userId),
      orderBy: (books, { desc }) => [desc(books.createdAt)],
    });

    const allBooks = [
      ...dbBooks.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description || "",
        coverUrl: b.coverUrl || null,
        coverGradient: ["#667eea", "#764ba2"] as [string, string],
        totalPages: b.totalPages,
        totalChunks: b.totalChunks,
        fileName: b.fileName,
      })),
      ...sampleBooksMapped,
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
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { title, author, coverUrl, description, totalPages, pages } = body;

    if (!title || !totalPages) {
      return NextResponse.json(
        { error: "Missing required fields: title, totalPages" },
        { status: 400 }
      );
    }

    // Insert the new book
    const [newBook] = await db
      .insert(books)
      .values({
        id: crypto.randomUUID(),
        title,
        author: author || "Unknown",
        fileName: `manual-${Date.now()}`,
        coverUrl: coverUrl || null,
        description: description || null,
        totalPages,
        totalChunks: totalPages,
        userId,
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
      message: "Sách đã được thêm vào thư viện!",
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
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await request.json();
    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Check the book exists in DB and belongs to the current user
    const existing = await db.query.books.findFirst({
      where: and(eq(books.id, bookId), eq(books.userId, session.user.id)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book not found or you don't have permission to delete it." },
        { status: 404 },
      );
    }

    // Delete chunks first, then the book
    await db.delete(bookChunks).where(eq(bookChunks.bookId, bookId));
    await db.delete(books).where(eq(books.id, bookId));

    return NextResponse.json({ success: true, message: "Sách đã được xóa." });
  } catch (err) {
    console.error("Error deleting book:", err);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
