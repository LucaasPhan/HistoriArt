import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { HighlightItem } from "./HighlightItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedHighlights = [...highlights].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

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
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Highlights</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select
            value={sortOrder}
            onValueChange={(val: "desc" | "asc") => setSortOrder(val)}
          >
            <SelectTrigger
              className="w-[130px]"
              style={{
                height: 32,
                fontSize: 12,
                background: "var(--bg-secondary)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)"
              }}
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 4, borderRadius: "50%" }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 , padding: "0 10px" }}>
        {sortedHighlights.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", marginTop: 40 }}>
            No highlights yet. Select text in the book to add some!
          </p>
        ) : (
          sortedHighlights.map((h, i) => (
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
