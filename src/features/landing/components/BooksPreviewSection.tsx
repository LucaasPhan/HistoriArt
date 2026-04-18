"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { motion } from "motion/react";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BookPreview } from "../types";

export default function BooksPreviewSection() {
  const [books, setBooks] = useState<BookPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books || []);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      style={{
        padding: "100px 24px",
        background: "var(--bg-secondary)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 64,
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 42px)", fontWeight: 800, marginBottom: 16 }}>
              {t("books.heading")} <span className="gradient-text">{t("books.headingAccent")}</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-secondary)" }}>
              {t("books.subtitle")}
            </p>
          </div>
          <TransitionLink href="/library">
            <button
              className="btn-ghost"
              style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: 8 }}
            >
              {t("library.viewAll")} <ArrowRight size={18} />
            </button>
          </TransitionLink>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--text-tertiary)" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ display: "inline-block", marginBottom: 16 }}
            >
              <BookOpen size={32} />
            </motion.div>
            <p>{t("books.loading")}</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TransitionLink href={`/read/${book.id}`} className="no-underline">
                  <motion.div
                    whileHover={{ y: -8 }}
                    style={{
                      position: "relative",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                      aspectRatio: "2/3",
                      background: "var(--bg-tertiary)",
                      boxShadow: "var(--shadow-card)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <BookOpen size={48} color="white" opacity={0.5} />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                        zIndex: 1,
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "24px",
                        zIndex: 2,
                        color: "white",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          opacity: 0.8,
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        {book.era || "Historical Era"}
                      </span>
                      <h3
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          marginBottom: 4,
                          lineHeight: 1.2,
                        }}
                      >
                        {book.title}
                      </h3>
                      <p style={{ fontSize: 13, opacity: 0.7 }}>{book.author}</p>
                    </div>
                  </motion.div>
                </TransitionLink>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
