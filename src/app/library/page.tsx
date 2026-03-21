"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Star, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverGradient: [string, string];
  totalPages: number;
}

export default function LibraryPage() {
  const { data: session } = authClient.useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
   <>
    <div
      style={{
        minHeight: "100vh",
        padding: "100px 24px 60px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 48 }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Your Library
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
          Choose a book to read with your AI companion
        </p>
      </motion.div>

      {/* Books Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {[1, 2].map((i) => (
            <div
              key={i}
              className="shimmer"
              style={{
                height: 420,
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 28,
          }}
        >
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <TransitionLink href={`/read/${book.id}`} className="no-underline">
                <div className="book-card">
                  {/* Cover */}
                  <div
                    style={{
                      height: 240,
                      background: `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 32,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Decorative elements */}
                    <div
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    />

                    <BookOpen size={48} color="rgba(255,255,255,0.9)" style={{ marginBottom: 16 }} />
                    <h2
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 22,
                        fontWeight: 600,
                        color: "white",
                        textAlign: "center",
                        textShadow: "0 2px 12px rgba(0,0,0,0.2)",
                        lineHeight: 1.3,
                      }}
                    >
                      {book.title}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 14,
                        marginTop: 8,
                      }}
                    >
                      {book.author}
                    </p>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "24px 24px 28px" }}>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        lineHeight: 1.7,
                        marginBottom: 20,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {book.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          fontSize: 13,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={14} />
                          {book.totalPages} pages
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star size={14} fill="var(--accent-primary)" stroke="var(--accent-primary)" />
                          4.8
                        </span>
                      </div>

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
                        Read Now →
                      </span>
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
