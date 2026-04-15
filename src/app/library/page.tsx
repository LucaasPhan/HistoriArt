"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import PinVerifyModal from "@/features/read/[bookId]/components/PinVerifyModal";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BookCard from "@/features/library/components/BookCard";
import DeleteBookDialog from "@/features/library/components/DeleteBookDialog";
import EditBookDialog from "@/features/library/components/EditBookDialog";
import LibraryBookSection from "@/features/library/components/LibraryBookSection";
import type { Book, BooksResponse, EditBookForm } from "@/features/library/types";

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

async function fetchBooks(): Promise<BooksResponse> {
  const res = await fetch("/api/books");
  if (!res.ok) throw new Error("Failed to load books");
  return (await res.json()) as BooksResponse;
}

export default function LibraryPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [lastPages, setLastPages] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [editTarget, setEditTarget] = useState<Book | null>(null);
  const [pendingEditTarget, setPendingEditTarget] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState<EditBookForm>({
    title: "",
    author: "",
    description: "",
    coverUrl: "",
  });
  const [pinVerified, setPinVerified] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const isAdmin = session?.user?.role === "admin";

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
    mutationFn: async (bookId: string) => {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      return data;
    },
    onSuccess: () => {
      toast.success("Book deleted from your library.");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteTarget(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: {
      bookId: string;
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
      setEditTarget(null);
    },
    onError: (err: Error) => {
      if (err.message.toLowerCase().includes("pin")) {
        setPinVerified(false);
        setVerifiedPin("");
        setShowPinModal(true);
      }
      toast.error(err.message);
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ["reading-progress"],
    queryFn: async () => {
      const res = await fetch("/api/reading-progress");
      if (!res.ok) return { progress: {} };
      return (await res.json()) as { progress: Record<string, number> };
    },
    enabled: !!session?.user,
  });

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
  const uploadedBooks = useMemo(
    () => books.filter((b) => b.fileName && String(b.fileName).toLowerCase().endsWith(".pdf")),
    [books],
  );
  const catalogBooks = useMemo(
    () => books.filter((b) => !b.fileName || !String(b.fileName).toLowerCase().endsWith(".pdf")),
    [books],
  );

  const copyLink = useCallback((book: Book) => {
    const url = `${window.location.origin}/read/${book.id}?page=1`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }, []);

  const copyTitle = useCallback((book: Book) => {
    navigator.clipboard.writeText(`${book.title} — ${book.author}`);
    toast.success("Title copied to clipboard!");
  }, []);

  const handleToggleFavorite = useCallback(
    (book: Book) => {
      if (!session?.user) {
        toast.error("Sign in to favorite books.");
        return;
      }
      toggleFavMutation.mutate(book.id);
    },
    [session?.user, toggleFavMutation],
  );

  const openEditDialog = useCallback(
    (book: Book) => {
      if (!pinVerified || !verifiedPin) {
        setPendingEditTarget(book);
        setShowPinModal(true);
        return;
      }

      setEditTarget(book);
      setEditForm({
        title: book.title,
        author: book.author,
        description: book.description || "",
        coverUrl: book.coverUrl || "",
      });
    },
    [pinVerified, verifiedPin],
  );

  const handleEditFieldChange = useCallback((field: keyof EditBookForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCoverFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setEditForm((prev) => ({ ...prev, coverUrl: data.url }));
      toast.success("Cover uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editTarget) return;
    if (!pinVerified || !verifiedPin) {
      setShowPinModal(true);
      return;
    }
    if (!editForm.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!editForm.author.trim()) {
      toast.error("Author is required.");
      return;
    }

    editMutation.mutate({
      bookId: editTarget.id,
      title: editForm.title.trim(),
      author: editForm.author.trim(),
      description: editForm.description.trim(),
      coverUrl: editForm.coverUrl.trim() || null,
      pin: verifiedPin,
    });
  }, [editForm, editMutation, editTarget, pinVerified, verifiedPin]);

  const handlePinVerified = useCallback(
    (pin: string) => {
      setPinVerified(true);
      setVerifiedPin(pin);
      setShowPinModal(false);

      if (pendingEditTarget) {
        setEditTarget(pendingEditTarget);
        setEditForm({
          title: pendingEditTarget.title,
          author: pendingEditTarget.author,
          description: pendingEditTarget.description || "",
          coverUrl: pendingEditTarget.coverUrl || "",
        });
        setPendingEditTarget(null);
      }
    },
    [pendingEditTarget],
  );

  const renderCard = useCallback(
    (book: Book, index: number, isContinue: boolean) => {
      const href = isContinue ? `/read/${book.id}?page=${lastPages[book.id]}` : `/read/${book.id}?page=1`;

      return (
        <BookCard
          key={isContinue ? `continue-${book.id}` : book.id}
          book={book}
          index={index}
          isContinue={isContinue}
          continuePage={isContinue ? lastPages[book.id] : undefined}
          href={href}
          isFavorite={favoriteIds.has(book.id)}
          isProcessing={isProcessing(book)}
          isAdmin={isAdmin}
          hoveredCardId={hoveredBook}
          onHoverChange={setHoveredBook}
          onToggleFavorite={handleToggleFavorite}
          onCopyLink={copyLink}
          onCopyTitle={copyTitle}
          onOpenEdit={openEditDialog}
        />
      );
    },
    [copyLink, copyTitle, favoriteIds, handleToggleFavorite, hoveredBook, isAdmin, isProcessing, lastPages, openEditDialog],
  );

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          padding: "100px 32px 80px",
          maxWidth: 1300,
          margin: "0 auto",
          background: "var(--bg-primary)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: 56,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 700,
                marginBottom: 8,
                color: "var(--text-primary)",
              }}
            >
              Thư viện
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 0 }}>
              {books.length} đầu sách đang chờ bạn
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}></div>
        </motion.div>

        {loading ? (
          <div style={BOOK_GRID_STYLE}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: 380,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-card)",
                }}
              />
            ))}
          </div>
        ) : isBooksError ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-tertiary)",
            }}
          >
            Không thể tải thư viện. Vui lòng tải lại trang.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            <LibraryBookSection
              title="Đang đọc"
              books={continueBooks}
              wrapperStyle={{ marginTop: -16 }}
              renderCard={(book, index) => renderCard(book, index, true)}
            />

            <LibraryBookSection
              title="Sách tải lên"
              books={uploadedBooks}
              renderCard={(book, index) => renderCard(book, index, false)}
            />

            <div>
              {(continueBooks.length > 0 || uploadedBooks.length > 0) && (
                <h2 style={SECTION_TITLE_STYLE}>Tủ sách lịch sử</h2>
              )}
              <div style={BOOK_GRID_STYLE}>
                {catalogBooks.map((book, index) => renderCard(book, index, false))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteBookDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />

      <EditBookDialog
        open={!!editTarget}
        form={editForm}
        isUploadingCover={isUploadingCover}
        isSaving={editMutation.isPending}
        coverFileInputRef={coverFileInputRef}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onFieldChange={handleEditFieldChange}
        onUploadClick={() => coverFileInputRef.current?.click()}
        onRemoveCover={() => setEditForm((prev) => ({ ...prev, coverUrl: "" }))}
        onFileChange={handleCoverFileChange}
        onSave={handleSaveEdit}
      />

      <PinVerifyModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingEditTarget(null);
        }}
        onVerified={handlePinVerified}
      />

      <PageMountSignaler />
    </>
  );
}