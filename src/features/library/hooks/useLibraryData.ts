import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Book, BooksResponse } from "../types";

async function fetchBooks(): Promise<BooksResponse> {
  const res = await fetch("/api/books");
  if (!res.ok) throw new Error("Failed to load books");
  return (await res.json()) as BooksResponse;
}

export function useLibraryData() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [lastPages, setLastPages] = useState<Record<string, number>>({});

  const {
    data: booksData,
    isPending: loading,
    isError: isBooksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    retry: 3,
  });

  const books = useMemo(() => booksData?.books ?? [], [booksData?.books]);

  const hasProcessingBooks = useMemo(
    () => books.some((b) => b.fileName && b.totalChunks === 0),
    [books],
  );

  useQuery({
    queryKey: ["books-poll"],
    queryFn: async (): Promise<BooksResponse> => {
      const data = await fetchBooks();
      queryClient.setQueryData(["books"], data);
      return data;
    },
    enabled: hasProcessingBooks,
    refetchInterval: hasProcessingBooks ? 5000 : false,
  });

  const isProcessing = useCallback(
    (book: Book) => !!book.fileName && (book.totalChunks === 0 || book.totalChunks === undefined),
    [],
  );

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/books/favorites");
      if (!res.ok) return { favoriteBookIds: [] };
      return (await res.json()) as { favoriteBookIds: string[] };
    },
    enabled: !!session?.user,
  });

  const favoriteIds = useMemo(() => new Set(favoritesData?.favoriteBookIds ?? []), [favoritesData]);

  const { data: progressData } = useQuery({
    queryKey: ["reading-progress"],
    queryFn: async () => {
      const res = await fetch("/api/reading-progress");
      if (!res.ok) return { progress: {} };
      return (await res.json()) as { progress: Record<string, number> };
    },
    enabled: !!session?.user,
  });

  // Calculate local book progression vs server progress
  useEffect(() => {
    if (books.length === 0) return;
    const pages: Record<string, number> = {};

    books.forEach((b) => {
      const saved = localStorage.getItem(`last_page_${b.id}`);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val > 1 && val < b.totalPages) pages[b.id] = val;
      }
    });

    if (progressData?.progress) {
      books.forEach((b) => {
        const val = progressData.progress[b.id];
        if (val && val > 1 && val < b.totalPages) pages[b.id] = val;
      });
    }

    setLastPages(pages);
  }, [books, progressData]);

  const continueBooks = useMemo(
    () => (session?.user ? books.filter((b) => lastPages[b.id]) : []),
    [books, lastPages, session?.user],
  );

  return {
    books,
    continueBooks,
    favoriteIds,
    lastPages,
    isProcessing,
    loading,
    isBooksError,
    session,
    isAdmin: session?.user?.role === "admin",
  };
}
