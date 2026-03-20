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
        min={10}
        max={99}
        placeholder="e.g. 28"
        value={data.age}
        onChange={(e) => set("age", e.target.value)}
      />

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

      <style>{`
        .ob-input {
          width: 100%;
          border: 1.5px solid var(--sand);
          border-radius: var(--radius);
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--ink);
          background: var(--cream);
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -moz-appearance: textfield;
        }
        .ob-input::-webkit-inner-spin-button,
        .ob-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .ob-input:focus { border-color: var(--sage); background: #fff; }

        .sp-gender-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sp-icon {
          font-size: 15px;
          width: 18px;
          text-align: center;
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}