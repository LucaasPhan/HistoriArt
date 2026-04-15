export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string | null;
  coverGradient: [string, string];
  totalPages: number;
  totalChunks?: number;
  estimatedReadTime?: number;
  fileName?: string | null;
}

export interface BooksResponse {
  books: Book[];
}

export interface EditBookForm {
  bookId: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
}
