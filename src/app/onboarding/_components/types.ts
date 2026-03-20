// components/onboarding/onboarding.types.ts

export type Gender =
  | "male"
  | "female"
  | "non-binary"
  | "prefer-not-to-say";

export type PurposeOfUse =
  | "learn-and-grow"
  | "find-calm"
  | "stay-consistent"
  | "go-deeper"
  | "process-ideas"
  | "explore-stories"
  | "other";

export type CommunicationPreference =
  | "warm-and-casual"
  | "professional"
  | "motivational"
  | "gentle-and-slow";

export interface OnboardingData {
  age:                     string;
  gender:                  Gender | "";
  purposeOfUse:            PurposeOfUse | "";
  communicationPreference: CommunicationPreference | "";
}

export interface StepConfig {
  id:       string;
  title:    string;
  subtitle: string;
}