// components/onboarding/OnboardingShell.tsx
// Shared layout: grain background, progress bar, step dots, card wrapper.

import type { ReactNode } from "react";
import type { StepConfig } from "./onboarding.types";

interface Props {
  steps:    StepConfig[];
  step:     number;
  children: ReactNode;
}

export default function OnboardingShell({ steps, step, children }: Props) {
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <>
      <style>{STYLES}</style>

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

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream:     #f7f3ed;
  --parchment: #ede8df;
  --sand:      #d6cfc3;
  --bark:      #8c7b6b;
  --ink:       #2d2520;
  --sage:      #6b8c7a;
  --sage-lt:   #e8f0ec;
  --radius:    14px;
  --shadow:    0 4px 28px rgba(45,37,32,0.10);
}

.ob-bg {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

/* Grain overlay */
.ob-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.ob-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  animation: ob-fadeUp 0.55s ease both;
}

@keyframes ob-fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Progress */
.ob-track {
  height: 3px;
  background: var(--sand);
  border-radius: 99px;
  margin-bottom: 36px;
  overflow: hidden;
}
.ob-fill {
  height: 100%;
  background: var(--sage);
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}

/* Card */
.ob-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--parchment);
  animation: ob-stepIn 0.35s ease both;
}
@keyframes ob-stepIn {
  from { opacity: 0; transform: translateX(14px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Dots */
.ob-dots {
  display: flex;
  gap: 7px;
  justify-content: center;
  margin-top: 20px;
}
.ob-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--sand);
  transition: background 0.3s, transform 0.3s;
}
.ob-dot--active {
  background: var(--sage);
  transform: scale(1.3);
}

/* ── Shared typography inside cards ── */
.ob-step-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--bark);
  margin-bottom: 8px;
}
.ob-title {
  font-family: 'Lora', serif;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 400;
  color: var(--ink);
  line-height: 1.3;
  margin-bottom: 5px;
}
.ob-subtitle {
  font-size: 13px;
  color: var(--bark);
  font-weight: 300;
  margin-bottom: 28px;
  line-height: 1.5;
}
.ob-section {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--bark);
  margin: 20px 0 10px;
}

/* ── Shared chip / card primitives ── */
.ob-chip {
  border: 1.5px solid var(--sand);
  border-radius: var(--radius);
  padding: 11px 14px;
  cursor: pointer;
  background: var(--cream);
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ink);
  user-select: none;
}
.ob-chip:hover, .ob-chip--active {
  border-color: var(--sage);
  background: var(--sage-lt);
}
.ob-chip--active { color: var(--sage); font-weight: 500; }

/* ── Footer nav ── */
.ob-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
}
.ob-back {
  background: none;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--bark);
  cursor: pointer;
  padding: 10px 0;
  transition: color 0.18s;
}
.ob-back:hover  { color: var(--ink); }
.ob-back:disabled { opacity: 0; pointer-events: none; }

.ob-next {
  background: var(--sage);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 13px 26px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.ob-next:disabled { opacity: 0.35; cursor: not-allowed; }
.ob-next:not(:disabled):hover {
  background: #5a7a68;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(107,140,122,0.32);
}

@media (max-width: 480px) {
  .ob-card { padding: 28px 18px; }
}
`;