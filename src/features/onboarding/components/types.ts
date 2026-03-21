// components/onboarding/onboarding.types.ts

import { CommunicationPreference, Gender, PurposeOfUse } from "@/drizzle/constants";

export type { Gender, PurposeOfUse, CommunicationPreference } from "@/drizzle/constants";

export interface OnboardingData {
  firstName:               string;
  lastName:                string;
  age:                     string;
  gender:                  Gender | "";
  purposeOfUse:            string[];
  customPurpose?:          string;
  readingGoal:             string[];
  personality:             string;
  genZMode:                boolean;
  communicationPreference: CommunicationPreference | "";
}

export interface StepConfig {
  id:       string;
  title:    string;
  subtitle: string;
}