"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Users, Plus, Image as ImageIcon, Video } from "lucide-react";

export default function CommunityMockup() {
  const { t } = useTranslation();
  const contributions = [
    { type: "image", user: "Tùng Chi", time: "2m ago", title: "Cố đô Huế" },
    { type: "video", user: "Nhất Huy", time: "15m ago", title: "Bạch Đằng Battle" },
    { type: "document", user: "Trung Kiên", time: "1h ago", title: "Lam Sơn Rebellion" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        height: 380,
        background: "var(--bg-card)",
        borderRadius: "24px",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t("mockup.community.title")}</span>
        </div>
        <button
          style={{
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Plus size={12} /> {t("mockup.community.contribute")}
        </button>
      </div>

      {/* List */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {contributions.map((con, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: "12px 16px",
              borderRadius: "16px",
              background: "var(--bg-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              {con.type === "image" ? <ImageIcon size={18} /> : <Video size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                {con.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                {t("mockup.community.contributedBy")}{" "}
                <span style={{ color: "var(--accent-primary)" }}>{con.user}</span> • {con.time}
              </div>
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-primary)",
              }}
            />
          </motion.div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", padding: "0 24px 24px" }}>
        <div
          style={{
            width: "100%",
            height: 100,
            background: "linear-gradient(to bottom, var(--accent-glow), transparent)",
            borderRadius: "16px",
            border: "1px dashed var(--accent-primary)",
            opacity: 0.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-primary)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {t("mockup.community.drop")}
        </div>
      </div>
    </div>
  );
}
