import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";
import { HighlightItem } from "./HighlightItem";
import styles from "./HighlightsSidebar.module.css";

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

function CustomFilterDropdown({ value, onChange, bookId }: { value: "desc" | "asc" | "custom", onChange: (val: "desc" | "asc") => void, bookId: string }) {
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
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.dropdownTrigger}
      >
        <span>
          {value === "desc" ? "Newest First" : value === "asc" ? "Oldest First" : "Custom Order"}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={styles.dropdownMenu + " nav-glass"}
          >
            <div className="flex flex-col">
              {[
                { label: "Newest First", val: "desc" },
                { label: "Oldest First", val: "asc" }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => { onChange(item.val as "desc" | "asc"); setIsOpen(false); }}
                  className={`${styles.dropdownItem} ${value === item.val ? styles.dropdownItemActive : ""}`}
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
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Highlights</h2>
        <div className={styles.headerControls}>
          <CustomFilterDropdown
            value={detectedOrder}
            onChange={handleSortChange}
          />
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {orderedHighlights.length === 0 ? (
          <p className={styles.emptyState}>
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
