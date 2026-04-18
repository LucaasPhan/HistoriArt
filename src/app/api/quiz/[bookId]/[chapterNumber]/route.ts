import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { chapters, quizQuestions } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Public route — returns published questions for a chapter

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string; chapterNumber: string }> },
) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { bookId, chapterNumber: chapterNumStr } = await params;
    const chapterNum = parseInt(chapterNumStr, 10);

    if (isNaN(chapterNum)) {
      return NextResponse.json({ error: "Invalid chapter number" }, { status: 400 });
    }

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(
        and(
          eq(quizQuestions.bookId, bookId),
          eq(quizQuestions.chapterNumber, chapterNum),
          eq(quizQuestions.isPublished, true),
        ),
      );

    // Get chapter title
    const [chapter] = await db
      .select({ title: chapters.title })
      .from(chapters)
      .where(and(eq(chapters.bookId, bookId), eq(chapters.chapterNumber, chapterNum)))
      .limit(1);

    return NextResponse.json({
      questions,
      chapterTitle: chapter?.title ?? `Chương ${chapterNum}`,
    });
  } catch (error) {
    console.error("[GET /api/quiz/[bookId]/[chapterNumber]] Error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
