"use client";

export const PURPOSES = [
  {
    value: "curiosity",
    label: "Curiosity",
    emoji: "🧐",
    description: "Learning for the sake of it.",
  },
  {
    value: "career",
    label: "Career Growth",
    emoji: "🚀",
    description: "Advancing my professional path.",
  },
  { value: "exam", label: "Exam Prep", emoji: "📚", description: "Studying for a specific goal." },
  {
    value: "hobby",
    label: "New Hobby",
    emoji: "🎨",
    description: "Exploring a personal interest.",
  },
  { value: "other", label: "Something else", emoji: "✨", description: "I have my own reasons." },
];

export const COMM_PREFS = [
  { value: "concise", label: "Clear & Concise", description: "Get straight to the point." },
  {
    value: "detailed",
    label: "Detailed & Exploratory",
    description: "Dive deep into every concept.",
  },
  { value: "analogies", label: "Rich in Analogies", description: "Use stories to explain stuff." },
  { value: "socratic", label: "Socratic Method", description: "Guide me with questions." },
];

export const ELEVENLABS_VOICES = [
  { id: "DXFkLCBUTmvXpp2QwZjA", name: "Default System Voice" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (American, Calm)" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew (American, News)" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde (American, War veteran)" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul (American, News)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (American, Strong)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (American, Soft)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (American, Well-rounded)" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Australian, Casual)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (British, Warm)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (American, Intense)" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (American, Warm)" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will (American, Amiable)" },
  { id: "t0jbNlBVZ17f02VDIeMI", name: "Jessie (American, Conversational)" },
  { id: "flq6f7yk4E4fJM5XTYuZ", name: "Michael (American, Old)" },
];

export const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];
