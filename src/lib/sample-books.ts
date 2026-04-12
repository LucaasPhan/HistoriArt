// ─── Vietnamese History Sample Books for Historiart ───────────
import booksData from "../data/books.json";

export interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  era: string;
  coverGradient: [string, string];
  totalPages: number;
  estimatedReadTime?: number; // in minutes
  pages: Record<string | number, string>;
}

export const SAMPLE_BOOKS: BookData[] = booksData as unknown as BookData[];
