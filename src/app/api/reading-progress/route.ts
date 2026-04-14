import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { readingProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ progress: {} });
    }

    const progresses = await db.query.readingProgress.findMany({
      where: eq(readingProgress.userId, session.user.id),
    });

    // Map `[bookId]: lastPageRead`
    const progressMap = progresses.reduce(
      (acc, rp) => {
        acc[rp.bookId] = rp.lastPageRead;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({ progress: progressMap });
  } catch (error) {
    console.error("[GET /api/reading-progress] Error:", error);
    return NextResponse.json({ error: "Failed to fetch reading progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, pageNumber } = body;

    if (!bookId || typeof pageNumber !== "number") {
      return NextResponse.json({ error: "Missing or invalid bookId/pageNumber" }, { status: 400 });
    }

    const [updated] = await db
      .insert(readingProgress)
      .values({
        userId: session.user.id,
        bookId,
        lastPageRead: pageNumber,
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.bookId],
        set: {
          lastPageRead: pageNumber,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, progress: updated });
  } catch (error) {
    console.error("[POST /api/reading-progress] Error:", error);
    return NextResponse.json({ error: "Failed to update reading progress" }, { status: 500 });
  }
}
