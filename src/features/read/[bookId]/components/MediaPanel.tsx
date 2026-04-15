"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Film, Pen, Trash2, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { MediaAnnotation } from "../types";
import CustomAudioPlayer from "./CustomAudioPlayer";
import styles from "./styles/MediaPanel.module.css";

type MediaPanelProps = {
  annotations: MediaAnnotation[];
  onClose: () => void;
  focusedAnnotationId?: string | null;
  isAdmin?: boolean;
  playingMedia?: MediaAnnotation | null;
  onPlayMedia?: (media: MediaAnnotation | null) => void;
  onEdit?: (annotation: MediaAnnotation) => void;
  onDelete?: (id: string) => void;
  onAddGeneralMedia?: () => void;
};

const toRenderMarkdown = (text: string) =>
  text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        // Preserve manual paragraph indentation without triggering markdown code-block parsing
        .replace(/^\t+/g, (tabs) => "\u00A0\u00A0\u00A0\u00A0".repeat(tabs.length))
        .replace(/^( {4})+/g, (spaces) => "\u00A0".repeat(spaces.length)),
    )
    .join("  \n");

function MediaCard({
  annotation,
  isFocused,
  isAdmin,
  playingMedia,
  onPlayMedia,
  onEdit,
  onDelete,
}: {
  annotation: MediaAnnotation;
  isFocused?: boolean;
  isAdmin?: boolean;
  playingMedia?: MediaAnnotation | null;
  onPlayMedia?: (media: MediaAnnotation | null) => void;
  onEdit?: (annotation: MediaAnnotation) => void;
  onDelete?: (id: string) => void;
}) {
  const { mediaType, mediaUrl, caption, passageText, sources } = annotation;
  const [showSources, setShowSources] = useState(false);

  const hasSources = sources && sources.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!passageText) return;

    // Prevent scrolling if clicking on buttons or interactive media
    if ((e.target as HTMLElement).closest("button, iframe, audio")) {
      return;
    }

    const activeEl = document.querySelector(`[data-passage-id="${annotation.id}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      activeEl.classList.add("pulse-highlight");
      setTimeout(() => {
        activeEl.classList.remove("pulse-highlight");
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      id={`media-card-${annotation.id}`}
      className={`${styles.card} ${isFocused ? styles.cardFocused : ""} ${passageText ? styles.cardClickable : ""}`}
      onClick={handleCardClick}
    >
      {/* Admin Actions */}
      {isAdmin && (
        <div className={styles.adminActions}>
          <button
            onClick={() => onEdit?.(annotation)}
            className={styles.actionButton}
            title="Sửa tư liệu"
          >
            <Pen size={12} />
          </button>
          <button
            onClick={() => onDelete?.(annotation.id)}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Xóa tư liệu"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {mediaType === "image" && mediaUrl && (
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt={caption || ""} className={styles.image} loading="lazy" />
        </div>
      )}

      {mediaType === "video" && mediaUrl && (
        <div className={styles.videoWrapper}>
          {playingMedia?.id === annotation.id ? (
            <iframe
              src={mediaUrl}
              title={caption || "Video tư liệu"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            />
          ) : (
            <div
              className={styles.videoPlaceholder}
              onClick={(e) => {
                e.stopPropagation();
                onPlayMedia?.(annotation);
              }}
            >
              <Film size={24} color="var(--text-tertiary)" />
              <div className={styles.playOverlay}>
                <div className={styles.playButton}>▶</div>
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 12 }}>
                Bấm để phát video
              </span>
            </div>
          )}
        </div>
      )}

      {mediaType === "audio" && mediaUrl && (
        <div className={`${styles.audioWrapper} ${isAdmin ? styles.audioWrapperAdmin : ""}`}>
          <CustomAudioPlayer
            src={mediaUrl}
            annotation={annotation}
            isActive={playingMedia?.id === annotation.id}
            onPlayStart={() => onPlayMedia?.(annotation)}
          />
        </div>
      )}

      {mediaType === "annotation" && (
        <div className={`${styles.annotationBlock} ${isAdmin ? styles.annotationBlockAdmin : ""}`}>
          <div className={`${styles.annotationText} ${styles.markdownContent}`}>
            <ReactMarkdown>{toRenderMarkdown(caption || "")}</ReactMarkdown>
          </div>
        </div>
      )}

      {mediaType !== "annotation" && caption && (
        <div className={`${styles.caption} ${styles.markdownContent}`}>
          <ReactMarkdown>{toRenderMarkdown(caption)}</ReactMarkdown>
        </div>
      )}

      {/* Sources Button & Expandable Section */}
      {hasSources && (
        <div className={styles.sourcesSection}>
          <button
            className={styles.sourcesToggle}
            onClick={(e) => {
              e.stopPropagation();
              setShowSources((prev) => !prev);
            }}
          >
            <BookOpen size={12} />
            <span>Nguồn tham khảo ({sources!.length})</span>
            <span
              className={`${styles.sourcesChevron} ${showSources ? styles.sourcesChevronOpen : ""}`}
            >
              ›
            </span>
          </button>

          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <ul className={styles.sourcesList}>
                  {sources!.map((source, index) => (
                    <li key={index} className={styles.sourceItem}>
                      <span className={styles.sourceBullet}>{index + 1}</span>
                      <span className={styles.sourceText}>{source}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

const MediaPanel = memo(function MediaPanel({
  annotations,
  onClose,
  focusedAnnotationId,
  isAdmin,
  playingMedia,
  onPlayMedia,
  onEdit,
  onDelete,
  onAddGeneralMedia,
}: MediaPanelProps) {
  // Scroll focused card into view after panel animation
  useEffect(() => {
    if (!focusedAnnotationId) return;
    const el = document.getElementById(`media-card-${focusedAnnotationId}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350); // wait for panel slide-in animation to finish
    }
  }, [focusedAnnotationId]);

  return (
    <motion.div
      initial={{ x: 480, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 480, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Film size={16} color="var(--accent-primary)" />
          <span>Tư liệu liên quan</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAdmin && (
            <button
              onClick={onAddGeneralMedia}
              style={{
                fontSize: 12,
                background: "var(--accent-primary)",
                color: "white",
                border: "none",
                padding: "3px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              + Thêm tư liệu
            </button>
          )}
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {annotations.length === 0 ? (
          <div className={styles.emptyState}>
            <Film size={32} style={{ opacity: 0.3 }} />
            <p>Tiếp tục đọc để xem tư liệu lịch sử liên quan</p>
            <span className={styles.emptyHint}>
              Hình ảnh, video và chú thích sẽ tự động hiển thị khi bạn đọc đến đoạn văn liên quan.
            </span>
          </div>
        ) : (
          annotations.map((a) => (
            <MediaCard
              key={a.id}
              annotation={a}
              isFocused={focusedAnnotationId === a.id}
              isAdmin={isAdmin}
              playingMedia={playingMedia}
              onPlayMedia={onPlayMedia}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </motion.div>
  );
});

MediaPanel.displayName = "MediaPanel";

export default MediaPanel;
