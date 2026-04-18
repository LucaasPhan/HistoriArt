import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { books, quizResults } from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    const conditions = [eq(quizResults.userId, session.user.id)];
    if (bookId) conditions.push(eq(quizResults.bookId, bookId));

    const rows = await db
      .select({
        id: quizResults.id,
        bookId: quizResults.bookId,
        bookTitle: books.title,
        chapterNumber: quizResults.chapterNumber,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        completedAt: quizResults.completedAt,
      })
      .from(quizResults)
      .leftJoin(books, eq(quizResults.bookId, books.id))
      .where(and(...conditions))
      .orderBy(desc(quizResults.completedAt));

    // Fallback: if book was deleted, use the bookId as the display title
    const results = rows.map((r) => ({
      ...r,
      bookTitle: r.bookTitle ?? r.bookId,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[GET /api/quiz/results] Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = (await req.json()) as {
      bookId: string;
      chapterNumber?: number;
      score: number;
      totalQuestions: number;
    };

    const [result] = await db
      .insert(quizResults)
      .values({
        userId: session.user.id,
        bookId: body.bookId,
        chapterNumber: body.chapterNumber ?? null,
        score: body.score,
        totalQuestions: body.totalQuestions,
      })
      .returning();

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/quiz/results] Error:", error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
