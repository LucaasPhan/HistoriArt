"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";

export default function BooksMockup() {
  const { t } = useTranslation();
  const books = [
    { title: "Bạch Đằng Giang", author: "Historical Archive", color: "var(--accent-primary)" },
    { title: "Điện Biên Phủ", author: "National Library", color: "var(--accent-secondary)" },
    { title: "Đại Việt Sử Ký", author: "Ancient Records", color: "#8B0000" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        height: 380,
        background: "var(--bg-card)",
        borderRadius: "24px",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t("mockup.library.title")}</span>
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search size={14} color="var(--text-tertiary)" />
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          flex: 1,
        }}
      >
        {books.map((book, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div
              style={{
                aspectRatio: "3/4",
                background: book.color,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 8,
                  width: 2,
                  height: "100%",
                  background: "rgba(255,255,255,0.2)",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                {book.title.split(" ").map((w, j) => (
                  <div key={j}>{w}</div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 600 }}>
              {book.author}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
