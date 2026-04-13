#!/usr/bin/env npx tsx
/**
 * Historiart Book Ingestion Script
 *
 * Usage:
 *   PDF from URL:  npx tsx scripts/ingest-book.ts --url <pdf-url> --title "..." --author "..." --era "..." [--id <slug>] [--description "..."]
 *   PDF from File: npx tsx scripts/ingest-book.ts --pdf <local-path.pdf> --title "..." --author "..." --era "..." [--id <slug>] [--description "..."]
 *   Raw text file: npx tsx scripts/ingest-book.ts --raw <file.txt> --title "..." --author "..." --era "..." [--id <slug>] [--description "..."]
 *
 * The raw .txt file must use ---PAGE--- on its own line to delimit pages.
 *
 * Era options:
 *   "Chống Mông Nguyên"
 *   "Kháng chiến chống Pháp"
 *   "Kháng chiến chống Mỹ"
 */

import fs from "fs";
import http from "http";
import https from "https";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  era: string;
  coverGradient: [string, string];
  totalPages: number;
  estimatedReadTime: number;
  pages: Record<number, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ERA_GRADIENTS: Record<string, [string, string]> = {
  "Chống Mông Nguyên": ["#2C1810", "#C4956A"],
  "Kháng chiến chống Pháp": ["#8B0000", "#D4A574"],
  "Kháng chiến chống Mỹ": ["#1B4332", "#D4A574"],
};

const CHAPTER_ONE_PATTERN = /^\s*(chương\s*(i|1)|chapter\s*(i|1))\s*$/im;

// ─── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i + 1]) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

function validateArgs(args: Record<string, string>): void {
  const missing: string[] = [];
  for (const required of ["title", "author", "era"]) {
    if (!args[required]) missing.push(`--${required}`);
  }
  if (!args.url && !args.raw && !args.pdf) missing.push("--url, --pdf, or --raw");

  if (missing.length > 0) {
    console.error(`\nMissing required arguments: ${missing.join(", ")}`);
    console.error(`
Usage:
  PDF URL:   npx tsx scripts/ingest-book.ts --url <pdf-url> --title "..." --author "..." --era "..."
  PDF File:  npx tsx scripts/ingest-book.ts --pdf <local-path.pdf> --title "..." --author "..." --era "..."
  Raw Text:  npx tsx scripts/ingest-book.ts --raw <file.txt> --title "..." --author "..." --era "..."

Era options:
  "Chống Mông Nguyên"
  "Kháng chiến chống Pháp"
  "Kháng chiến chống Mỹ"
    `);
    process.exit(1);
  }
}

// ─── Text cleaning ────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return (
    text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\f/g, "")
      // Collapse 4+ newlines to 2
      .replace(/\n{4,}/g, "\n\n")
      // Clean up spaces
      .replace(/ {2,}/g, " ")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim()
  );
}

// ─── Chapter 1 detection ──────────────────────────────────────────────────────

function findChapterOneStart(pages: Record<number, string>): Record<number, string> {
  const pageNums = Object.keys(pages)
    .map(Number)
    .sort((a, b) => a - b);
  let startPageNum: number | null = null;

  for (const num of pageNums) {
    const lines = pages[num].split("\n");
    const hasChapterOne = lines.some((line) => CHAPTER_ONE_PATTERN.test(line.trim()));
    if (hasChapterOne) {
      startPageNum = num;
      console.log(`\nFound chapter 1 marker on PDF page ${num}`);
      break;
    }
  }

  if (startPageNum === null) {
    console.warn(
      "\nWarning: Could not find a chapter 1 marker (Chương I / Chapter 1).\n" +
        "Keeping all pages as-is. Check the PDF for the correct heading format.",
    );
    return pages;
  }

  // Re-index: chapter 1 page becomes reader page 1
  const trimmed: Record<number, string> = {};
  let newIndex = 1;
  for (const num of pageNums) {
    if (num >= startPageNum) {
      trimmed[newIndex] = pages[num];
      newIndex++;
    }
  }

  const skipped = startPageNum - Math.min(...pageNums);
  console.log(
    `Skipped ${skipped} front-matter page(s). ` +
      `Book starts at reader page 1 = PDF page ${startPageNum}.`,
  );

  return trimmed;
}

// ─── PDF fetching ─────────────────────────────────────────────────────────────

function fetchBuffer(url: string, redirectCount = 0): Promise<Buffer> {
  if (redirectCount > 5) return Promise.reject(new Error("Too many redirects"));

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const chunks: Buffer[] = [];

    protocol
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          resolve(fetchBuffer(res.headers.location, redirectCount + 1));
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          return;
        }
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function ensurePdfParse(): Promise<
  (buffer: Buffer, options: object) => Promise<{ numpages: number }>
