import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { HighlightItem } from "./HighlightItem";


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
  onSendToChat?: (text: string) => void;
  onNavigate?: (pageNumber: number) => void;
};

export default function HighlightsSidebar({
  highlights,
  onClose,
  onDeleteHighlight,
  onSendToChat,
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
            <HighlightItem
              key={h.id || `highlight-${i}`}
              highlight={h}
              onDeleteHighlight={onDeleteHighlight}
              onSendToChat={onSendToChat}
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
