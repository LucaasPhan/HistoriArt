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

      {data.purposeOfUse === "other" && (
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