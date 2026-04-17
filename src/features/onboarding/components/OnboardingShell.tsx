import { useTranslation } from "@/lib/i18n";
import type { ReactNode } from "react";

interface StepConfig {
  id: string;
}

interface Props {
  steps: StepConfig[];
  step: number;
  children: ReactNode;
}

export default function OnboardingShell({ steps, step, children }: Props) {
  const progress = ((step + 1) / steps.length) * 100;
  const { language, setLanguage } = useTranslation();

  return (
    <div className="ob-bg">
      {/* Language Switcher Corner */}
      <div style={{ position: "absolute", top: 24, right: 24, zIndex: 10 }}>
        <div
          style={{
            display: "flex",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <button
            onClick={() => setLanguage("vi")}
            style={{
              padding: "8px 14px",
              border: "none",
              background: language === "vi" ? "var(--bg-secondary)" : "transparent",
              color: language === "vi" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: language === "vi" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            onClick={() => setLanguage("en")}
            style={{
              padding: "8px 14px",
              border: "none",
              borderLeft: "1px solid var(--border-subtle)",
              background: language === "en" ? "var(--bg-secondary)" : "transparent",
              color: language === "en" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: language === "en" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      <div className="ob-wrap">
        {/* Progress bar */}
        <div className="ob-track">
          <div className="ob-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Animated card — key forces re-mount on step change */}
        <div className="ob-card" key={step}>
          {children}
        </div>

        {/* Step dots */}
        <div className="ob-dots">
          {steps.map((_, i) => (
            <span key={i} className={`ob-dot${i === step ? " ob-dot--active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
