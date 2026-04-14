"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Clipboard,
  Clock,
  ExternalLink,
  Heart,
  Link2,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Book {
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

interface BooksResponse {
  books: Book[];
}

export default function LibraryPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [lastPages, setLastPages] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const {
    data: booksData,
    isPending: loading,
    isError: isBooksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: async (): Promise<BooksResponse> => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to load books");
      return (await res.json()) as BooksResponse;
    },
    retry: 3,
  });

  const books = useMemo(() => booksData?.books ?? [], [booksData?.books]);

  // Auto-poll every 5s while any book is still processing
  const hasProcessingBooks = useMemo(
    () => books.some((b) => b.fileName && b.totalChunks === 0),
    [books],
  );

  useQuery({
    queryKey: ["books-poll"],
    queryFn: async (): Promise<BooksResponse> => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("poll failed");
      const data = (await res.json()) as BooksResponse;
      // Sync the main cache
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

  // ── Favorites ──────────────────────────────────────────────────────────
  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/books/favorites");
      if (!res.ok) return { favoriteBookIds: [] };
      return (await res.json()) as { favoriteBookIds: string[] };
    },
    enabled: !!session?.user,
  });

  const favoriteIds = new Set(favoritesData?.favoriteBookIds ?? []);

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

  // ── Delete book ────────────────────────────────────────────────────────
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

  // ── Reading Progress ───────────────────────────────────────────────────
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

    // First apply local storage backup
    books.forEach((b) => {
      const saved = localStorage.getItem(`last_page_${b.id}`);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val > 1 && val < b.totalPages) pages[b.id] = val;
      }
    });

    // Override with DB progress if available
    if (progressData?.progress) {
      books.forEach((b) => {
        const val = progressData.progress[b.id];
        if (val && val > 1 && val < b.totalPages) pages[b.id] = val;
      });
    }

    setLastPages(pages);
  }, [books, progressData]);

  const continueBooks = session?.user ? books.filter((b) => lastPages[b.id]) : [];
  const uploadedBooks = books.filter(
    (b) => b.fileName && String(b.fileName).toLowerCase().endsWith(".pdf"),
  );
  const catalogBooks = books.filter(
    (b) => !b.fileName || !String(b.fileName).toLowerCase().endsWith(".pdf"),
  );
  // ── Helpers ────────────────────────────────────────────────────────────
  const isSampleBook = useCallback((book: Book) => {
    return !book.fileName;
  }, []);

  const copyLink = useCallback((book: Book) => {
    const url = `${window.location.origin}/read/${book.id}?page=1`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }, []);

  const copyTitle = useCallback((book: Book) => {
    navigator.clipboard.writeText(`${book.title} — ${book.author}`);
    toast.success("Title copied to clipboard!");
  }, []);

  const renderBookCard = (book: Book, i: number, isContinue: boolean) => {
    const cardId = isContinue ? `continue-${book.id}` : book.id;
    const href = isContinue
      ? `/read/${book.id}?page=${lastPages[book.id]}`
      : `/read/${book.id}?page=1`;
    const isFav = favoriteIds.has(book.id);
    const processing = isProcessing(book);

    return (
      <ContextMenu key={cardId}>
        <ContextMenuTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onMouseEnter={() => setHoveredBook(cardId)}
            onMouseLeave={() => setHoveredBook(null)}
            whileHover={{ y: -8 }}
            style={{ height: "100%" }}
          >
            <TransitionLink
              href={processing ? "#" : href}
              className="no-underline"
              onClick={processing ? (e: React.MouseEvent) => e.preventDefault() : undefined}
              style={processing ? { cursor: "default" } : undefined}
            >
              <div
                className="book-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-card)",
                  boxShadow: "var(--shadow-card)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  position: "relative",
                }}
              >
                {/* Favorite badge */}
                <AnimatePresence>
                  {isFav && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={13} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cover */}
                <motion.div
                  style={{
                    height: 180,
                    background: book.coverUrl
                      ? "var(--bg-tertiary)"
                      : `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  animate={{ scale: hoveredBook === cardId ? 1.05 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="260px"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 70%)",
                        }}
                      />
                      <Sparkles size={40} color="rgba(255,255,255,0.85)" />
                    </>
                  )}

                  {/* Processing overlay */}
                  {processing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        zIndex: 5,
                      }}
                    >
                      <Loader2
                        size={28}
                        color="white"
                        style={{ animation: "spin 1.2s linear infinite" }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                        }}
                      >
                        Downloading…
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Info */}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {book.title}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      marginBottom: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {book.author}
                  </p>

                  <div
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      marginBottom: 16,
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        p: (props) => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                          const { node, ...rest } = props as any;
                          return <span {...rest} />;
                        },
                      }}
                    >
                      {book.description.replace(/--/g, "—")}
                    </ReactMarkdown>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {processing ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "var(--accent-primary)",
                            fontWeight: 600,
                          }}
                        >
                          <Loader2 size={12} style={{ animation: "spin 1.2s linear infinite" }} />
                          Processing…
                        </span>
                      ) : (
                        <>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={12} />
                            {book.estimatedReadTime || book.totalPages}p
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Star
                              size={12}
                              fill="var(--accent-primary)"
                              stroke="var(--accent-primary)"
                            />
                            4.8
                          </span>
                        </>
                      )}
                    </div>

                    {isContinue ? (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--accent-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Page {lastPages[book.id]}
                      </span>
                    ) : (
                      <motion.span
                        style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-primary)" }}
                        animate={{ x: hoveredBook === cardId ? 4 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </TransitionLink>
          </motion.div>
        </ContextMenuTrigger>

        {/* ── Claude.ai-inspired Context Menu ── */}
        <ContextMenuContent
          className="w-56 overflow-hidden p-0"
          style={{
            padding: 10,
            gap: 10,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Book title header */}
          <ContextMenuLabel
            className="px-3 pt-3"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-sans)",
              padding: "5px 10px 5px 10px",
            }}
          >
            {book.title.length > 28 ? book.title.slice(0, 28) + "…" : book.title}
          </ContextMenuLabel>

          <div style={{ padding: "2px 4px 4px" }}>
            {/* Open Book */}
            <ContextMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
              style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
              onSelect={() => (window.location.href = href)}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span>Open Book</span>
            </ContextMenuItem>
            <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />
            {/* Open in New Tab */}
            <ContextMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
              style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
              onSelect={() => window.open(href, "_blank")}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ExternalLink size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span>Open in New Tab</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />

            {/* Favorite */}
            <ContextMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
              style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
              onSelect={() => {
                if (!session?.user) {
                  toast.error("Sign in to favorite books.");
                  return;
                }
                toggleFavMutation.mutate(book.id);
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s ease",
                }}
              >
                <Heart
                  size={14}
                  fill={isFav ? "var(--accent-primary)" : "none"}
                  style={{
                    color: isFav ? "var(--accent-primary)" : "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                />
              </div>
              <span>{isFav ? "Unfavorite" : "Favorite"}</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />

            {/* Copy Link */}
            <ContextMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
              style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
              onSelect={() => copyLink(book)}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Link2 size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span>Copy Link</span>
            </ContextMenuItem>
            <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />
            {/* Copy Title */}
            <ContextMenuItem
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
              style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
              onSelect={() => copyTitle(book)}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Clipboard size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span>Copy Title & Author</span>
            </ContextMenuItem>

            {/* Delete (DB books only) */}
            {/* {!isSampleBook(book) && (
              <>
                <ContextMenuSeparator
                  className="my-1"
                  style={{ background: "var(--border-subtle)" }}
                />
                <ContextMenuItem
                  className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    color: "#ef4444",
                  }}
                  onSelect={() => setDeleteTarget(book)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} style={{ color: "#ef4444" }} />
                  </div>
                  <span>Delete from Library</span>
                </ContextMenuItem>
              </>
            )} */}
          </div>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

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
        {/* Header with Action */}
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

        {/* Books Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 28,
            }}
          >
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
            {/* Continue Reading Section */}
            {continueBooks.length > 0 && (
              <div style={{ marginTop: -16 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: "var(--text-primary)",
                  }}
                >
                  Đang đọc
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 28,
                  }}
                >
                  {continueBooks.map((book, i) => renderBookCard(book, i, true))}
                </div>
              </div>
            )}

            {/* Uploaded Books Section */}
            {uploadedBooks.length > 0 && (
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: "var(--text-primary)",
                  }}
                >
                  Sách tải lên
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 28,
                  }}
                >
                  {uploadedBooks.map((book, i) => renderBookCard(book, i, false))}
                </div>
              </div>
            )}

            {/* Catalog Books Section */}
            <div>
              {(continueBooks.length > 0 || uploadedBooks.length > 0) && (
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 24,
                    color: "var(--text-primary)",
                  }}
                >
                  Tủ sách lịch sử
                </h2>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 28,
                }}
              >
                {catalogBooks.map((book, i) => renderBookCard(book, i, false))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Premium Delete Confirmation Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
            padding: 0,
            overflow: "hidden",
            maxWidth: 420,
          }}
        >
          {/* Accent danger bar */}
          <div
            style={{
              height: 3,
              background: "linear-gradient(90deg, #ef4444, #f97316)",
              borderRadius: "16px 16px 0 0",
            }}
          />

          <div style={{ padding: "28px 28px 24px" }}>
            <AlertDialogHeader className="gap-3">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <AlertTriangle size={22} style={{ color: "#ef4444" }} />
              </div>

              <AlertDialogTitle
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                }}
              >
                Delete &ldquo;{deleteTarget?.title}&rdquo;?
              </AlertDialogTitle>

              <AlertDialogDescription
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Thao tác này sẽ xóa vĩnh viễn sách và toàn bộ dữ liệu liên quan — bao gồm ghi chú và
                tiến trình đọc. Không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter style={{ marginTop: 24, gap: 10 }}>
              <AlertDialogCancel
                style={{
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={() => {
                  if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                }}
                style={{
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <PageMountSignaler />
    </>
  );
}
