// components/onboarding/StepPurpose.tsx
// Step 2 — reading companion purpose

import { PURPOSES } from "./constants";
import type { OnboardingData, PurposeOfUse } from "./types";

interface Props {
  data: OnboardingData;
  set:  <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepPurpose({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 2 of 3</p>
      <h1 className="ob-title">What brings you here?</h1>
      <p className="ob-subtitle">What do you hope to get out of reading with a companion?</p>

      <div className="spu-grid">
        {PURPOSES.map((p) => {
          const active = data.purposeOfUse === p.value;
          return (
            <div
              key={p.value}
              className={`spu-card${active ? " spu-card--active" : ""}`}
              onClick={() => set("purposeOfUse", p.value as PurposeOfUse)}
            >
              <span className="spu-emoji">{p.emoji}</span>
              <span className="spu-label">{p.label}</span>
              <span className="spu-desc">{p.description}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .spu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .spu-card {
          border: 1.5px solid var(--sand);
          border-radius: var(--radius);
          padding: 14px 12px;
          cursor: pointer;
          background: var(--cream);
          transition: border-color 0.18s, background 0.18s;
          display: flex;
          flex-direction: column;
          gap: 4px;
          user-select: none;
        }
        .spu-card:hover { border-color: var(--sage); background: var(--sage-lt); }
        .spu-card--active { border-color: var(--sage); background: var(--sage-lt); }

        .spu-emoji { font-size: 22px; line-height: 1; margin-bottom: 2px; }

        .spu-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          line-height: 1.3;
        }
        .spu-card--active .spu-label { color: var(--sage); }

        .spu-desc {
          font-size: 11px;
          color: var(--bark);
          line-height: 1.4;
        }

        @media (max-width: 400px) {
          .spu-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}