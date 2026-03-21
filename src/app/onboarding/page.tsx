// app/onboarding/page.ts
// Orchestrates the 3-step onboarding flow.


"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import OnboardingShell from "@/features/onboarding/components/OnboardingShell";
import StepPersonal from "@/features/onboarding/components/StepPersonal";
import StepPurpose from "@/features/onboarding/components/StepPurpose";
import StepReadingGoal from "@/features/onboarding/components/StepReadingGoal";
import StepPersonality from "@/features/onboarding/components/StepPersonality";
import StepCommStyle from "@/features/onboarding/components/StepCommStyle";
import StepScienceInfo from "@/features/onboarding/components/StepScienceInfo";
import "./onboarding.css";
import { STEPS } from "@/features/onboarding/components/constants";
import type { OnboardingData } from "@/features/onboarding/components/types";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";

const EMPTY: OnboardingData = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  purposeOfUse: [],
  customPurpose: "",
  readingGoal: [],
  personality: "",
  genZMode: false,
  communicationPreference: "",
};

function isValidAge(age: string) {
  const n = Number(age);
  return age !== "" && Number.isInteger(n) && n >= 16 && n <= 99;
}

function canAdvance(step: number, data: OnboardingData): boolean {
  if (step === 0) return data.firstName.trim().length > 0 && data.lastName.trim().length > 0 && isValidAge(data.age) && data.gender !== "";
  if (step === 1) {
    if (data.purposeOfUse.includes("other")) return (data.customPurpose || "").trim().length > 0;
    return data.purposeOfUse.length > 0;
  }
  if (step === 2) return data.readingGoal.length > 0;
  if (step === 3) return data.personality !== "";
  if (step === 4) return data.communicationPreference !== "";
  if (step === 5) return true;
  return false;
}

export default function OnboardingPage() {
  const router = useRouter();
  const transitionRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [startedAtStep1, setStartedAtStep1] = useState(false);
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we should skip the first step via URL param
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("step") === "1") {
        setStep(1);
        setStartedAtStep1(true);
      }
    }

    // Fetch existing profile to populate defaults (especially important if skipping step 0
    // so we don't save empty strings for name/age/gender).
    fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json && !json.error) {
          setData((prev) => ({
            ...prev,
            firstName: json.firstName || "",
            lastName: json.lastName || "",
            age: json.age?.toString() || "",
            gender: json.gender || "",
            purposeOfUse: json.purposeOfUse ? (Array.isArray(json.purposeOfUse) ? json.purposeOfUse : [json.purposeOfUse]) : [],
            customPurpose: json.customPurpose || "",
            readingGoal: json.readingGoal || [],
            personality: json.personality || "",
            genZMode: json.genZMode || false,
            communicationPreference: json.communicationPreference || "",
          }));
        }
      })
      .catch(() => { });
  }, []);

  const set = <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const saveOnboardingMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      age: number;
      gender: string;
      purposeOfUse: string[];
      customPurpose: string;
      readingGoal: string[];
      personality: string;
      genZMode: boolean;
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
      readingGoal: data.readingGoal,
      personality: data.personality,
      genZMode: data.genZMode,
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
        {step === 2 && <StepReadingGoal {...stepProps} />}
        {step === 3 && <StepPersonality {...stepProps} />}
        {step === 4 && <StepCommStyle {...stepProps} />}
        {step === 5 && <StepScienceInfo {...stepProps} />}

        {/* Error */}
        {error && <p className="ob-error">{error}</p>}

        <div className="ob-footer">
          <button
            className="ob-back"
            disabled={startedAtStep1 ? step <= 1 : step === 0}
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
      <PageMountSignaler />
      <TransitionLink href="/library" ref={transitionRef} className="hidden" />
    </>
  );
}