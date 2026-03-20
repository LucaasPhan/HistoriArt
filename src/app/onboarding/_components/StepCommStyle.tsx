// components/onboarding/StepCommStyle.tsx
// Step 3 — communication preference

import { COMM_PREFS } from "./constants";
import type { OnboardingData, CommunicationPreference } from "./types";

interface Props {
  data: OnboardingData;
  set:  <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepCommStyle({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 3 of 3</p>
      <h1 className="ob-title">How do you like to talk?</h1>
      <p className="ob-subtitle">We'll match your pace and tone.</p>

      <div className="scs-list">
        {COMM_PREFS.map((c) => {
          const active = data.communicationPreference === c.value;
          return (
            <div
              key={c.value}
              className={`scs-card${active ? " scs-card--active" : ""}`}
              onClick={() => set("communicationPreference", c.value as CommunicationPreference)}
            >
              <div className="scs-text">
                <p className="scs-label">{c.label}</p>
                <p className="scs-desc">{c.description}</p>
              </div>
              {/* Radio dot */}
              <span className="scs-dot">
                <span className="scs-dot-inner" />
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        .scs-list { display: flex; flex-direction: column; gap: 10px; }

        .scs-card {
          border: 1.5px solid var(--sand);
          border-radius: var(--radius);
          padding: 15px 16px;
          cursor: pointer;
          background: var(--cream);
          transition: border-color 0.18s, background 0.18s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          user-select: none;
        }
        .scs-card:hover  { border-color: var(--sage); background: var(--sage-lt); }
        .scs-card--active { border-color: var(--sage); background: var(--sage-lt); }

        .scs-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 2px;
        }
        .scs-card--active .scs-label { color: var(--sage); }

        .scs-desc { font-size: 12px; color: var(--bark); line-height: 1.4; }

        /* Radio dot */
        .scs-dot {
          flex-shrink: 0;
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid var(--sand);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.18s, background 0.18s;
        }
        .scs-card--active .scs-dot {
          border-color: var(--sage);
          background: var(--sage);
        }
        .scs-dot-inner {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fff;
          opacity: 0;
          transition: opacity 0.18s;
        }
        .scs-card--active .scs-dot-inner { opacity: 1; }
      `}</style>
    </>
  );
}