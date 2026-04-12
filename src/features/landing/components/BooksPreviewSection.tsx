"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { AnimatedSection, fadeUp } from "./AnimatedSection";

export default function BooksPreviewSection() {
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
          Thư viện <span className="gradient-text">lịch sử</span>
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
          Khám phá những tác phẩm kinh điển về lịch sử Việt Nam từ thời dựng nước đến thống nhất.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {SAMPLE_BOOKS.map((book, i) => (
          <motion.div
            key={book.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
          >
            <TransitionLink href={`/read/${book.id}`}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                }}
              >
                {/* Cover gradient strip */}
                <div
                  style={{
                    height: 120,
                    background: `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <BookOpen size={36} color="rgba(255,255,255,0.5)" />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 12,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {book.era}
                  </div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-tertiary)",
                      marginBottom: 12,
                    }}
                  >
                    {book.author}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
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
                      marginTop: 16,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {book.estimatedReadTime
                        ? `${book.estimatedReadTime} phút đọc`
                        : `${book.totalPages} trang`}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--accent-primary)",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Đọc ngay <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </TransitionLink>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
}
