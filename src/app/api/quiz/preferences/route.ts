import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { quizPreferences } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    const [pref] = await db
      .select()
      .from(quizPreferences)
      .where(
        and(
          eq(quizPreferences.userId, session.user.id),
          eq(quizPreferences.bookId, bookId),
        ),
      )
      .limit(1);

    return NextResponse.json({
      preferences: pref ?? { suppressPopup: false, language: "vi" },
    });
  } catch (error) {
    console.error("[GET /api/quiz/preferences] Error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
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
      suppressPopup?: boolean;
      language?: "vi" | "en";
    };

    if (!body.bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    // Check if preferences exist
    const [existing] = await db
      .select()
      .from(quizPreferences)
      .where(
        and(
          eq(quizPreferences.userId, session.user.id),
          eq(quizPreferences.bookId, body.bookId),
        ),
      )
      .limit(1);

    if (existing) {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (body.suppressPopup !== undefined) updateData.suppressPopup = body.suppressPopup;
      if (body.language !== undefined) updateData.language = body.language;

      const [updated] = await db
        .update(quizPreferences)
        .set(updateData)
        .where(eq(quizPreferences.id, existing.id))
        .returning();

      return NextResponse.json({ preferences: updated });
    } else {
      const [created] = await db
        .insert(quizPreferences)
        .values({
          userId: session.user.id,
          bookId: body.bookId,
          suppressPopup: body.suppressPopup ?? false,
          language: body.language ?? "vi",
        })
        .returning();

      return NextResponse.json({ preferences: created }, { status: 201 });
    }
  } catch (error) {
    console.error("[POST /api/quiz/preferences] Error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
