export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Multimedia annotation attached to a passage
export interface MediaAnnotation {
  id: string;
  bookId: string;
  chapterId?: string;
  pageNumber?: number;
  passageSelector?: string;
  passageText?: string;
  mediaType: "image" | "video" | "audio" | "annotation";
  mediaUrl?: string;
  caption?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  sources?: string[];
  chatSource?: "media" | "selection" | "highlight";
}

export interface Highlight {
  id: string;
  bookId: string;
  userId: string;
  text: string;
  color: string;
  pageNumber: number;
  createdAt: string;
}

export type UseReaderControllerArgs = {
  bookId: string;
};

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  coverGradient: [string, string];
  era: string;
  totalPages: number;
  estimatedReadTime: number | null;
  isSample: boolean;
}

export type ChatMediaContext = {
  id: string;
  mediaType: MediaAnnotation["mediaType"];
  passageText?: string;
  caption?: string;
  mediaUrl?: string;
  sources?: string[];
};
