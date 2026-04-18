"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BookPreview } from "../types";
import { AnimatedSection, fadeUp } from "./AnimatedSection";

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
    <AnimatedSection
      style={{
        position: "relative",
        zIndex: 1,
        padding: "40px 24px 100px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {t("books.heading")} <span className="gradient-text">{t("books.headingAccent")}</span>
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            marginTop: 12,
            maxWidth: 500,
            margin: "12px auto 0",
          }}
        >
          {t("books.subtitle")}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          {t("books.loading")}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <TransitionLink href={`/read/${book.id}`} className="no-underline">
                <motion.div
                  className="book-card"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  style={{
                    height: 380, // Set fixed height to match BookCard
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                    borderRadius: "var(--radius-lg)",
                    background: book.coverUrl
                      ? "var(--bg-tertiary)"
                      : `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                    boxShadow: "var(--shadow-card)",
                    position: "relative",
                  }}
                >
                  {/* Background Cover Image */}
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        transition: "transform 0.5s ease",
                      }}
                      sizes="320px"
                      unoptimized
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 70%)",
                        }}
                      />
                      <BookOpen size={60} color="rgba(255,255,255,0.5)" />
                    </div>
                  )}

                  {/* Dark Gradient Overlay for text readability */}
                  <motion.div
                    variants={{
                      rest: {
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
                      },
                      hover: {
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%, transparent 100%)",
                      },
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 1,
                    }}
                  />

                  {/* Era Badge */}
                  {book.era && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                        zIndex: 10,
                      }}
                    >
                      {book.era}
                    </div>
                  )}

                  {/* Content overlay */}
                  <div
                    style={{
                      padding: "20px",
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "white",
                        marginBottom: 4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      {book.title}
                    </h3>
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 8,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {book.author}
                    </p>

                    {/* Hidden until hover details */}
                    <motion.div
                      variants={{
                        rest: { height: 0, opacity: 0, marginTop: 0 },
                        hover: { height: "auto", opacity: 1, marginTop: 8 },
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: 12,
                          lineHeight: 1.5,
                          marginBottom: 16,
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
                          paddingTop: 12,
                          borderTop: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                          {book.estimatedReadTime
                            ? `${book.estimatedReadTime} ${t("books.readTime")}`
                            : `${book.totalPages} ${t("books.pages")}`}
                        </span>
                        <motion.span
                          style={{
                            fontSize: 13,
                            color: "var(--accent-primary)",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          variants={{
                            rest: { x: 0 },
                            hover: { x: 4 },
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {t("books.readNow")} <ArrowRight size={12} />
                        </motion.span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </TransitionLink>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedSection>
  );
}
