export const GENDERS = [
  "male",
  "female",
  "non-binary",
  "prefer-not-to-say",
] as const;

export const PURPOSES_OF_USE = [
  "learn-and-grow",
  "find-calm",
  "stay-consistent",
  "go-deeper",
  "process-ideas",
  "explore-stories",
  "other",
] as const;

export const COMMUNICATION_PREFERENCES = [
  "warm-and-casual",
  "professional",
  "motivational",
  "gentle-and-slow",
] as const;

export type Gender = typeof GENDERS[number];
export type PurposeOfUse = typeof PURPOSES_OF_USE[number];
export type CommunicationPreference = typeof COMMUNICATION_PREFERENCES[number];

// Lightweight subset passed per chat request (no credentials)
export type ChatUserContext = {
  name:                    string;   // from user.name
  age:                     number;   // from userProfiles.age
  gender:                  Gender;
  purposeOfUse:            PurposeOfUse;
  customPurpose?:          string | null;
  communicationPreference: CommunicationPreference;
};
