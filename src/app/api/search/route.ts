import { NextRequest, NextResponse } from "next/server";

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string; birth_year: number | null; death_year: number | null }[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query || query.trim().length === 0) {
    // Return popular/trending books when no query
    const res = await fetch(
      `https://gutendex.com/books?languages=en&sort=popular&page=${page}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    const data: GutendexResponse = await res.json();
    return NextResponse.json(normalizeResults(data));
  }

  const res = await fetch(
    `https://gutendex.com/books?search=${encodeURIComponent(query)}&languages=en&page=${page}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to search books" },
      { status: 500 }
    );
  }

  const data: GutendexResponse = await res.json();
  return NextResponse.json(normalizeResults(data));
}

function normalizeResults(data: GutendexResponse) {
  const books = data.results
    .filter((book) => {
      // Only include books that have a plain text format available
      return Object.keys(book.formats).some(
        (key) => key.includes("text/plain") || key.includes("text/html")
      );
    })
    .map((book) => ({
      gutenbergId: book.id,
      title: book.title,
      author: book.authors.map((a) => a.name).join(", ") || "Unknown",
      subjects: book.subjects.slice(0, 3),
      coverUrl: book.formats["image/jpeg"] || null,
      downloadCount: book.download_count,
      hasText: Object.keys(book.formats).some((key) =>
        key.includes("text/plain")
      ),
    }));

  // Extract page number from next URL
  let nextPageNumber = null;
  if (data.next) {
    try {
      const nextUrl = new URL(data.next);
      nextPageNumber = nextUrl.searchParams.get("page");
    } catch {}
  }

  return {
    books,
    totalCount: data.count,
    hasMore: data.next !== null,
    nextPage: nextPageNumber,
  };
}
