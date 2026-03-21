"use client";

import { useState } from "react";
import { Clock, Star, Plus, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string | null;
  coverGradient: [string, string];
  totalPages: number;
}

interface BooksResponse {
  books: Book[];
}

export default function LibraryPage() {
  const { data: session } = authClient.useSession();
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

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

  const books = booksData?.books ?? [];

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
        style={{ marginBottom: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 700,
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            Your Library
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 0 }}>
            {books.length} books waiting for you
          </p>
        </div>
        <button style={{ padding: "12px 24px", background: "var(--accent-gradient)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={18} />
          Add Book
        </button>
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
          Failed to load your library. Please refresh.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 28,
          }}
        >
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onMouseEnter={() => setHoveredBook(book.id)}
              onMouseLeave={() => setHoveredBook(null)}
              whileHover={{ y: -8 }}
              style={{ height: "100%" }}
            >
              <TransitionLink href={`/read/${book.id}`} className="no-underline">
                <div className="book-card" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "var(--radius-lg)", background: "var(--bg-card)", boxShadow: "var(--shadow-card)", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", position: "relative" }}>
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
                    animate={{ scale: hoveredBook === book.id ? 1.05 : 1 }}
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
                            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 70%)",
                          }}
                        />
                        <Sparkles size={40} color="rgba(255,255,255,0.85)" />
                      </>
                    )}
                  </motion.div>

                  {/* Info */}
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-serif)",
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
                          p: ({ node, ...props }) => <span {...props} />
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
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={12} />
                          {book.totalPages}p
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Star size={12} fill="var(--accent-primary)" stroke="var(--accent-primary)" />
                          4.8
                        </span>
                      </div>

                      <motion.span
                        style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-primary)" }}
                        animate={{ x: hoveredBook === book.id ? 4 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </div>
              </TransitionLink>
            </motion.div>
          ))}
          {!session && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: books.length * 0.15 }}
            >
              <TransitionLink href="/login" className="no-underline">
                <div className="book-card" style={{ height: '100%', minHeight: 420, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 32 }}>
                  <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      border: '1px solid var(--border)'
                  }}>
                    <Plus size={32} color="var(--text-secondary)" />
                  </div>
                  <h2 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textAlign: "center",
                    marginBottom: 8
                  }}>
                    Add another book
                  </h2>
                  <p style={{
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    textAlign: "center"
                  }}>
                    Signup to add your own book!
                  </p>
                </div>
              </TransitionLink>
            </motion.div>
          )}
        </div>
      )}
    </div>
    <PageMountSignaler/>
   </>
  );
}
