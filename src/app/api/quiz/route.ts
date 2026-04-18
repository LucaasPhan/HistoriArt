import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { quizQuestions } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Admin CRUD for quiz questions

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const chapterNumber = searchParams.get("chapterNumber");

    const conditions = [];
    if (bookId) conditions.push(eq(quizQuestions.bookId, bookId));
    if (chapterNumber) conditions.push(eq(quizQuestions.chapterNumber, parseInt(chapterNumber, 10)));

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[GET /api/quiz] Error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as {
      bookId: string;
      chapterNumber?: number;
      questionType?: "multiple_choice" | "true_false" | "short_answer";
      question: string;
      options?: string[];
      correctIndex?: number;
      acceptedAnswers?: string[];
      explanation?: string;
      isPublished?: boolean;
    };

    const [created] = await db
      .insert(quizQuestions)
      .values({
        bookId: body.bookId,
        chapterNumber: body.chapterNumber ?? null,
        questionType: body.questionType ?? "multiple_choice",
        question: body.question,
        options: body.options ?? [],
        correctIndex: body.correctIndex ?? 0,
        acceptedAnswers: body.acceptedAnswers ?? null,
        explanation: body.explanation ?? null,
        createdBy: session.user.id,
        isPublished: body.isPublished ?? false,
      })
      .returning();

    return NextResponse.json({ question: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/quiz] Error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = (await req.json()) as {
      id: string;
      question?: string;
      questionType?: "multiple_choice" | "true_false" | "short_answer";
      options?: string[];
      correctIndex?: number;
      acceptedAnswers?: string[];
      explanation?: string;
      isPublished?: boolean;
      chapterNumber?: number;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Missing question id" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.question !== undefined) updateData.question = body.question;
    if (body.questionType !== undefined) updateData.questionType = body.questionType;
    if (body.options !== undefined) updateData.options = body.options;
    if (body.correctIndex !== undefined) updateData.correctIndex = body.correctIndex;
    if (body.acceptedAnswers !== undefined) updateData.acceptedAnswers = body.acceptedAnswers;
    if (body.explanation !== undefined) updateData.explanation = body.explanation;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.chapterNumber !== undefined) updateData.chapterNumber = body.chapterNumber;

    const [updated] = await db
      .update(quizQuestions)
      .set(updateData)
      .where(eq(quizQuestions.id, body.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error("[PUT /api/quiz] Error:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing question id" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/quiz] Error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
