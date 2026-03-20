// components/onboarding/onboarding.constants.ts

import type {
  Gender,
  PurposeOfUse,
  CommunicationPreference,
  StepConfig,
} from "./types";

export const STEPS: StepConfig[] = [
  {
    id:       "personal",
    title:    "A little about you",
    subtitle: "Helps us speak your language.",
  },
  {
    id:       "purpose",
    title:    "What brings you here?",
    subtitle: "What do you hope to get out of reading with a companion?",
  },
  {
    id:       "style",
    title:    "How do you like to talk?",
    subtitle: "We'll match your pace and tone.",
  },
];

export const GENDERS: { value: Gender; label: string; icon: string }[] = [
  { value: "male",               label: "Male",               icon: "♂" },
  { value: "female",             label: "Female",             icon: "♀" },
  { value: "non-binary",         label: "Non-binary",         icon: "◈" },
  { value: "prefer-not-to-say",  label: "Prefer not to say",  icon: "○" },
];

export const PURPOSES: {
  value:       PurposeOfUse;
  label:       string;
  description: string;
  emoji:       string;
}[] = [
  {
    value:       "learn-and-grow",
    label:       "Learn & grow",
    description: "Expand my knowledge and skills through books",
    emoji:       "🌱",
  },
  {
    value:       "find-calm",
    label:       "Find calm",
    description: "Use reading to slow down and decompress",
    emoji:       "🍃",
  },
  {
    value:       "stay-consistent",
    label:       "Build a habit",
    description: "Read more regularly and stay on track",
    emoji:       "📅",
  },
  {
    value:       "go-deeper",
    label:       "Go deeper",
    description: "Understand books at a richer level with AI",
    emoji:       "🔍",
  },
  {
    value:       "process-ideas",
    label:       "Process ideas",
    description: "Think through concepts and reflect as I read",
    emoji:       "💡",
  },
  {
    value:       "explore-stories",
    label:       "Explore stories",
    description: "Enjoy fiction and get more out of narratives",
    emoji:       "📖",
  },
  {
    value:       "other",
    label:       "My own reasons",
    description: "I'll explore freely",
    emoji:       "○",
  },
];

export const COMM_PREFS: {
  value:       CommunicationPreference;
  label:       string;
  description: string;
}[] = [
  {
    value:       "warm-and-casual",
    label:       "Warm & casual",
    description: "Like chatting with a thoughtful friend",
  },
  {
    value:       "professional",
    label:       "Calm & structured",
    description: "Measured, clear, and evidence-based",
  },
  {
    value:       "motivational",
    label:       "Energetic",
    description: "Encouraging, action-oriented, upbeat",
  },
  {
    value:       "gentle-and-slow",
    label:       "Soft & slow",
    description: "Patient, validating — no rush at all",
  },
];