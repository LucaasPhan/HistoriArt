import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    // Auth check: must be admin
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { pageNumber, content, pin } = body;

    // Validate required fields
    if (pageNumber === undefined || !content || !pin) {
      return NextResponse.json(
        { error: "Missing required fields (pageNumber, content, pin)" },
        { status: 400 },
      );
    }

    // 2FA: verify PIN
    const expectedPin = process.env.ADMIN_EDIT_PIN;
    if (!expectedPin) {
      return NextResponse.json({ error: "Admin PIN not configured on server" }, { status: 500 });
    }

    if (pin !== expectedPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
    }

    const { bookId } = await params;

    // Update the book_chunk content
    const updatedChunks = await db
      .update(bookChunks)
      .set({ content })
      .where(and(eq(bookChunks.bookId, bookId), eq(bookChunks.pageNumber, pageNumber)))
      .returning();

    if (updatedChunks.length === 0) {
      return NextResponse.json(
        { error: "Page not found for this book" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      content: updatedChunks[0].content,
      message: "Trang đã được cập nhật thành công!",
    });
  } catch (error) {
    console.error("[PUT /api/books/[bookId]/pages/edit] Error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}
