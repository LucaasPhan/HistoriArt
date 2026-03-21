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
      <p className="ob-step-label">Step 2 of 6</p>
      <h1 className="ob-title">What brings you here?</h1>
      <p className="ob-subtitle">Select all that apply to your reading journey.</p>

      <div className="spu-grid">
        {PURPOSES.map((p) => {
          const active = data.purposeOfUse.includes(p.value);
          return (
            <div
              key={p.value}
              className={`spu-card${active ? " spu-card--active" : ""}`}
              onClick={() => {
                const current = new Set(data.purposeOfUse);
                if (current.has(p.value)) {
                  current.delete(p.value);
                } else {
                  current.add(p.value);
                }
                set("purposeOfUse", Array.from(current));
              }}
            >
              <span className="spu-emoji">{p.emoji}</span>
              <span className="spu-label">{p.label}</span>
              <span className="spu-desc">{p.description}</span>
            </div>
          );
        })}
      </div>

      {data.purposeOfUse.includes("other") && (
        <div className="spu-custom-wrap">
          <input
            className="spu-input"
            type="text"
            placeholder="Please specify your reason..."
            value={data.customPurpose || ""}
            onChange={(e) => set("customPurpose", e.target.value)}
          />
        </div>
      )}
    </>
  );
}