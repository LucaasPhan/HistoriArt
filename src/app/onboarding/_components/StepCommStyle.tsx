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
    </>
  );
}