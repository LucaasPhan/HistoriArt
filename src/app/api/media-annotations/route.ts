import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { mediaAnnotations } from "@/drizzle/schema";
import { v2 as cloudinary } from "cloudinary";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

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
        authorId: session.user.id,
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

    // Retrieve the annotation first to check if there's a Cloudinary URL to clean up
    const existingAnnotations = await db
      .select()
      .from(mediaAnnotations)
      .where(eq(mediaAnnotations.id, id));

    if (existingAnnotations.length > 0) {
      const url = existingAnnotations[0].mediaUrl;
      if (url && url.includes("cloudinary.com") && url.includes("historiart_media/")) {
        // Parse "historiart_media/something.ext"
        const parts = url.split("historiart_media/");
        if (parts.length > 1) {
          const filenameWithExt = parts[1];
          // Strip extension to get the raw public_id
          const publicId = "historiart_media/" + filenameWithExt.split(".")[0];

          try {
            // Destroy the file from Cloudinary (using resource_type: "raw" as it doesn't hurt for other types, but wait actually we probably need to specify image/video, or we can just send "image" and "video" to make sure one works)
            await cloudinary.uploader.destroy(publicId, {
              resource_type:
                existingAnnotations[0].mediaType === "video" ||
                existingAnnotations[0].mediaType === "audio"
                  ? "video"
                  : "image",
            });
          } catch (cloudinaryErr) {
            console.error("Failed to destroy from Cloudinary:", cloudinaryErr);
            // We continue to delete from Postgres even if Cloudinary fails
          }
        }
      }
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

    // Retrieve existing annotation to check if we need to clean up old Cloudinary file
    const existingAnnotations = await db
      .select()
      .from(mediaAnnotations)
      .where(eq(mediaAnnotations.id, id));

    if (existingAnnotations.length > 0) {
      const oldUrl = existingAnnotations[0].mediaUrl;
      // If the URL has changed and the old one was a Cloudinary URL
      if (
        oldUrl &&
        oldUrl !== mediaUrl &&
        oldUrl.includes("cloudinary.com") &&
        oldUrl.includes("historiart_media/")
      ) {
        const parts = oldUrl.split("historiart_media/");
        if (parts.length > 1) {
          const filenameWithExt = parts[1];
          const publicId = "historiart_media/" + filenameWithExt.split(".")[0];

          try {
            await cloudinary.uploader.destroy(publicId, {
              resource_type:
                existingAnnotations[0].mediaType === "video" ||
                existingAnnotations[0].mediaType === "audio"
                  ? "video"
                  : "image",
            });
          } catch (cloudinaryErr) {
            console.error("Failed to destroy old media from Cloudinary during PUT:", cloudinaryErr);
          }
        }
      }
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
