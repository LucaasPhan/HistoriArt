"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export default function QuizMockup() {
  const { t } = useTranslation();
  const options = [
    { text: t("mockup.quiz.option1"), correct: true },
    { text: t("mockup.quiz.option2"), correct: false },
    { text: t("mockup.quiz.option3"), correct: false },
    { text: t("mockup.quiz.option4"), correct: false },
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
          <HelpCircle size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t("mockup.quiz.title")}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>
          {t("mockup.quiz.questionCount", { current: 4, total: 10 })}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: "20px 24px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h4
          style={{
            fontSize: 16,
            fontWeight: 800,
            marginBottom: 16,
            lineHeight: 1.4,
            color: "var(--text-primary)",
          }}
        >
          {t("mockup.quiz.question")}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                background: opt.correct ? "rgba(212, 110, 86, 0.05)" : "transparent",
                borderColor: opt.correct ? "var(--accent-primary)" : "var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: opt.correct ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                {opt.text}
              </span>
              {opt.correct && <CheckCircle2 size={16} color="var(--accent-primary)" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 4, background: "var(--bg-secondary)", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "40%" }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "var(--accent-primary)",
          }}
        />
      </div>
    </div>
  );
}
