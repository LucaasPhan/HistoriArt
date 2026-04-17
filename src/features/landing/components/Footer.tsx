"use client";

import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "40px 24px 60px",
        borderTop: "1px solid var(--border-subtle)",
        color: "var(--text-tertiary)",
        fontSize: 13,
      }}
    >
      <p>HistoriArt © {new Date().getFullYear()} — {t("footer.text")}</p>
    </footer>
  );
}