> {
  try {
    // Bypass the default export which loads test fixtures on import.
    // Import the actual parser directly from the dist path instead.
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    return mod.default ?? mod;
  } catch {
    console.log("pdf-parse not found — installing temporarily...");
    const { execSync } = await import("child_process");
    execSync("npm install pdf-parse --no-save", { stdio: "inherit" });
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    return mod.default ?? mod;
  }
}

// ─── Ingestion modes ──────────────────────────────────────────────────────────

async function ingestPdfFromUrl(url: string): Promise<Record<number, string>> {
  console.log(`\nFetching PDF from: ${url}`);
  const buffer = await fetchBuffer(url);
  console.log(`Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);
  return ingestPdfBuffer(buffer);
}

async function ingestPdfFromFile(filePath: string): Promise<Record<number, string>> {
  console.log(`\nReading PDF from: ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  console.log(`Read ${(buffer.length / 1024).toFixed(1)} KB from disk`);
  return ingestPdfBuffer(buffer);
}

async function ingestPdfBuffer(buffer: Buffer): Promise<Record<number, string>> {
  const pdfParse = await ensurePdfParse();
  const pages: Record<number, string> = {};
  let pageCount = 0;

  type TextItem = {
    str: string;
    hasEOL: boolean;
    transform?: number[];
  };

  type PageData = {
    getTextContent: (opts: { normalizeWhitespace: boolean }) => Promise<{
      items: TextItem[];
    }>;
  };

  await pdfParse(buffer, {
    pagerender: (pageData: PageData) => {
      return pageData.getTextContent({ normalizeWhitespace: true }).then((textContent) => {
        const items = textContent.items;

        // First pass: collect all items with their Y positions
        type RichItem = {
          str: string;
          y: number;
          x: number;
          fontHeight: number;
        };

        const rich: RichItem[] = items
          .filter((item) => item.str.trim().length > 0)
          .map((item) => ({
            str: item.str,
            y: item.transform ? item.transform[5] : 0,
            x: item.transform ? item.transform[4] : 0,
            fontHeight: item.transform ? Math.abs(item.transform[3]) || 12 : 12,
          }));

        if (rich.length === 0) {
          pageCount++;
          return "";
        }

        // Preprocess: Merge drop caps with the immediately following text item
        const medianFontHeight =
          rich.map((it) => it.fontHeight).sort((a, b) => a - b)[Math.floor(rich.length / 2)] ?? 12;

        for (let i = 0; i < rich.length - 1; i++) {
          const current = rich[i];
          // If it's a drop cap
          if (
            current.str.trim().length > 0 &&
            current.fontHeight > medianFontHeight * 1.4 &&
            current.str.trim().length <= 2
          ) {
            // Find the next non-empty item to merge into
            for (let n = i + 1; n < rich.length; n++) {
              if (rich[n].str.trim().length > 0) {
                rich[n].str = current.str.trim() + rich[n].str.trimStart();
                current.str = ""; // zero out the drop cap item
                break;
              }
            }
          }
        }

        const filteredRich = rich.filter((it) => it.str.trim().length > 0);

        if (filteredRich.length === 0) {
          pageCount++;
          return "";
        }

        // Calculate median line height
        const yDiffs: number[] = [];
        for (let i = 1; i < filteredRich.length; i++) {
          const diff = Math.abs(filteredRich[i - 1].y - filteredRich[i].y);
          if (diff > 0 && diff < 100) yDiffs.push(diff);
        }
        yDiffs.sort((a, b) => a - b);
        const medianLineHeight = yDiffs.length > 0 ? yDiffs[Math.floor(yDiffs.length / 2)] : 14;

        // Paragraph threshold: 1.25x normal line height (sometimes lines have small gaps)
        const paragraphThreshold = medianLineHeight * 1.25;

        // Group items into lines
        type Line = { y: number; items: RichItem[] };
        const lines: Line[] = [];

        for (const item of filteredRich) {
          const lastLine = lines[lines.length - 1];
          if (lastLine && Math.abs(lastLine.y - item.y) < 4) {
            lastLine.items.push(item);
          } else {
            lines.push({ y: item.y, items: [item] });
          }
        }

        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
        }

        const minX = filteredRich.reduce((min, it) => Math.min(min, it.x), Infinity);

        let pageText = "";

        for (let k = 0; k < lines.length; k++) {
          const line = lines[k];
          if (line.items.length === 0) continue;

          let lineText = "";
          for (let j = 0; j < line.items.length; j++) {
            const it = line.items[j];
            if (j > 0 && !lineText.endsWith(" ") && !it.str.startsWith(" ")) {
              lineText += " ";
            }
            // preserve leading spaces dynamically if it's the first item for indent detection
            lineText += j === 0 ? it.str : it.str.trimStart();
          }

          const trimmedLineText = lineText.replace(/ {2,}/g, " ").trimEnd();
          if (!trimmedLineText.trim()) continue;

          // Detect indentation
          let isIndented = false;
          if (lineText.startsWith("  ") || lineText.startsWith("\t")) {
            isIndented = true;
          }
          if (line.items[0].x > minX + 12) {
            isIndented = true;
          }

          if (pageText.length === 0) {
            pageText += trimmedLineText.trimStart();
            continue;
          }

          const prevY = lines[k - 1].y;
          const gap = Math.abs(prevY - line.y);

          if (gap > paragraphThreshold || isIndented) {
            pageText += "\n\n" + trimmedLineText.trimStart();
          } else {
            const endsWithHyphen = pageText.trimEnd().endsWith("-");
            if (endsWithHyphen) {
              pageText = pageText.trimEnd().slice(0, -1) + trimmedLineText.trimStart();
            } else {
              pageText += " " + trimmedLineText.trimStart();
            }
          }
        }

        pageCount++;
        const cleaned = cleanText(pageText);
        if (cleaned.length > 0) {
          pages[pageCount] = cleaned;
        }
        return pageText;
      });
    },
  });

  console.log(`Parsed ${pageCount} PDF pages`);
  return pages;
}

