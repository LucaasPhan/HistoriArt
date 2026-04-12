import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { favoriteBooks } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET — return all favorite book IDs for the current user
export async function GET() {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await db
      .select({ bookId: favoriteBooks.bookId })
      .from(favoriteBooks)
      .where(eq(favoriteBooks.userId, session.user.id));

    return NextResponse.json({
      favoriteBookIds: favorites.map((f) => f.bookId),
    });
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

// POST — toggle favorite (add if not exists, remove if exists)
export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favoriteBooks)
      .where(and(eq(favoriteBooks.userId, session.user.id), eq(favoriteBooks.bookId, bookId)))
      .limit(1);

    if (existing.length > 0) {
      // Un-favorite
      await db
        .delete(favoriteBooks)
        .where(and(eq(favoriteBooks.userId, session.user.id), eq(favoriteBooks.bookId, bookId)));
      return NextResponse.json({ favorited: false });
    } else {
      // Favorite
      await db.insert(favoriteBooks).values({
        userId: session.user.id,
        bookId,
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
