import { CommunicationPreference, Gender, PurposeOfUse } from "@/drizzle/constants";

export interface OnboardingData {
  firstName:               string;
  lastName:                string;
  age:                     string;
  gender:                  Gender | "";
  purposeOfUse:            string[];
  customPurpose?:          string;
  readingGoal:             string[];
  personality:             string;
  communicationPreference: CommunicationPreference | "";
}
