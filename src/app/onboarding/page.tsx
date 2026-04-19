"use client";

import { useTranslation } from "@/lib/i18n";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./onboarding.css";

import PageMountSignaler from "@/components/PageMountSignaler";
import OnboardingShell from "@/features/onboarding/components/OnboardingShell";
import {
  StepCommStyle,
  StepPersonal,
  StepPersonality,
  StepPurpose,
  StepReadingGoal,
} from "@/features/onboarding/components/OnboardingSteps";
import { EMPTY } from "@/features/onboarding/constants";
import type { OnboardingData } from "@/features/onboarding/types";

function isValidAge(age: string) {
  const n = Number(age);
  return age !== "" && Number.isInteger(n) && n >= 12 && n <= 99;
}

function canAdvance(step: number, data: OnboardingData): boolean {
  if (step === 0)
    return (
      data.firstName.trim().length > 0 &&
      data.lastName.trim().length > 0 &&
      isValidAge(data.age) &&
      data.gender !== ""
    );
  if (step === 1) {
    if (data.purposeOfUse.includes("other")) return (data.customPurpose || "").trim().length > 0;
    return data.purposeOfUse.length > 0;
  }
  if (step === 2) return data.readingGoal.length > 0;
  if (step === 3) return data.personality !== "";
  if (step === 4) return data.communicationPreference !== "";
  return false;
}

export default function OnboardingPage() {
  const router = useRouter();
  const transitionRef = useRef<HTMLAnchorElement>(null);
  const [step, setStep] = useState(0);
  const [startedAtStep1, setStartedAtStep1] = useState(false);
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const STEPS = [
    { id: "personal" },
    { id: "purpose" },
    { id: "reading_goal" },
    { id: "personality" },
    { id: "style" },
  ];

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
          const _purposes = json.purposeOfUse
            ? Array.isArray(json.purposeOfUse)
              ? json.purposeOfUse
              : [json.purposeOfUse]
            : [];
          const validPurposes = _purposes.filter((p: string) =>
            ["learn-and-grow", "academic", "explore-stories", "media-experience", "other"].includes(
              p,
            ),
          );

          const _goals = json.readingGoal
            ? Array.isArray(json.readingGoal)
              ? json.readingGoal
              : [json.readingGoal]
            : [];
          const validGoals = _goals.filter((g: string) =>
            ["facts", "insights", "epic", "roots"].includes(g),
          );

          const _personality = ["researcher", "storyteller", "student", "explorer"].includes(
            json.personality,
          )
            ? json.personality
            : "";
          const _comm = ["professor", "narrator", "guide", "quick"].includes(
            json.communicationPreference,
          )
            ? json.communicationPreference
            : "";

          setData((prev) => ({
            ...prev,
            firstName: json.firstName || "",
            lastName: json.lastName || "",
            age: json.age?.toString() || "",
            gender: json.gender || "",
            purposeOfUse: validPurposes,
            customPurpose: json.customPurpose || "",
            readingGoal: validGoals,
            personality: _personality,
            communicationPreference: _comm,
          }));
        }
      })
      .catch(() => {});
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
      communicationPreference: string;
    }) => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save profile.";
        try {
          const json = (await res.json()) as { error?: string };
          if (json?.error) message = json.error;
        } catch {
          // ignore
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
      router.refresh();
      // wait a moment for refresh before pushing
      setTimeout(() => {
        router.push("/library");
      }, 100);
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

    saveOnboardingMutation.mutate({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      age: Number(data.age),
      gender: data.gender,
      purposeOfUse: data.purposeOfUse,
      customPurpose: data.customPurpose ?? "",
      readingGoal: data.readingGoal,
      personality: data.personality,
      communicationPreference: data.communicationPreference,
    });
  };

  const stepProps = { data, set };

  return (
    <>
      <OnboardingShell steps={STEPS} step={step}>
        {step === 0 && <StepPersonal {...stepProps} />}
        {step === 1 && <StepPurpose {...stepProps} />}
        {step === 2 && <StepReadingGoal {...stepProps} />}
        {step === 3 && <StepPersonality {...stepProps} />}
        {step === 4 && <StepCommStyle {...stepProps} />}

        {error && <p className="ob-error">{error}</p>}

        <div className="ob-footer">
          <button
            className="ob-back"
            disabled={startedAtStep1 ? step <= 1 : step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            {t("ob.back")}
          </button>
          <button
            className="ob-next"
            disabled={!canAdvance(step, data) || saving}
            onClick={handleNext}
          >
            {saving ? t("ob.saving") : step === STEPS.length - 1 ? t("ob.start") : t("ob.continue")}
          </button>
        </div>
      </OnboardingShell>
      <PageMountSignaler />
    </>
  );
}
