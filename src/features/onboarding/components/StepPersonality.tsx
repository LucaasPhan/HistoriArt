import { PERSONALITIES } from "./constants";
import type { OnboardingData } from "./types";

interface Props {
  data: OnboardingData;
  set: <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepPersonality({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 4 of 6</p>
      <h1 className="ob-title">Your reading persona</h1>
      <p className="ob-subtitle">How would other people describe you?</p>

      <div className="spu-grid">
        {PERSONALITIES.map((p) => {
          const active = data.personality === p.value;
          return (
            <div
              key={p.value}
              className={`spu-card${active ? " spu-card--active" : ""}`}
              onClick={() => set("personality", p.value)}
            >
              <span className="spu-emoji">{p.emoji}</span>
              <span className="spu-label">{p.label}</span>
              <span className="spu-desc">{p.description}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
