import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Book } from "../types";

export function useLibraryMutations(options?: {
  onDeleteAuthError?: (book: Book) => void;
  onEditAuthError?: (bookId: string) => void;
}) {
  const queryClient = useQueryClient();

  const toggleFavMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const res = await fetch("/api/books/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return (await res.json()) as { favorited: boolean };
    },
    onMutate: async (bookId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const prev = queryClient.getQueryData<{ favoriteBookIds: string[] }>(["favorites"]);
      queryClient.setQueryData(["favorites"], (old: { favoriteBookIds: string[] } | undefined) => {
        const ids = old?.favoriteBookIds ?? [];
        if (ids.includes(bookId)) {
          return { favoriteBookIds: ids.filter((id) => id !== bookId) };
        }
        return { favoriteBookIds: [...ids, bookId] };
      });
      return { prev };
    },
    onError: (_err, _bookId, context) => {
      if (context?.prev) queryClient.setQueryData(["favorites"], context.prev);
      toast.error("Failed to update favorite");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload: { bookId: string; pin: string }) => {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      return data;
    },
    onSuccess: () => {
      toast.success("Book deleted from your library.");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error, variables) => {
      if (err.message.toLowerCase().includes("pin") && options?.onDeleteAuthError) {
        // Find the book locally or handle it higher up
        const booksData = queryClient.getQueryData<{ books: Book[] }>(["books"]);
        const book = booksData?.books.find((b) => b.id === variables.bookId);
        if (book) {
          options.onDeleteAuthError(book);
        }
      }
      toast.error(err.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: {
      bookId: string;
      newBookId?: string;
      title: string;
      author: string;
      description: string;
      coverUrl: string | null;
      pin: string;
    }) => {
      const res = await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update book");
      return data;
    },
    onSuccess: () => {
      toast.success("Book updated.");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error, variables) => {
      if (err.message.toLowerCase().includes("pin") && options?.onEditAuthError) {
        options.onEditAuthError(variables.bookId);
      }
      toast.error(err.message);
    },
  });

  return {
    toggleFavMutation,
    deleteMutation,
    editMutation,
  };
}
