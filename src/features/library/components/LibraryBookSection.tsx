import { CSSProperties, ReactNode } from "react";
import type { Book } from "../types";

const BOOK_GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 28,
} as const;

const SECTION_TITLE_STYLE = {
  fontFamily: "var(--font-sans)",
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 24,
  color: "var(--text-primary)",
} as const;

type Props = {
  title: string;
  books: Book[];
  wrapperStyle?: CSSProperties;
  renderCard: (book: Book, index: number) => ReactNode;
};

export default function LibraryBookSection({ title, books, wrapperStyle, renderCard }: Props) {
  if (books.length === 0) return null;

  return (
    <div style={wrapperStyle}>
      <h2 style={SECTION_TITLE_STYLE}>{title}</h2>
      <div style={BOOK_GRID_STYLE}>{books.map((book, index) => renderCard(book, index))}</div>
    </div>
  );
}
