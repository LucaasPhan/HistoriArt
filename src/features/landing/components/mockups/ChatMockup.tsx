"use client";

import { useTranslation } from "@/lib/i18n";
import { MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatMockup() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--bg-secondary)",
        }}
      >
        <div
          style={{
            padding: 6,
            borderRadius: "50%",
            display: "flex",
          }}
        >
          <Sparkles size={16} color="var(--accent-primary)" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Fable Chat</span>
      </div>

      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* User message */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: 12, alignSelf: "flex-end", maxWidth: "85%" }}
        >
          <div
            style={{
              background: "var(--accent-gradient)",
              color: "white",
              padding: "12px 16px",
              borderRadius: "16px 16px 2px 16px",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {t("mockup.chat.userMessage")}
          </div>
        </motion.div>

        {/* AI message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: 12, alignSelf: "flex-start", maxWidth: "85%" }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="var(--accent-primary)" />
          </div>
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              padding: "14px 16px",
              borderRadius: "16px 16px 16px 2px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--text-primary)",
            }}
          >
            <p style={{ margin: 0 }}>{t("mockup.chat.aiMessage")}</p>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
        }}
      >
        <div
          style={{
            background: "var(--bg-primary)",
            borderRadius: "var(--radius-full)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-tertiary)",
            fontSize: 14,
          }}
        >
          <MessageCircle size={16} style={{ marginRight: 8 }} />
          {t("ai.placeholder")}
        </div>
      </div>
    </div>
  );
}
