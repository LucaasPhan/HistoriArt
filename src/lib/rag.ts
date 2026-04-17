import { db } from "@/drizzle/db";
import { bookChunks } from "@/drizzle/schema";
import { and, eq, sql } from "drizzle-orm";
import { embedText } from "./cloudflare";

function hasCloudflareEmbeddingConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  return (
    !!accountId &&
    !!apiToken &&
    !accountId.includes("CHANGE_ME") &&
    !apiToken.includes("CHANGE_ME")
  );
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return embedText(text);
}

export async function searchBookChunks(
  bookId: string,
  queryEmbedding: number[],
  limit = 5,
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

export async function getPageContent(bookId: string, pageNumber: number, range = 1): Promise<string> {
  const chunks = await db
    .select({ content: bookChunks.content, pageNumber: bookChunks.pageNumber })
    .from(bookChunks)
    .where(
      and(
        eq(bookChunks.bookId, bookId),
        sql`${bookChunks.pageNumber} >= ${pageNumber}`,
        sql`${bookChunks.pageNumber} <= ${pageNumber + range}`,
      ),
    )
    .orderBy(bookChunks.pageNumber);

  return chunks.map((c) => c.content).join("\n\n");
}

export async function searchExa(query: string): Promise<string> {
  const exaApiKey = process.env["EXA_API_KEY"];
  if (!exaApiKey) return "";

  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": exaApiKey,
      },
      body: JSON.stringify({
        query,
        numResults: 3,
        useAutoprompt: true,
        type: "auto",
        contents: { text: { maxCharacters: 500 } },
      }),
    });

    const data = (await response.json()) as {
      results?: Array<{ title: string; text: string }>;
    };

    if (data.results) {
      return data.results.map((r) => `[${r.title}]: ${r.text}`).join("\n\n");
    }
  } catch (error) {
    console.error("Exa search failed:", error);
  }

  return "";
}

export async function retrieveContext(
  bookId: string,
  query: string,
  currentPage: number,
  highlightedText?: string,
): Promise<{ bookContext: string; supplementaryContext: string }> {
  const pageContent = await getPageContent(bookId, currentPage);

  let relevantChunks: Array<{ content: string; pageNumber: number }> = [];
  if (hasCloudflareEmbeddingConfig()) {
    try {
      const queryEmbedding = await generateEmbedding(query);
      relevantChunks = await searchBookChunks(bookId, queryEmbedding, 3);
    } catch (err) {
      console.warn("Vector search failed, falling back to page content only.", err);
    }
  }

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

  const supplementaryContext = await searchExa(query);

  return { bookContext, supplementaryContext };
}
