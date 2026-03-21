import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";
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

function CustomFilterDropdown({ value, onChange }: { value: "desc" | "asc" | "custom", onChange: (val: "desc" | "asc") => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3! transition-all duration-200 hover:bg-(--bg-secondary) hover:text-(--text-primary) hover:border-(--text-secondary)"
        style={{
          width: 140,
          height: 32,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-full)",
          color: "var(--text-secondary)",
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span>{value === "desc" ? "Newest First" : value === "asc" ? "Oldest First" : "Custom Order"}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-1050 overflow-hidden"
            style={{
              width: 140,
              background: "var(--bg-glass)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex flex-col p-1">
              {[
                { label: "Newest First", val: "desc" },
                { label: "Oldest First", val: "asc" }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => { onChange(item.val as "desc" | "asc"); setIsOpen(false); }}
                  className="flex items-center justify-between w-full px-2! py-1.5! text-left transition-colors duration-150 rounded-sm text-[13px] cursor-pointer hover:bg-(--bg-secondary) hover:text-(--text-primary)"
                  style={{
                    color: value === item.val ? "var(--text-primary)" : "var(--text-secondary)",
                    backgroundColor: value === item.val ? "var(--bg-secondary)" : "transparent",
                    fontWeight: value === item.val ? 500 : 400,
                  }}
                >
                  {item.label}
                  {value === item.val && <Check size={14} className="text-(--text-primary)" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HighlightsSidebar({
  highlights,
  onClose,
  onDeleteHighlight,
  onSendToChat,
  onNavigate,
}: HighlightsSidebarProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "custom">("desc");
  const [orderedHighlights, setOrderedHighlights] = useState<Highlight[]>(() => {
    return [...highlights].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // 'desc' by default
    });
  });
  const [prevHighlights, setPrevHighlights] = useState<Highlight[]>(highlights);

  if (highlights !== prevHighlights) {
    setPrevHighlights(highlights);
    setOrderedHighlights([...highlights].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    }));
  }

  const handleSortChange = (val: "desc" | "asc") => {
    setSortOrder(val);
    const sorted = [...orderedHighlights].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return val === "desc" ? timeB - timeA : timeA - timeB;
    });
    setOrderedHighlights(sorted);
  };

  const detectedOrder = React.useMemo(() => {
    if (orderedHighlights.length <= 1) return sortOrder;
    let isDesc = true;
    let isAsc = true;
    for (let i = 0; i < orderedHighlights.length - 1; i++) {
        const timeA = new Date(orderedHighlights[i].createdAt).getTime();
        const timeB = new Date(orderedHighlights[i+1].createdAt).getTime();
        if (timeA < timeB) isDesc = false;
        if (timeA > timeB) isAsc = false;
    }
    if (isDesc) return "desc";
    if (isAsc) return "asc";
    return "custom";
  }, [orderedHighlights, sortOrder]);

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
          <CustomFilterDropdown
            value={detectedOrder}
            onChange={handleSortChange}
          />
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
        {orderedHighlights.length === 0 ? (
          <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", marginTop: 40 }}>
            No highlights yet. Select text in the book to add some!
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={orderedHighlights}
            onReorder={setOrderedHighlights}
            style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}
          >
            {orderedHighlights.map((h, i) => (
              <Reorder.Item key={h.id || `highlight-${i}`} value={h}>
                <HighlightItem
                  highlight={h}
                  onDeleteHighlight={onDeleteHighlight}
                  onSendToChat={onSendToChat}
                  onNavigate={onNavigate}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </motion.div>
  );
}
