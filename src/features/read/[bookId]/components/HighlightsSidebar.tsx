import React from "react";
import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";

export type Highlight = {
  id: string;
  bookId: string;
  userId: string;
  text: string;
  color: string;
  pageNumber: number;
  createdAt: string;
};

type HighlightsSidebarProps = {
  highlights: Highlight[];
  onClose: () => void;
  onDeleteHighlight?: (id: string) => void;
  onNavigate?: (pageNumber: number) => void;
};

export default function HighlightsSidebar({
  highlights,
  onClose,
  onDeleteHighlight,
  onNavigate,
}: HighlightsSidebarProps) {
  return (
    <motion.div
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -250, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="nav-glass"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 320,
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        padding: "24px 6px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Highlights</h2>
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: 4, borderRadius: "50%" }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 , padding: "0 10px" }}>
        {highlights.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", marginTop: 40 }}>
            No highlights yet. Select text in the book to add some!
          </p>
        ) : (
          highlights.map((h, i) => (
            <div
              key={h.id || `highlight-${i}`}
              onClick={() => onNavigate?.(h.pageNumber)}
              className="highlight-item"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: h.color,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                    Page {h.pageNumber}
                  </span>
                </div>
                {onDeleteHighlight && (
                  <button
                    onClick={() => onDeleteHighlight(h.id)}
                    className="btn-ghost"
                    style={{ padding: 4, color: "var(--text-error)" }}
                    aria-label="Delete highlight"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p
                style={{
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.5,
                  paddingLeft: 8,
                  borderLeft: `3px solid ${h.color}`,
                }}
              >
                {h.text}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
