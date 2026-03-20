// components/onboarding/OnboardingShell.tsx
// Shared layout: grain background, progress bar, step dots, card wrapper.

import type { ReactNode } from "react";
import type { StepConfig } from "./types";

interface Props {
  steps:    StepConfig[];
  step:     number;
  children: ReactNode;
}

export default function OnboardingShell({ steps, step, children }: Props) {
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <>
      <div className="ob-bg">
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
    </>
  );
}