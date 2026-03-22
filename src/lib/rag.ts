import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";
import { embedText } from "./cloudflare";

// ─── Embedding Generation ────────────────────────────────────
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return await embedText(text);
  } catch (error) {
    console.error("Cloudflare embedding failed:", error);
    throw error;
  }
}

// ─── Vector Similarity Search ────────────────────────────────
export async function searchBookChunks(
  bookId: string,
  queryEmbedding: number[],
  limit: number = 5
): Promise<Array<{ content: string; pageNumber: number; chapterNumber: number; similarity: number }>> {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT 
      content,
      page_number as "pageNumber",
      chapter_number as "chapterNumber",
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM book_chunks
    WHERE book_id = ${bookId}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return results.rows as Array<{
    content: string;
    pageNumber: number;
    chapterNumber: number;
    similarity: number;
  }>;
}

// ─── Get Page Content ────────────────────────────────────────
export async function getPageContent(
  bookId: string,
  pageNumber: number,
  range: number = 1
): Promise<string> {
  const chunks = await db
    .select({ content: bookChunks.content, pageNumber: bookChunks.pageNumber })
    .from(bookChunks)
    .where(
      and(
        eq(bookChunks.bookId, bookId),
        sql`${bookChunks.pageNumber} >= ${pageNumber}`,
        sql`${bookChunks.pageNumber} <= ${pageNumber + range}`
      )
    )
    .orderBy(bookChunks.pageNumber);

  return chunks.map((c) => c.content).join("\n\n");
}

// ─── Exa.ai Web Search (supplementary context) ──────────────
export async function searchExa(query: string): Promise<string> {
  if (!process.env.EXA_API_KEY) return "";

  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.EXA_API_KEY,
      },
      body: JSON.stringify({
        query,
        numResults: 3,
        useAutoprompt: true,
        type: "auto",
        contents: { text: { maxCharacters: 500 } },
      }),
    });

    const data = await response.json();
    if (data.results) {
      return data.results
        .map((r: { title: string; text: string }) => `[${r.title}]: ${r.text}`)
        .join("\n\n");
    }
  } catch (error) {
    console.error("Exa search failed:", error);
  }
  return "";
}

// ─── Full RAG Retrieval ──────────────────────────────────────
export async function retrieveContext(
  bookId: string,
  query: string,
  currentPage: number,
  highlightedText?: string
): Promise<{ bookContext: string; supplementaryContext: string }> {
  // 1. Get current page content
  const pageContent = await getPageContent(bookId, currentPage);

  // 2. Vector search for relevant chunks
  let relevantChunks: Array<{ content: string; pageNumber: number }> = [];
  try {
    const queryEmbedding = await generateEmbedding(query);
    relevantChunks = await searchBookChunks(bookId, queryEmbedding, 3);
  } catch (err) {
    console.warn("Vector search failed (e.g., missing API keys), falling back to page content only.", err);
  }

  // 3. Build book context
  let bookContext = `--- Current Page ${currentPage} ---\n${pageContent}`;

  if (highlightedText) {
    bookContext += `\n\n--- Highlighted Passage ---\n"${highlightedText}"`;
  }

  if (relevantChunks.length > 0) {
    bookContext += "\n\n--- Related Passages ---";
    for (const chunk of relevantChunks) {
      bookContext += `\n[Page ${chunk.pageNumber}]: ${chunk.content}`;
    }
  }

  // 4. Optional web context
  const supplementaryContext = await searchExa(query);

  return { bookContext, supplementaryContext };
}
