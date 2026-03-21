import { NextRequest, NextResponse } from "next/server";

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
  subjects: string[];
}

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
    // 1. Get book metadata from Gutendex
    const metaRes = await fetch(
      `https://gutendex.com/books/${gutenbergId}`
    );

    if (!metaRes.ok) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    const meta: GutendexBook = await metaRes.json();

    // 2. Find the plain text URL
    const textUrl = findTextUrl(meta.formats);
    if (!textUrl) {
      return NextResponse.json(
        { error: "No readable text format available for this book" },
        { status: 404 }
      );
    }

    // 3. Fetch the full text
    const textRes = await fetch(textUrl);
    if (!textRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch book text" },
        { status: 500 }
      );
    }

    const rawText = await textRes.text();

    // 4. Clean and paginate
    const cleanedText = cleanGutenbergText(rawText);
    const pages = paginateText(cleanedText, 1500);

    return NextResponse.json({
      gutenbergId: meta.id,
      title: meta.title,
      author: meta.authors.map((a) => a.name).join(", ") || "Unknown",
      coverUrl: meta.formats["image/jpeg"] || null,
      subjects: meta.subjects.slice(0, 5),
      totalPages: Object.keys(pages).length,
      pages, // Record<number, string>
    });
  } catch (err) {
    console.error("Error fetching book:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function findTextUrl(formats: Record<string, string>): string | null {
  // Prefer UTF-8 plain text
  for (const [mime, url] of Object.entries(formats)) {
    if (mime.includes("text/plain") && mime.includes("utf-8")) {
      return url;
    }
  }
  // Fall back to any plain text
  for (const [mime, url] of Object.entries(formats)) {
    if (mime.includes("text/plain")) {
      return url;
    }
  }
  return null;
}

function cleanGutenbergText(raw: string): string {
  // Remove Project Gutenberg header and footer
  let text = raw;

  // Find start of actual content (after the PG header)
  const startMarkers = [
    "*** START OF THE PROJECT GUTENBERG EBOOK",
    "*** START OF THIS PROJECT GUTENBERG EBOOK",
    "***START OF THE PROJECT GUTENBERG EBOOK",
  ];

  for (const marker of startMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = text.indexOf("\n", idx + marker.length);
      text = text.slice(afterMarker + 1);
      break;
    }
  }

  // Find end of actual content (before the PG footer)
  const endMarkers = [
    "*** END OF THE PROJECT GUTENBERG EBOOK",
    "*** END OF THIS PROJECT GUTENBERG EBOOK",
    "***END OF THE PROJECT GUTENBERG EBOOK",
    "End of the Project Gutenberg EBook",
    "End of Project Gutenberg",
  ];

  for (const marker of endMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      text = text.slice(0, idx);
      break;
    }
  }

  // Clean up excessive whitespace
  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/\n{4,}/g, "\n\n\n");
  text = text.trim();

  return text;
}

function paginateText(
  text: string,
  charsPerPage: number
): Record<number, string> {
  const pages: Record<number, string> = {};
  const paragraphs = text.split(/\n\n+/);

  let currentPage = 1;
  let currentContent = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // If adding this paragraph would exceed the limit, start a new page
    if (
      currentContent.length + trimmed.length > charsPerPage &&
      currentContent.length > 0
    ) {
      pages[currentPage] = currentContent.trim();
      currentPage++;
      currentContent = trimmed;
    } else {
      currentContent += (currentContent ? "\n\n" : "") + trimmed;
    }
  }

  // Don't forget the last page
  if (currentContent.trim()) {
    pages[currentPage] = currentContent.trim();
  }

  return pages;
}
