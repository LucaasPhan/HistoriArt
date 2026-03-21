"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  TrendingUp,
  BookOpen,
  Loader2,
  Plus,
  Check,
  AlertCircle,
  Library,
  X,
} from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchResult {
  gutenbergId: number;
  title: string;
  author: string;
  subjects: string[];
  coverUrl: string | null;
  downloadCount: number;
  hasText: boolean;
}

interface SearchResponse {
  books: SearchResult[];
  totalCount: number;
  hasMore: boolean;
  nextPage: string | null;
}

type AddingState = "idle" | "fetching" | "saving" | "done" | "error";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [addingBooks, setAddingBooks] = useState<
    Record<number, { state: AddingState; bookId?: string }>
  >({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const hasSearched = debouncedQuery.trim().length > 0;

  // Sync library books with addingBooks state to show "Added!" or "Open in Reader"
  const { data: libraryData } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to load library");
      return await res.json();
    },
  });

  useEffect(() => {
    if (libraryData?.books) {
      const addedStates: Record<number, { state: AddingState; bookId?: string }> = {};
      libraryData.books.forEach((book: any) => {
        if (book.fileName && book.fileName.startsWith("gutenberg-")) {
          const gutenbergId = parseInt(book.fileName.split("-")[1]);
          if (!isNaN(gutenbergId)) {
            addedStates[gutenbergId] = { state: "done", bookId: book.id };
          }
        }
      });
      setAddingBooks((prev) => ({ ...prev, ...addedStates }));
    }
  }, [libraryData]);

  const {
    data: trendingData,
    isPending: trendingLoading,
    isError: isTrendingError,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
    isFetchingNextPage: isFetchingNextTrending,
  } = useInfiniteQuery<SearchResponse>({
    queryKey: ["search", "trending"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/search?q=&page=${pageParam}`);
      if (!res.ok) throw new Error("Failed to load trending books");
      return (await res.json()) as SearchResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchData,
    isPending: searchLoading,
    isError: isSearchError,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
  } = useInfiniteQuery<SearchResponse>({
    queryKey: ["search", "results", debouncedQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const q = debouncedQuery.trim();
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pageParam}`);
      if (!res.ok) throw new Error("Failed to load search results");
      return (await res.json()) as SearchResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: hasSearched,
    staleTime: 1000 * 10,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (hasSearched && hasNextSearch && !isFetchingNextSearch) {
            fetchNextSearch();
          } else if (!hasSearched && hasNextTrending && !isFetchingNextTrending) {
            fetchNextTrending();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    hasSearched,
    hasNextSearch,
    isFetchingNextSearch,
    fetchNextSearch,
    hasNextTrending,
    isFetchingNextTrending,
    fetchNextTrending,
  ]);

  const results = searchData?.pages.flatMap((page) => page.books) ?? [];
  const trending = trendingData?.pages.flatMap((page) => page.books) ?? [];

  const scheduleDebouncedQuery = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const next = value.trim();
    if (!next) {
      setDebouncedQuery("");
      return;
    }

    debounceRef.current = setTimeout(() => setDebouncedQuery(next), 400);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    scheduleDebouncedQuery(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDebouncedQuery(searchQuery.trim());
  };

  // Add book to library
  const addToLibrary = async (book: SearchResult) => {
    setAddingBooks((prev) => ({
      ...prev,
      [book.gutenbergId]: { state: "fetching" },
    }));

    try {
      setAddingBooks((prev) => ({
        ...prev,
        [book.gutenbergId]: { state: "saving" },
      }));

      // Directly save to library - the backend will fetch the text!
      const saveRes = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          description: book.subjects.join(", "),
          totalPages: 0, // Server will resolve this
          gutenbergId: book.gutenbergId,
        }),
      });

      const saveData = await saveRes.json();

      if (saveData.alreadyExists) {
        setAddingBooks((prev) => ({
          ...prev,
          [book.gutenbergId]: { state: "done", bookId: saveData.id },
        }));
      } else {
        setAddingBooks((prev) => ({
          ...prev,
          [book.gutenbergId]: { state: "done", bookId: saveData.id },
        }));
      }
    } catch (err) {
      console.error("Error adding book:", err);
      setAddingBooks((prev) => ({
        ...prev,
        [book.gutenbergId]: { state: "error" },
      }));
    }
  };

  const getButtonContent = (book: SearchResult) => {
    const status = addingBooks[book.gutenbergId];
    if (!status || status.state === "idle") {
      return (
        <>
          <Plus size={14} />
          Add to Library
        </>
      );
    }
    if (status.state === "fetching") {
      return (
        <>
          <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
          Fetching...
        </>
      );
    }
    if (status.state === "saving") {
      return (
        <>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          Saving...
        </>
      );
    }
    if (status.state === "done") {
      return (
        <>
          <Check size={14} />
          Added!
        </>
      );
    }
    if (status.state === "error") {
      return (
        <>
          <AlertCircle size={14} />
          Retry
        </>
      );
    }
  };

  const displayBooks = hasSearched ? results : trending;
  const showSection = hasSearched ? "Search Results" : "Popular Classics";
  const SectionIcon = hasSearched ? SearchIcon : TrendingUp;

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding: "100px 24px 60px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 5vw, 48px)",
              marginBottom: 8,
            }}
          >
            Discover <span className="gradient-text">&</span> Search
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            Explore 76,000+ classic books from Project Gutenberg. Search by
            title or author.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 40,
            background: "var(--bg-card)",
            padding: "12px 20px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            alignItems: "center",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <SearchIcon
            size={20}
            style={{ color: "var(--text-tertiary)", flex: "0 0 auto" }}
          />
          <input
            type="text"
            placeholder="Search classic books, authors..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              background: "transparent",
              fontSize: 16,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDebouncedQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            disabled={hasSearched && searchLoading}
            style={{
              padding: "10px 24px",
              background: "var(--accent-gradient)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            {hasSearched && searchLoading ? (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              "Search"
            )}
          </button>
        </motion.form>

        {/* Results Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <SectionIcon size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>{showSection}</h2>
            {hasSearched && results.length > 0 && (
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  marginLeft: 8,
                }}
              >
                ({results.length} results)
              </span>
            )}
          </div>

          {/* Loading State */}
          {(hasSearched ? searchLoading : trendingLoading) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="shimmer"
                  style={{
                    height: 320,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-card)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {hasSearched && !searchLoading && !isSearchError && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-tertiary)",
              }}
            >
              <BookOpen
                size={48}
                style={{ marginBottom: 16, opacity: 0.4 }}
              />
              <p style={{ fontSize: 18, marginBottom: 8 }}>
                No books found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p style={{ fontSize: 14 }}>
                Try searching for classic titles like &ldquo;Pride and
                Prejudice&rdquo; or &ldquo;Moby Dick&rdquo;
              </p>
            </motion.div>
          )}

          {/* Book Grid */}
          {!(hasSearched ? searchLoading : trendingLoading) && displayBooks.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              <AnimatePresence mode="wait">
                {displayBooks.map((book, i) => (
                  <motion.div
                    key={book.gutenbergId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      y: -4,
                      boxShadow: "var(--shadow-glow)",
                    }}
                  >
                    {/* Cover */}
                    <div
                      style={{
                        height: 200,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
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
                        <BookOpen
                          size={48}
                          color="rgba(255,255,255,0.6)"
                        />
                      )}
                      {/* Download count badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "var(--radius-full)",
                          padding: "4px 10px",
                          fontSize: 11,
                          color: "white",
                          fontWeight: 500,
                        }}
                      >
                        {book.downloadCount.toLocaleString()} reads
                      </div>
                    </div>

                    {/* Info */}
                    <div
                      style={{
                        padding: "16px 18px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          marginBottom: 4,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-serif)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.3,
                        }}
                      >
                        {book.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginBottom: 8,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.author}
                      </p>

                      {/* Subjects */}
                      {book.subjects.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            marginBottom: 12,
                          }}
                        >
                          {book.subjects.slice(0, 2).map((s, si) => (
                            <span
                              key={si}
                              style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: "var(--radius-full)",
                                background: "var(--bg-tertiary)",
                                color: "var(--text-tertiary)",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 120,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action */}
                      <div style={{ marginTop: "auto" }}>
                        {addingBooks[book.gutenbergId]?.state === "done" ? (
                          <button
                            onClick={() =>
                              router.push(
                                `/read/${addingBooks[book.gutenbergId].bookId}`
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              background: "var(--bg-tertiary)",
                              color: "var(--accent-primary)",
                              border: "1px solid var(--accent-primary)",
                              borderRadius: "var(--radius-md)",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              transition: "0.3s ease",
                            }}
                          >
                            <Library size={14} />
                            Open in Reader
                          </button>
                        ) : (
                          <button
                            onClick={() => addToLibrary(book)}
                            disabled={
                              addingBooks[book.gutenbergId]?.state ===
                                "fetching" ||
                              addingBooks[book.gutenbergId]?.state ===
                                "saving"
                            }
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              background:
                                addingBooks[book.gutenbergId]?.state ===
                                "error"
                                  ? "#ef4444"
                                  : "var(--accent-gradient)",
                              color: "white",
                              border: "none",
                              borderRadius: "var(--radius-md)",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor:
                                addingBooks[book.gutenbergId]?.state ===
                                  "fetching" ||
                                addingBooks[book.gutenbergId]?.state ===
                                  "saving"
                                  ? "wait"
                                  : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              transition: "0.3s ease",
                              opacity:
                                addingBooks[book.gutenbergId]?.state ===
                                  "fetching" ||
                                addingBooks[book.gutenbergId]?.state ===
                                  "saving"
                                  ? 0.7
                                  : 1,
                            }}
                          >
                            {getButtonContent(book)}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Infinite Scroll Observer Target */}
          {((hasSearched ? hasNextSearch : hasNextTrending) && displayBooks.length > 0) && (
            <div
              ref={observerTarget}
              style={{
                width: "100%",
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 32,
              }}
            >
              {(isFetchingNextSearch || isFetchingNextTrending) && (
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--text-tertiary)" }} />
              )}
            </div>
          )}
        </div>

        {/* Quick Search Suggestions */}
        {!hasSearched && !trendingLoading && !isTrendingError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 48, textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--text-tertiary)",
                marginBottom: 12,
              }}
            >
              Try searching for:
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {[
                "Shakespeare",
                "Jane Austen",
                "Mark Twain",
                "Frankenstein",
                "Dracula",
                "Moby Dick",
                "Sherlock Holmes",
                "Alice in Wonderland",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    setDebouncedQuery(suggestion);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "0.2s ease",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--accent-primary)";
                    e.currentTarget.style.color = "var(--accent-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      <PageMountSignaler />

      {/* Spin animation keyframes */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
