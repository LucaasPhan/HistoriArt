"use client";

import { useTranslation } from "@/lib/i18n";

interface LanguageSwitcherProps {
  position?: "bottom-right" | "top-right";
}

export default function LanguageSwitcher({ position = "bottom-right" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  const isVi = language === "vi";

  return (
    <div
      className="lang-switcher"
      style={{
        position: "fixed",
        zIndex: 50,
        ...(position === "bottom-right" ? { bottom: 24, right: 24 } : { top: 24, right: 24 }),
      }}
    >
      <div className="lang-switcher__track">
        {/* Sliding pill indicator */}
        <div
          className="lang-switcher__pill"
          style={{
            transform: isVi ? "translateX(0)" : "translateX(100%)",
          }}
        />

        <button
          type="button"
          onClick={() => setLanguage("vi")}
          className={`lang-switcher__btn ${isVi ? "lang-switcher__btn--active" : ""}`}
        >
          <span className="lang-switcher__flag">🇻🇳</span>
          <span className="lang-switcher__label mobile-hide-text">Tiếng Việt</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`lang-switcher__btn ${!isVi ? "lang-switcher__btn--active" : ""}`}
        >
          <span className="lang-switcher__flag">🇬🇧</span>
          <span className="lang-switcher__label mobile-hide-text">English</span>
        </button>
      </div>
    </div>
  );
}
