import { motion } from "framer-motion";
import { Film, X } from "lucide-react";
import type { MediaAnnotation } from "../../types";
import VideoContainer from "./VideoContainer";

type Props = {
  annotation: MediaAnnotation;
  onClose: () => void;
};

export default function VideoPopup({ annotation, onClose }: Props) {
  if (!annotation || annotation.mediaType !== "video" || !annotation.mediaUrl) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        background: "rgba(20, 20, 20, 0.9)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
        display: "flex",
        flexDirection: "column",
        width: 400,
        maxWidth: "90vw",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          <Film size={14} color="var(--accent-primary)" />
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 280,
            }}
          >
            {annotation.caption || "Đang xem Video"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}>
        {annotation.mediaUrl.includes("youtube.com") || annotation.mediaUrl.includes("youtu.be") ? (
          <iframe
            src={
              annotation.mediaUrl +
              (annotation.mediaUrl.includes("?") ? "&autoplay=1" : "?autoplay=1")
            }
            title={annotation.caption || "Video tư liệu"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <VideoContainer
            src={annotation.mediaUrl}
            autoPlay
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </motion.div>
  );
}
