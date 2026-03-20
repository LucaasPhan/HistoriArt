// app/onboarding/page.tsx
// Orchestrates the 3-step onboarding flow.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import OnboardingShell  from "./_components/OnboardingShell";
import StepPersonal     from "./_components/StepPersonal";
import StepPurpose      from "./_components/StepPurpose";
import StepCommStyle    from "./_components/StepCommStyle";

import { STEPS } from "./_components/constants";
import type { OnboardingData } from "./_components/types";

const EMPTY: OnboardingData = {
  age:                     "",
  gender:                  "",
  purposeOfUse:            "",
  customPurpose:           "",
  communicationPreference: "",
};

function isValidAge(age: string) {
  const n = Number(age);
  return age !== "" && Number.isInteger(n) && n >= 16 && n <= 99;
}

function canAdvance(step: number, data: OnboardingData): boolean {
  if (step === 0) return isValidAge(data.age) && data.gender !== "";
  if (step === 1) {
    if (data.purposeOfUse === "other") return (data.customPurpose || "").trim().length > 0;
    return data.purposeOfUse !== "";
  }
  if (step === 2) return data.communicationPreference !== "";
  return false;
}

export default function OnboardingPage() {
  const router  = useRouter();
  const [step,   setStep]   = useState(0);
  const [data,   setData]   = useState<OnboardingData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const set = <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — persist and redirect
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:                     Number(data.age),
          gender:                  data.gender,
          purposeOfUse:            data.purposeOfUse,
          customPurpose:           data.customPurpose,
          communicationPreference: data.communicationPreference,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile.");
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const stepProps = { data, set };

  return (
    <OnboardingShell steps={STEPS} step={step}>
      {/* Step content */}
      {step === 0 && <StepPersonal  {...stepProps} />}
      {step === 1 && <StepPurpose   {...stepProps} />}
      {step === 2 && <StepCommStyle {...stepProps} />}

      {/* Error */}
      {error && <p className="ob-error">{error}</p>}

      {/* Footer nav — lives inside the card */}
      <div className="ob-footer">
        <button
          className="ob-back"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          ← Back
        </button>
        <button
          className="ob-next"
          disabled={!canAdvance(step, data) || saving}
          onClick={handleNext}
        >
          {saving
            ? "Saving…"
            : step === STEPS.length - 1
            ? "Let's begin →"
            : "Continue →"}
        </button>
      </div>

      <style>{`
        .ob-error {
          margin-top: 14px;
          font-size: 13px;
          color: #b5603a;
          text-align: center;
        }
      `}</style>
    </OnboardingShell>
  );
}