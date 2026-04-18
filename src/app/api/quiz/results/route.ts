import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { quizResults } from "@/drizzle/schema";
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

    const results = await db
      .select()
      .from(quizResults)
      .where(and(...conditions))
      .orderBy(desc(quizResults.completedAt));

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
