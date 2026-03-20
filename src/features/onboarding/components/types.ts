// components/onboarding/onboarding.types.ts

import { CommunicationPreference, Gender, PurposeOfUse } from "@/drizzle/constants";

export type { Gender, PurposeOfUse, CommunicationPreference } from "@/drizzle/constants";

export interface OnboardingData {
  age:                     string;
  gender:                  Gender | "";
  purposeOfUse:            PurposeOfUse | "";
  customPurpose?:          string;
  communicationPreference: CommunicationPreference | "";
}

export interface StepConfig {
  id:       string;
  title:    string;
  subtitle: string;
}