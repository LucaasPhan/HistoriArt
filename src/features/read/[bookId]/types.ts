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
