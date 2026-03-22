import { db } from "@/drizzle/db";
import { books, bookChunks } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { verifySession } from "@/dal/verifySession";

/**
 * POST /api/upload
 * Accepts a PDF file via FormData, extracts text, chunks it,
 * generates OpenAI embeddings, and stores everything in Neon + pgvector.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled Book";
    const author = (formData.get("author") as string) || "Unknown";

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a valid PDF file" },
        { status: 400 },
      );
    }

    // 1. Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(
      new Uint8Array(arrayBuffer),
    );
    const fullText = Array.isArray(text) ? text.join("\n") : text;

    if (!fullText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. It may be image-based." },
        { status: 400 },
      );
    }

    // 2. Chunk the text (~500 tokens ≈ ~2000 chars per chunk)
    const chunks = chunkText(fullText, 2000, 200);

    // 3. Generate a book ID
    const bookId = crypto.randomUUID();

    const BATCH_SIZE = 100;
    const allChunkRows: {
      bookId: string;
      chunkIndex: number;
      pageNumber: number | null;
      content: string;
    }[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      for (let j = 0; j < batch.length; j++) {
        allChunkRows.push({
          bookId,
          chunkIndex: i + j,
          pageNumber: batch[j].estimatedPage,
          content: batch[j].text,
        });
      }
    }

    // 5. Insert book record
    await db.insert(books).values({
      id: bookId,
      title,
      author,
      fileName: file.name,
      totalPages,
      totalChunks: allChunkRows.length,
      userId,
    });

    // 6. Batch-insert chunks (groups of 50 to avoid query size limits)
    const CHUNK_INSERT_BATCH = 50;
    for (let i = 0; i < allChunkRows.length; i += CHUNK_INSERT_BATCH) {
      const batch = allChunkRows.slice(i, i + CHUNK_INSERT_BATCH);
      await db.insert(bookChunks).values(batch);
    }

    return NextResponse.json({
      bookId,
      title,
      author,
      totalPages,
      totalChunks: allChunkRows.length,
      fileName: file.name,
    });
  } catch (error) {
    console.error("[/api/upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to process the PDF. Please try again." },
      { status: 500 },
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────

interface TextChunk {
  text: string;
  estimatedPage: number | null;
}

/**
 * Split text into overlapping chunks of approximately `maxChars` characters.
 * Tries to break at sentence boundaries.
 */
function chunkText(
  text: string,
  maxChars: number,
  overlap: number,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];

  let current = "";
  let chunkStart = 0;

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.length > 0) {
      chunks.push({
        text: current.trim(),
        estimatedPage: estimatePage(chunkStart, text.length),
      });

      // Keep overlap from the end of current chunk
      const overlapText = current.slice(-overlap);
      chunkStart += current.length - overlap;
      current = overlapText + sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) {
    chunks.push({
      text: current.trim(),
      estimatedPage: estimatePage(chunkStart, text.length),
    });
  }

  return chunks;
}

function estimatePage(charPosition: number, totalChars: number): number {
  // Rough estimate: ~3000 chars per page
  return Math.floor(charPosition / 3000) + 1;
}
