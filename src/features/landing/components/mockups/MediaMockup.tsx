"use client";

import { useTranslation } from "@/lib/i18n";
import { Film, Play, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MediaMockup() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        minHeight: 380,
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      {/* Mock reader content */}
      <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border-subtle)" }}>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-source-sans)",
          }}
        >
          ...Đợt tấn công thứ nhất nhằm vào cụm cứ điểm phía bắc.{" "}
          <motion.span
            initial={{ backgroundColor: "rgba(212, 110, 86, 0)" }}
            animate={{ backgroundColor: "var(--accent-glow)" }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            style={{
              borderBottom: "1px dashed var(--accent-primary)",
              padding: "1px 3px",
              borderRadius: 3,
            }}
          >
            Bài Quốc tế ca trầm hùng vang lên
          </motion.span>{" "}
          giữa lòng chảo khi cờ Việt Minh tung bay trên cứ điểm vừa chiếm được.
          <br />
          <br />
          Trong một lần kéo pháo qua dốc,{" "}
          <span
            style={{
              borderBottom: "1px dashed var(--accent-primary)",
              background: "var(--accent-glow)",
              padding: "1px 3px",
              borderRadius: 3,
            }}
          >
            Tô Vĩnh Diện không ngần ngại, ôm chèn lao vào bánh xe
          </span>{" "}
          pháo để cứu khẩu pháo...
        </p>
      </div>

      {/* Mock MediaPanel */}
      <div
        style={{
          background: "var(--bg-secondary)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 4px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Film size={14} color="var(--accent-primary)" />
          {t("demo.relatedMedia")}
        </div>

        {/* Mock audio card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px",
              background: "var(--bg-tertiary)",
            }}
          >
            <Play size={14} color="var(--accent-primary)" />
            <div
              style={{
                flex: 1,
                height: 3,
                background: "var(--border-subtle)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "40%",
                  height: "100%",
                  background: "var(--accent-primary)",
                  borderRadius: 4,
                }}
              />
            </div>
            <Volume2 size={14} />
          </div>
          <p
            style={{
              padding: "8px 12px",
              fontSize: 10,
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            🎵 Bài Quốc tế ca — Điện Biên Phủ
          </p>
        </motion.div>

        {/* Mock annotation card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "var(--accent-glow)",
            borderLeft: "3px solid var(--accent-primary)",
            borderRadius: "var(--radius-md)",
            padding: 12,
          }}
        >
          <p
            style={{
              fontSize: 11,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Anh hùng Tô Vĩnh Diện (1928–1953) — hy sinh thân mình chèn pháo.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
