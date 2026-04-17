"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function SecurityTab() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="settings-section">
        <h2 className="settings-section-title">{t("settings.securityTitle")}</h2>
        <h3
          style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}
        >
          {t("settings.authentication")}
        </h3>
        <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
          {t("settings.securityPlaceholder")}
        </p>
      </section>
    </motion.div>
  );
}
