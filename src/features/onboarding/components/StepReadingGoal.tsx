import { READING_GOALS } from "./constants";
import type { OnboardingData } from "./types";

interface Props {
  data: OnboardingData;
  set: <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepReadingGoal({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 3 of 6</p>
      <h1 className="ob-title">What are you seeking?</h1>
      <p className="ob-subtitle">Select all that apply to what you most want out of reading.</p>

      <div className="spu-grid">
        {READING_GOALS.map((g) => {
          const active = data.readingGoal.includes(g.value);
          return (
            <div
              key={g.value}
              className={`spu-card${active ? " spu-card--active" : ""}`}
              onClick={() => {
                const current = new Set(data.readingGoal);
                if (current.has(g.value)) {
                  current.delete(g.value);
                } else {
                  current.add(g.value);
                }
                set("readingGoal", Array.from(current));
              }}
            >
              <span className="spu-emoji">{g.emoji}</span>
              <span className="spu-label">{g.label}</span>
              <span className="spu-desc">{g.description}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
