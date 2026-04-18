export const GENDERS = ["male", "female", "non-binary", "prefer-not-to-say"] as const;

export const PURPOSES_OF_USE = [
  "learn-and-grow",
  "academic",
  "explore-stories",
  "media-experience",
  "other",
] as const;

export const COMMUNICATION_PREFERENCES = ["professor", "narrator", "guide", "quick"] as const;

export type Gender = (typeof GENDERS)[number];
export type PurposeOfUse = (typeof PURPOSES_OF_USE)[number];
export type CommunicationPreference = (typeof COMMUNICATION_PREFERENCES)[number];

// Lightweight subset passed per chat request (no credentials)
export type ChatUserContext = {
  firstName: string;
  lastName: string;
  age: number; // from userProfiles.age
  gender: Gender;
  purposeOfUse: string;
  customPurpose?: string | null;
  readingGoal?: string | null;
  personality?: string | null;
  communicationPreference: CommunicationPreference;
};
