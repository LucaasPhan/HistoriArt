import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { bookChunks, books } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;

    // Fetch sample books from DB
    let sampleBooksFromDb: any[] = [];
    try {
      sampleBooksFromDb = await db.query.books.findMany({
        where: eq(books.isSample, true),
        orderBy: (books, { asc }) => [asc(books.createdAt)],
      });
    } catch {
      sampleBooksFromDb = [];
    }

    // Map DB sample books
    const sampleBooksMapped = sampleBooksFromDb.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description || "",
      coverUrl: b.coverUrl || null,
      coverGradient: b.coverGradient || ["#667eea", "#764ba2"],
      era: b.era || "",
      totalPages: b.totalPages,
      totalChunks: b.totalChunks,
      estimatedReadTime: b.estimatedReadTime,
      fileName: b.fileName,
      isSample: true,
    }));

    // Only fetch user's own DB books if authenticated
    if (!userId) {
      return NextResponse.json({ books: sampleBooksMapped });
    }

    const dbBooks = await db.query.books.findMany({
      where: and(eq(books.userId, userId), eq(books.isSample, false)),
      orderBy: (books, { desc }) => [desc(books.createdAt)],
    });

    const allBooks = [
      ...dbBooks.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description || "",
        coverUrl: b.coverUrl || null,
        coverGradient: b.coverGradient || (["#667eea", "#764ba2"] as [string, string]),
        era: b.era || "",
        totalPages: b.totalPages,
        totalChunks: b.totalChunks,
        estimatedReadTime: b.estimatedReadTime,
        fileName: b.fileName,
        isSample: false,
      })),
      ...sampleBooksMapped,
    ];

    return NextResponse.json({ books: allBooks });
  } catch (err) {
    console.error("Error fetching books:", err);
    return NextResponse.json({ books: [] });
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
        { status: 400 },
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
        estimatedReadTime: pages
          ? Math.ceil(Object.values(pages).join(" ").trim().split(/\s+/).length / 200)
          : null,
        userId,
      })
      .returning({ id: books.id });

    // Save pages as book_chunks for retrieval
    if (pages && typeof pages === "object") {
      const chunkInserts = Object.entries(pages).map(([pageNum, content]) => ({
        bookId: newBook.id,
        chunkIndex: parseInt(pageNum),
        pageNumber: parseInt(pageNum),
        content: content as string,
      }));

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
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
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
