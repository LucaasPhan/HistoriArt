import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { quizResults } from "@/drizzle/schema";
import { and, avg, count, desc, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Admin performance dashboard data

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const userId = searchParams.get("userId");

    // Individual user results across all books
    if (userId) {
      const results = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
        .orderBy(desc(quizResults.completedAt));

      return NextResponse.json({ results });
    }

    // Per-chapter stats for a book
    if (bookId) {
      const chapterStats = await db
        .select({
          chapterNumber: quizResults.chapterNumber,
          totalAttempts: count(),
          avgScore: avg(
            sql<number>`CASE WHEN ${quizResults.totalQuestions} > 0 THEN (${quizResults.score}::float / ${quizResults.totalQuestions}) * 100 ELSE 0 END`,
          ),
          passCount: count(
            sql`CASE WHEN ${quizResults.totalQuestions} > 0 AND (${quizResults.score}::float / ${quizResults.totalQuestions}) >= 0.7 THEN 1 END`,
          ),
        })
        .from(quizResults)
        .where(and(eq(quizResults.bookId, bookId), gte(quizResults.chapterNumber, 1)))
        .groupBy(quizResults.chapterNumber)
        .orderBy(quizResults.chapterNumber);

      // Recent attempts
      const recentAttempts = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.bookId, bookId))
        .orderBy(desc(quizResults.completedAt))
        .limit(20);

      const stats = chapterStats.map((s) => ({
        chapterNumber: s.chapterNumber,
        totalAttempts: Number(s.totalAttempts),
        avgScore: Math.round(Number(s.avgScore || 0)),
        passRate: Number(s.totalAttempts) > 0
          ? Math.round((Number(s.passCount) / Number(s.totalAttempts)) * 100)
          : 0,
      }));

      return NextResponse.json({ stats, recentAttempts });
    }

    return NextResponse.json({ error: "Missing bookId or userId parameter" }, { status: 400 });
  } catch (error) {
    console.error("[GET /api/admin/performance] Error:", error);
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 });
  }
}
