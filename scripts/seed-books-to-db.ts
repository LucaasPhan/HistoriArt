/**
 * Seed script: Migrates all sample books from books.json into the database.
 *
 * Usage:
 *   npx tsx scripts/seed-books-to-db.ts
 *
 * This script is idempotent — checks for existing records before inserting.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import booksData from "../src/data/books.json";
import { bookChunks, books } from "../src/drizzle/schema";

const databaseUrl = process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("NEON_DATABASE_URL is not set in .env");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

interface BookEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  era: string;
  coverGradient: [string, string];
  totalPages: number;
  pages: Record<string, string>;
}

async function seed() {
  const allBooks = booksData as unknown as BookEntry[];

  console.log(`📚 Found ${allBooks.length} books to seed...\n`);

  for (const book of allBooks) {
    console.log(`  → Seeding "${book.title}" (${book.id})...`);

    // Calculate estimated read time (words / 200 wpm)
    const allText = Object.values(book.pages).join(" ");
    const wordCount = allText.trim().split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);

    // Check if book already exists
    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, book.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`    ⏭️  Book already exists, skipping insert`);
    } else {
      // Insert book record
      try {
        await db.insert(books).values({
          id: book.id,
          title: book.title,
          author: book.author,
          fileName: `sample-${book.id}`,
          description: book.description,
          era: book.era,
          coverGradient: book.coverGradient,
          isSample: true,
          totalPages: book.totalPages,
          totalChunks: book.totalPages,
          estimatedReadTime,
          userId: null,
        });

        console.log(`    ✅ Book record inserted`);
      } catch (err) {
        console.error(`    ❌ Error inserting book:`, err);
        continue;
      }
    }

    // Insert pages as book_chunks
    const pageEntries = Object.entries(book.pages);
    console.log(`    📄 Checking ${pageEntries.length} pages...`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const [pageNum, content] of pageEntries) {
      const pageNumber = parseInt(pageNum);

      // Check if chunk already exists
      const existingChunk = await db
        .select({ id: bookChunks.id })
        .from(bookChunks)
        .where(and(eq(bookChunks.bookId, book.id), eq(bookChunks.pageNumber, pageNumber)))
        .limit(1);

      if (existingChunk.length > 0) {
        skippedCount++;
        continue;
      }

      try {
        await db.insert(bookChunks).values({
          bookId: book.id,
          chunkIndex: pageNumber,
          pageNumber,
          content: content as string,
        });
        insertedCount++;
      } catch (err) {
        console.error(`    ❌ Error inserting page ${pageNum}:`, err);
      }
    }

    console.log(`    ✅ Pages: ${insertedCount} inserted, ${skippedCount} skipped\n`);
  }

  console.log("🎉 Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
