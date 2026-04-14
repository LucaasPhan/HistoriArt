import { motion } from "framer-motion";
import { Volume2, X } from "lucide-react";
import type { MediaAnnotation } from "../types";
import CustomAudioPlayer from "./CustomAudioPlayer";

type Props = {
  annotation: MediaAnnotation;
  onClose: () => void;
};

export default function AudioIsland({ annotation, onClose }: Props) {
  if (!annotation || annotation.mediaType !== "audio" || !annotation.mediaUrl) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      exit={{ y: 100, opacity: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        zIndex: 9999,
        background: "rgba(20, 20, 20, 0.8)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 400,
        maxWidth: "90vw",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          <Volume2 size={16} color="var(--accent-primary)" />
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 300,
            }}
          >
            {annotation.caption || "Đang phát Audio"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Optionally pause audio when island explicitly closed
            const audio = document.getElementById("historiart-global-audio") as HTMLAudioElement;
            if (audio) audio.pause();
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

      {/* Reusing CustomAudioPlayer purely for UI, hooked to the same global audio tag */}
      <CustomAudioPlayer src={annotation.mediaUrl} annotation={annotation} isActive={true} />
    </motion.div>
  );
}
