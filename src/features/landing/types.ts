export type BookPreview = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string | null;
  coverGradient: [string, string];
  era: string;
  totalPages: number;
  estimatedReadTime: number;
};
