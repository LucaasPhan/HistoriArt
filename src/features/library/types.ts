import { ChangeEvent, RefObject } from "react";

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

export type EditBookDialogProps = {
  open: boolean;
  form: EditBookForm;
  isUploadingCover: boolean;
  isSaving: boolean;
  coverFileInputRef: RefObject<HTMLInputElement | null>;
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: keyof EditBookForm, value: string) => void;
  onUploadClick: () => void;
  onRemoveCover: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export type DeleteBookDialogProps = {
  open: boolean;
  title?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export type BookCardProps = {
  book: Book;
  index: number;
  isContinue: boolean;
  continuePage?: number;
  href: string;
  isFavorite: boolean;
  isProcessing: boolean;
  isAdmin: boolean;
  hoveredCardId: string | null;
  onHoverChange: (cardId: string | null) => void;
  onToggleFavorite: (book: Book) => void;
  onCopyLink: (book: Book) => void;
  onCopyTitle: (book: Book) => void;
  onOpenEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
};