function ingestRawText(filePath: string): Record<number, string> {
  console.log(`\nReading raw text from: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parts = raw.split(/^---PAGE---$/m);

  const pages: Record<number, string> = {};
  parts.forEach((part, idx) => {
    const cleaned = cleanText(part);
    if (cleaned.length > 0) {
      pages[idx + 1] = cleaned;
    }
  });

  console.log(`Split into ${Object.keys(pages).length} pages`);
  return pages;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateReadingTime(pages: Record<number, string>): number {
  const allText = Object.values(pages).join(" ");
  const words = allText.trim().split(/\s+/).length;
  // Avg reading speed: 200 words per minute
  return Math.ceil(words / 200);
}

function printPreview(pages: Record<number, string>, count = 3): void {
  console.log("\n─── Page Preview ───────────────────────────────────────");
  const pageNums = Object.keys(pages)
    .map(Number)
    .sort((a, b) => a - b);
  pageNums.slice(0, count).forEach((num) => {
    const preview = pages[num].slice(0, 200).replace(/\n/g, " ");
    console.log(`\nPage ${num}: ${preview}${pages[num].length > 200 ? "..." : ""}`);
  });
  if (pageNums.length > count) {
    console.log(`\n... and ${pageNums.length - count} more pages`);
  }
  console.log("────────────────────────────────────────────────────────");
}

function writeToJson(entry: BookEntry): void {
  const jsonPath = path.resolve(process.cwd(), "src/data/books.json");

  let books: BookEntry[] = [];
  if (fs.existsSync(jsonPath)) {
    books = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  }

  const existingIdx = books.findIndex((b) => b.id === entry.id);
  if (existingIdx >= 0) {
    console.log(`\nUpdating existing entry: ${entry.id}`);
    books[existingIdx] = entry;
  } else {
    console.log(`\nAdding new entry: ${entry.id}`);
    books.push(entry);
  }

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2), "utf-8");
  console.log(`Written to data/books.json`);
}

async function confirm(question: string): Promise<boolean> {
  const { createInterface } = await import("readline");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  validateArgs(args);

  // Ingest
  let pages: Record<number, string>;
  if (args.url) {
    pages = await ingestPdfFromUrl(args.url);
    // Auto-trim front matter for PDF mode only
    pages = findChapterOneStart(pages);
  } else if (args.pdf) {
    pages = await ingestPdfFromFile(args.pdf);
    // Auto-trim front matter for PDF mode only
    pages = findChapterOneStart(pages);
  } else {
    // Raw mode: user controls pagination with ---PAGE---
    pages = ingestRawText(args.raw);
  }

  const totalPages = Math.max(...Object.keys(pages).map(Number));

  // Build book entry
  const id = args.id || slugify(args.title);
  const era = args.era;
  const entry: BookEntry = {
    id,
    title: args.title,
    author: args.author,
    description: args.description || "",
    era,
    coverGradient: ERA_GRADIENTS[era] ?? ["#1a1a2e", "#c4956a"],
    totalPages,
    estimatedReadTime: calculateReadingTime(pages),
    pages,
  };

  // Summary
  printPreview(pages);
  console.log(`\nBook ID:     ${entry.id}`);
  console.log(`Title:       ${entry.title}`);
  console.log(`Author:      ${entry.author}`);
  console.log(`Era:         ${entry.era}`);
  console.log(`Total pages: ${entry.totalPages}`);

  // Confirm
  const ok = await confirm("\nWrite to data/books.json? [y/N] ");
  if (!ok) {
    console.log("Aborted.");
    process.exit(0);
  }

  writeToJson(entry);
  console.log("\nDone. ✓");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
