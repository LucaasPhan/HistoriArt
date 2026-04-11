"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { X, Film, Image as ImageIcon, Play, Volume2, FileText } from "lucide-react";
import type { MediaAnnotation } from "../types";
import styles from "./MediaPanel.module.css";

type MediaPanelProps = {
  annotations: MediaAnnotation[];
  onClose: () => void;
};

function MediaCard({ annotation }: { annotation: MediaAnnotation }) {
  const { mediaType, mediaUrl, caption } = annotation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      {mediaType === "image" && mediaUrl && (
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl} alt={caption || ""} className={styles.image} loading="lazy" />
        </div>
      )}

      {mediaType === "video" && mediaUrl && (
        <div className={styles.videoWrapper}>
          <iframe
            src={mediaUrl}
            title={caption || "Video tư liệu"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
          />
        </div>
      )}

      {mediaType === "audio" && mediaUrl && (
        <div className={styles.audioWrapper}>
          <Volume2 size={20} color="var(--accent-primary)" />
          <audio controls src={mediaUrl} className={styles.audio}>
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      )}

      {mediaType === "annotation" && (
        <div className={styles.annotationBlock}>
          <FileText size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className={styles.annotationText}>{caption}</p>
        </div>
      )}

      {mediaType !== "annotation" && caption && (
        <p className={styles.caption}>{caption}</p>
      )}

      <div className={styles.typeBadge}>
        {mediaType === "image" && <><ImageIcon size={10} /> Hình ảnh</>}
        {mediaType === "video" && <><Play size={10} /> Video</>}
        {mediaType === "audio" && <><Volume2 size={10} /> Âm thanh</>}
        {mediaType === "annotation" && <><FileText size={10} /> Chú thích</>}
      </div>
    </motion.div>
  );
}

const MediaPanel = memo(function MediaPanel({
  annotations,
  onClose,
}: MediaPanelProps) {
  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Film size={16} color="var(--accent-primary)" />
          <span>Tư liệu liên quan</span>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.content}>
        {annotations.length === 0 ? (
          <div className={styles.emptyState}>
            <Film size={32} style={{ opacity: 0.3 }} />
            <p>Tiếp tục đọc để xem tư liệu lịch sử liên quan</p>
            <span className={styles.emptyHint}>Hình ảnh, video và chú thích sẽ tự động hiển thị khi bạn đọc đến đoạn văn liên quan.</span>
          </div>
        ) : (
          annotations.map((a) => <MediaCard key={a.id} annotation={a} />)
        )}
      </div>
    </motion.div>
  );
});

MediaPanel.displayName = "MediaPanel";

export default MediaPanel;
