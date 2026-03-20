// components/onboarding/StepPersonal.tsx
// Step 1 — age + gender

import { GENDERS } from "./constants";
import type { OnboardingData, Gender } from "./types";

interface Props {
  data: OnboardingData;
  set:  <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepPersonal({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 1 of 3</p>
      <h1 className="ob-title">A little about you</h1>
      <p className="ob-subtitle">Helps us speak your language.</p>

      {/* Age */}
      <p className="ob-section">Your age</p>
      <input
        className="ob-input"
        type="number"
        min={16}
        max={99}
        placeholder="e.g. 28"
        value={data.age}
        onChange={(e) => set("age", e.target.value)}
      />
      {data.age !== "" && Number(data.age) < 16 && (
        <p className="sp-error">You must be at least 16 to proceed.</p>
      )}

      {/* Gender */}
      <p className="ob-section">Gender</p>
      <div className="sp-gender-grid">
        {GENDERS.map((g) => (
          <div
            key={g.value}
            className={`ob-chip${data.gender === g.value ? " ob-chip--active" : ""}`}
            onClick={() => set("gender", g.value as Gender)}
          >
            <span className="sp-icon">{g.icon}</span>
            {g.label}
          </div>
        ))}
      </div>
    </>
  );
}