import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { mediaAnnotations } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get("bookId");
    const pageNumberStr = searchParams.get("pageNumber");

    if (!bookId || !pageNumberStr) {
      return NextResponse.json({ error: "Missing bookId or pageNumber params" }, { status: 400 });
    }

    const pageNumber = parseInt(pageNumberStr, 10);
    if (isNaN(pageNumber)) {
      return NextResponse.json({ error: "pageNumber must be a valid integer" }, { status: 400 });
    }

    const annotations = await db
      .select()
      .from(mediaAnnotations)
      .where(and(eq(mediaAnnotations.bookId, bookId), eq(mediaAnnotations.pageNumber, pageNumber)))
      .orderBy(mediaAnnotations.createdAt);

    return NextResponse.json(annotations);
  } catch (error) {
    console.error("[GET /api/media-annotations] Error:", error);
    return NextResponse.json({ error: "Failed to fetch annotations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { bookId, chapterId, pageNumber, passageText, mediaType, mediaUrl, caption } = body;

    // Validate required fields
    if (!bookId || !mediaType) {
      return NextResponse.json(
        { error: "Missing required fields (bookId, mediaType)" },
        { status: 400 },
      );
    }

    // We specifically require pageNumber to match the current location
    if (pageNumber === undefined) {
      return NextResponse.json({ error: "Missing pageNumber" }, { status: 400 });
    }

    const newAnnotation = await db
      .insert(mediaAnnotations)
      .values({
        bookId,
        chapterId: chapterId || null,
        pageNumber,
        passageText,
        mediaType,
        mediaUrl: mediaUrl || null,
        caption: caption || null,
      })
      .returning();

    return NextResponse.json(newAnnotation[0], { status: 201 });
  } catch (error) {
    console.error("[POST /api/media-annotations] Error:", error);
    return NextResponse.json({ error: "Failed to create annotation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id param" }, { status: 400 });
    }

    await db.delete(mediaAnnotations).where(eq(mediaAnnotations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/media-annotations] Error:", error);
    return NextResponse.json({ error: "Failed to delete annotation" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, mediaType, mediaUrl, caption } = body;

    if (!id || !mediaType) {
      return NextResponse.json(
        { error: "Missing required fields (id, mediaType)" },
        { status: 400 },
      );
    }

    const updatedAnnotation = await db
      .update(mediaAnnotations)
      .set({
        mediaType,
        mediaUrl: mediaUrl || null,
        caption: caption || null,
        updatedAt: new Date(),
      })
      .where(eq(mediaAnnotations.id, id))
      .returning();

    if (!updatedAnnotation.length) {
      return NextResponse.json({ error: "Annotation not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAnnotation[0]);
  } catch (error) {
    console.error("[PUT /api/media-annotations] Error:", error);
    return NextResponse.json({ error: "Failed to update annotation" }, { status: 500 });
  }
}
