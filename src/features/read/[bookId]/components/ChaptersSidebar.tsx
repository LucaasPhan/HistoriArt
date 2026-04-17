import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Book, X } from "lucide-react";
import styles from "./styles/HighlightsSidebar.module.css";

export type ChapterInfo = {
  title: string;
  page: number;
};

type ChaptersSidebarProps = {
  chapters: ChapterInfo[];
  currentPage: number;
  onClose: () => void;
  onNavigate: (page: number) => void;
};

export default function ChaptersSidebar({
  chapters,
  currentPage,
  onClose,
  onNavigate,
}: ChaptersSidebarProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styles.container}
      style={{ zIndex: 1001 }} // Ensure it's above other elements if needed
    >
      <div className={styles.header}>
        <h2 className={styles.title} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Book size={18} className="text-(--accent-primary)" /> {t("chapters.title")}
        </h2>
        <div className={styles.headerControls}>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {chapters.length === 0 ? (
          <p className={styles.emptyState}>{t("chapters.empty")}</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {chapters.map((chap, idx) => {
              const isActive =
                currentPage >= chap.page &&
                (idx === chapters.length - 1 || currentPage < chapters[idx + 1].page);

              return (
                <li key={`chap-${idx}`}>
                  <button
                    onClick={() => onNavigate(chap.page)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      background: isActive ? "var(--bg-card)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "var(--border-hover)" : "transparent",
                      borderRadius: "var(--radius-md)",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: isActive ? "var(--shadow-card)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--bg-secondary)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <div style={{ fontSize: "14px", marginBottom: "4px" }}>{chap.title}</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {t("chapters.page")} {chap.page}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
