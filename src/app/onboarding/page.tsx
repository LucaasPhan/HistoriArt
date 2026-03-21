// app/onboarding/page.tsx
// Orchestrates the 3-step onboarding flow.

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import OnboardingShell  from "@/features/onboarding/components/OnboardingShell";
import StepPersonal     from "@/features/onboarding/components/StepPersonal";
import StepPurpose      from "@/features/onboarding/components/StepPurpose";
import StepCommStyle    from "@/features/onboarding/components/StepCommStyle";
import "./onboarding.css";
import { STEPS } from "@/features/onboarding/components/constants";
import type { OnboardingData } from "@/features/onboarding/components/types";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";

const EMPTY: OnboardingData = {
  firstName:               "",
  lastName:                "",
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
  if (step === 0) return data.firstName.trim().length > 0 && data.lastName.trim().length > 0 && isValidAge(data.age) && data.gender !== "";
  if (step === 1) {
    if (data.purposeOfUse === "other") return (data.customPurpose || "").trim().length > 0;
    return data.purposeOfUse !== "";
  }
  if (step === 2) return data.communicationPreference !== "";
  return false;
}

export default function OnboardingPage() {
  const router = useRouter();
  const transitionRef = useRef<HTMLDivElement>(null);
  const [step,   setStep]   = useState(0);
  const [data,   setData]   = useState<OnboardingData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const set = <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const saveOnboardingMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      age: number;
      gender: string;
      purposeOfUse: string;
      customPurpose: string;
      communicationPreference: string;
    }) => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Try to surface the API-provided error message.
        let message = "Failed to save profile.";
        try {
          const json = (await res.json()) as { error?: string };
          if (json?.error) message = json.error;
        } catch {
          // ignore JSON parsing errors
        }
        throw new Error(message);
      }

      return (await res.json()) as { success: true };
    },
    onMutate: () => {
      setSaving(true);
      setError(null);
    },
    onSuccess: () => {
      // RootLayout computes `onboardingComplete` on the server; refreshing
      // ensures the guard gets the updated profile before navigating.
      router.refresh();
      transitionRef.current?.click();
      setSaving(false);
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSaving(false);
    },
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — persist and redirect.
    saveOnboardingMutation.mutate({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      age: Number(data.age),
      gender: data.gender,
      purposeOfUse: data.purposeOfUse,
      customPurpose: data.customPurpose ?? "",
      communicationPreference: data.communicationPreference,
    });
  };

  const stepProps = { data, set };

  return (
   <>
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
    </OnboardingShell>
    <PageMountSignaler/>
    <TransitionLink href="/library" ref={transitionRef} className="hidden" />
   </>
  );
}