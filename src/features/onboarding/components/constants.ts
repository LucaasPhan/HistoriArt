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
    subtitle: "Select all that apply to your reading journey.",
  },
  {
    id:       "reading_goal",
    title:    "What are you seeking?",
    subtitle: "What do you most want to get out of reading?",
  },
  {
    id:       "personality",
    title:    "Your reading persona",
    subtitle: "How would other people describe you?",
  },
  {
    id:       "style",
    title:    "How do you like to talk?",
    subtitle: "We'll match your pace and tone.",
  },
  {
    id:       "science",
    title:    "Backed by Science",
    subtitle: "Science shows reading calms the body and mind.",
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

export const READING_GOALS = [
  { value: "knowledge", label: "Knowledge", description: "Learning new facts and skills", emoji: "🧠" },
  { value: "serenity", label: "Serenity", description: "Finding peace and reducing stress", emoji: "🧘" },
  { value: "ideas", label: "Ideas", description: "Sparking creativity and new thoughts", emoji: "💡" },
  { value: "escape", label: "Escape", description: "Getting lost in another world", emoji: "🚀" },
];

export const PERSONALITIES = [
  { value: "chill", label: "Chill", description: "Relaxed and easygoing", emoji: "😎" },
  { value: "analytical", label: "Analytical", description: "Logical and detail-oriented", emoji: "🧐" },
  { value: "creative", label: "Creative", description: "Imaginative and expressive", emoji: "🎨" },
  { value: "intense", label: "Intense", description: "Passionate and sometimes short-tempered", emoji: "🔥" },
];