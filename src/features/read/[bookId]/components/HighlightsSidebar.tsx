import { useTranslation } from "@/lib/i18n";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Check, ChevronDown, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { HighlightItem } from "./HighlightItem";
import styles from "./styles/HighlightsSidebar.module.css";

import type { Highlight } from "../../types";

type HighlightsSidebarProps = {
  highlights: Highlight[];
  onClose: () => void;
  onDeleteHighlight?: (id: string) => void;
  onClearAll?: () => void;
  onSendToChat?: (text: string) => void;
  onNavigate?: (pageNumber: number) => void;
};

function CustomFilterDropdown({
  value,
  onChange,
}: {
  value: "desc" | "asc" | "custom";
  onChange: (val: "desc" | "asc") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (v: string) => {
    if (v === "desc") return t("highlights.newestFirst");
    if (v === "asc") return t("highlights.oldestFirst");
    return t("highlights.customOrder");
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.dropdownTrigger}>
        <span>{getLabel(value)}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
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
                { label: t("highlights.newestFirst"), val: "desc" },
                { label: t("highlights.oldestFirst"), val: "asc" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    onChange(item.val as "desc" | "asc");
                    setIsOpen(false);
                  }}
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
  onClearAll,
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
  const { t } = useTranslation();

  if (highlights !== prevHighlights) {
    setPrevHighlights(highlights);
    setOrderedHighlights(
      [...highlights].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      }),
    );
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
      const timeB = new Date(orderedHighlights[i + 1].createdAt).getTime();
      if (timeA < timeB) isDesc = false;
      if (timeA > timeB) isAsc = false;
    }
    if (isDesc) return "desc";
    if (isAsc) return "asc";
    return "custom";
  }, [orderedHighlights, sortOrder]);

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{t("highlights.title")}</h2>
        <div className={styles.headerControls}>
          <CustomFilterDropdown value={detectedOrder} onChange={handleSortChange} />
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {orderedHighlights.length === 0 ? (
          <p className={styles.emptyState}>{t("highlights.empty")}</p>
        ) : (
          <Reorder.Group
            axis="y"
            values={orderedHighlights}
            onReorder={setOrderedHighlights}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 0,
              margin: 0,
              listStyle: "none",
            }}
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

      {highlights.length > 0 && onClearAll && (
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: "auto",
          }}
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
            title={t("highlights.clearAllTitle")}
          >
            <Trash2 size={14} />
            {t("highlights.clearAll")}
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-lg)",
                padding: 24,
                boxShadow: "var(--shadow-elevated)",
                border: "1px solid var(--border-subtle)",
                width: "100%",
                maxWidth: 320,
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                {t("highlights.clearAllTitle")}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
                {t("highlights.clearAllText")}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-ghost"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    onClearAll?.();
                  }}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("highlights.deleteAll")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
