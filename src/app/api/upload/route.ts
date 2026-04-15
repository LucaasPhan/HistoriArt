import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { bookChunks, books } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled Book";
    const author = (formData.get("author") as string) || "Unknown";
    const customBookId = (formData.get("book_id") as string)?.trim() || null;

    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
      return NextResponse.json({ error: "Please upload a valid PDF file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pages = await ingestPdfBuffer(Buffer.from(arrayBuffer));
    const trimmedPages = findChapterOneStart(pages);

    const pageNumbers = Object.keys(trimmedPages)
      .map(Number)
      .sort((a, b) => a - b);

    if (pageNumbers.length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. It may be image-based." },
        { status: 400 },
      );
    }

    const chunkRows = pageNumbers.map((originalPageNum, chunkIndex) => ({
      chunkIndex,
      pageNumber: chunkIndex + 1,
      content: trimmedPages[originalPageNum],
    }));

    const totalPages = pageNumbers.length;
    const estimatedReadTime = calculateReadingTime(trimmedPages);
    const bookId = customBookId || crypto.randomUUID();

    await db.insert(books).values({
      id: bookId,
      title,
      author,
      fileName: file.name,
      totalPages,
      totalChunks: chunkRows.length,
      estimatedReadTime,
      userId: session.user.id,
    });

    const CHUNK_INSERT_BATCH = 50;
    for (let i = 0; i < chunkRows.length; i += CHUNK_INSERT_BATCH) {
      const batch = chunkRows.slice(i, i + CHUNK_INSERT_BATCH);
      await db.insert(bookChunks).values(
        batch.map((row) => ({
          bookId,
          chunkIndex: row.chunkIndex,
          pageNumber: row.pageNumber,
          content: row.content,
        })),
      );
    }

    return NextResponse.json({
      bookId,
      title,
      author,
      totalPages,
      totalChunks: chunkRows.length,
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

type PdfParseFn = (
  buffer: Buffer,
  options: {
    pagerender: (pageData: PageData) => Promise<string>;
  },
) => Promise<{ numpages: number }>;

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

type RichItem = {
  str: string;
  y: number;
  x: number;
  fontHeight: number;
};

const CHAPTER_ONE_PATTERN = /^\s*(chương\s*(i|1)|chapter\s*(i|1))\s*$/im;

async function ensurePdfParse(): Promise<PdfParseFn> {
  const mod = (await import("pdf-parse/lib/pdf-parse.js")) as {
    default?: PdfParseFn;
  };

  if (!mod.default) {
    throw new Error("pdf-parse could not be loaded");
  }

  return mod.default;
}

async function ingestPdfBuffer(buffer: Buffer): Promise<Record<number, string>> {
  const pdfParse = await ensurePdfParse();
  const pages: Record<number, string> = {};
  let pageCount = 0;

  await pdfParse(buffer, {
    pagerender: (pageData: PageData) => {
      return pageData.getTextContent({ normalizeWhitespace: true }).then((textContent) => {
        const items = textContent.items;

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

        const medianFontHeight =
          rich.map((it) => it.fontHeight).sort((a, b) => a - b)[Math.floor(rich.length / 2)] ?? 12;

        for (let i = 0; i < rich.length - 1; i++) {
          const current = rich[i];
          if (
            current.str.trim().length > 0 &&
            current.fontHeight > medianFontHeight * 1.4 &&
            current.str.trim().length <= 2
          ) {
            for (let n = i + 1; n < rich.length; n++) {
              if (rich[n].str.trim().length > 0) {
                rich[n].str = current.str.trim() + rich[n].str.trimStart();
                current.str = "";
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

        const yDiffs: number[] = [];
        for (let i = 1; i < filteredRich.length; i++) {
          const diff = Math.abs(filteredRich[i - 1].y - filteredRich[i].y);
          if (diff > 0 && diff < 100) yDiffs.push(diff);
        }
        yDiffs.sort((a, b) => a - b);
        const medianLineHeight = yDiffs.length > 0 ? yDiffs[Math.floor(yDiffs.length / 2)] : 14;
        const paragraphThreshold = medianLineHeight * 1.25;

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
            lineText += j === 0 ? it.str : it.str.trimStart();
          }

          const trimmedLineText = lineText.replace(/ {2,}/g, " ").trimEnd();
          if (!trimmedLineText.trim()) continue;

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

  return pages;
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "")
    .replace(/\n{4,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

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
      break;
    }
  }

  if (startPageNum === null) {
    return pages;
  }

  const trimmed: Record<number, string> = {};
  let newIndex = 1;
  for (const num of pageNums) {
    if (num >= startPageNum) {
      trimmed[newIndex] = pages[num];
      newIndex++;
    }
  }

  return trimmed;
}

function calculateReadingTime(pages: Record<number, string>): number {
  const allText = Object.values(pages).join(" ");
  const words = allText.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}
