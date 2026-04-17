import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { conversations } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;
    const convo = await db.query.conversations.findFirst({
      where: and(eq(conversations.userId, userId), eq(conversations.bookId, bookId)),
    });

    return NextResponse.json({ messages: convo?.messages ?? [] });
  } catch (error) {
    console.error("Conversation GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = Array.isArray(body.messages) ? body.messages : [];

    await db
      .insert(conversations)
      .values({
        userId,
        bookId,
        messages,
      })
      .onConflictDoUpdate({
        target: [conversations.userId, conversations.bookId],
        set: {
          messages,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Conversation PUT error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const session = await verifySession();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;
    await db
      .delete(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.bookId, bookId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Conversation DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
