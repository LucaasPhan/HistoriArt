"use client";

import { ThemeButton } from "@/components/ThemeButton";
import type { Language } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export default function GeneralTab() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="settings-section">
        <h2 className="settings-section-title">{t("settings.generalTitle")}</h2>

        <div className="settings-form-group">
          <label className="settings-label">{t("settings.appearance")}</label>
          <ThemeButton />
          <p className="settings-hint">{t("settings.appearanceHint")}</p>
        </div>

        {/* ── Language Selector ── */}
        <div className="settings-form-group" style={{ marginTop: 32 }}>
          <label className="settings-label">{t("settings.language")}</label>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border:
                    language === opt.value
                      ? "2px solid var(--accent-primary)"
                      : "1px solid var(--border-subtle)",
                  background: language === opt.value ? "var(--accent-glow)" : "var(--bg-card)",
                  color: language === opt.value ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: language === opt.value ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: 14,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="settings-hint">{t("settings.languageHint")}</p>
        </div>
      </section>
    </motion.div>
  );
}
