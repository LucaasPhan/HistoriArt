import { NextRequest, NextResponse } from "next/server";
import { fetchAndPaginateGutenbergBook } from "@/lib/gutenberg";

/**
 * Fetches a single book's full text from Project Gutenberg,
 * splits it into reader-friendly pages (~1500 chars each).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gutenbergId: string }> }
) {
  const { gutenbergId } = await params;

  try {
    const result = await fetchAndPaginateGutenbergBook(gutenbergId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching book:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
