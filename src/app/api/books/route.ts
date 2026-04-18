import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { bookChunks, books } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === "admin";
    type BookRow = typeof books.$inferSelect;

    // Fetch sample books from DB
    let sampleBooksFromDb: BookRow[] = [];
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
      where: isAdmin
        ? eq(books.isSample, false)
        : and(eq(books.userId, userId), eq(books.isSample, false)),
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
      const chunkInserts = Object.entries(pages).map(([pageNum, content], index) => ({
        bookId: newBook.id,
        chunkIndex: index,
        pageNumber: index + 1,
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

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = (await request.json()) as {
      bookId?: string;
      pin?: string;
    };
    const bookId = body.bookId?.trim();
    const pin = body.pin;

    if (!bookId || !pin) {
      return NextResponse.json({ error: "Missing required fields (bookId, pin)" }, { status: 400 });
    }

    const expectedPin = process.env.ADMIN_DELETE_PIN;
    if (!expectedPin) {
      return NextResponse.json(
        { error: "Admin delete PIN not configured on server" },
        { status: 500 },
      );
    }

    if (pin !== expectedPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
    }

    const existing = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!existing) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    if (existing.isSample) {
      return NextResponse.json({ error: "Sample books cannot be deleted." }, { status: 403 });
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

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = (await request.json()) as {
      bookId?: string;
      newBookId?: string;
      title?: string;
      author?: string;
      description?: string;
      coverUrl?: string | null;
      pin?: string;
    };

    const bookId = body.bookId?.trim();
    const newBookId = body.newBookId?.trim() || null;
    const title = body.title?.trim();
    const author = body.author?.trim();
    const description = typeof body.description === "string" ? body.description.trim() : undefined;
    const coverUrl =
      typeof body.coverUrl === "string"
        ? body.coverUrl.trim()
        : body.coverUrl === null
          ? null
          : undefined;
    const pin = body.pin;

    if (!bookId || !pin) {
      return NextResponse.json({ error: "Missing required fields (bookId, pin)" }, { status: 400 });
    }

    const expectedPin = process.env.ADMIN_EDIT_PIN;
    if (!expectedPin) {
      return NextResponse.json({ error: "Admin PIN not configured on server" }, { status: 500 });
    }

    if (pin !== expectedPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!author) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    // If newBookId is provided and different, re-create the book with the new ID
    if (newBookId && newBookId !== bookId) {
      // Check the new ID doesn't already exist
      const conflict = await db.query.books.findFirst({
        where: eq(books.id, newBookId),
      });
      if (conflict) {
        return NextResponse.json({ error: "A book with that ID already exists" }, { status: 409 });
      }

      const existing = await db.query.books.findFirst({
        where: eq(books.id, bookId),
      });
      if (!existing) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }

      // 1. Insert new book with the new ID
      await db.insert(books).values({
        ...existing,
        id: newBookId,
        title,
        author,
        description: description ?? existing.description,
        coverUrl: coverUrl ?? existing.coverUrl,
      });

      // 2. Migrate book_chunks (has FK constraint)
      await db.update(bookChunks).set({ bookId: newBookId }).where(eq(bookChunks.bookId, bookId));

      // 3. Migrate other tables (no FK constraints, just text columns)
      const { mediaAnnotations, quizQuestions, quizResults, favoriteBooks, readingProgress } =
        await import("@/drizzle/schema");

      await db
        .update(mediaAnnotations)
        .set({ bookId: newBookId })
        .where(eq(mediaAnnotations.bookId, bookId));
      await db
        .update(quizQuestions)
        .set({ bookId: newBookId })
        .where(eq(quizQuestions.bookId, bookId));
      await db.update(quizResults).set({ bookId: newBookId }).where(eq(quizResults.bookId, bookId));
      await db
        .update(favoriteBooks)
        .set({ bookId: newBookId })
        .where(eq(favoriteBooks.bookId, bookId));
      await db
        .update(readingProgress)
        .set({ bookId: newBookId })
        .where(eq(readingProgress.bookId, bookId));

      // 4. Delete old book (no chunks left pointing to it)
      await db.delete(books).where(eq(books.id, bookId));

      return NextResponse.json({ success: true, newBookId });
    }

    // Standard update (no ID change)
    const [updated] = await db
      .update(books)
      .set({
        title,
        author,
        description: description ?? null,
        coverUrl: coverUrl ?? null,
      })
      .where(eq(books.id, bookId))
      .returning({ id: books.id });

    if (!updated) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating book:", err);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}
