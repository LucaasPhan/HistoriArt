import { CSSProperties, ReactNode } from "react";
import type { Book } from "../types";
import { BOOK_GRID_STYLE, SECTION_TITLE_STYLE } from "../const";

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
