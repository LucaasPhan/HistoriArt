import { ChatUserContext, CommunicationPreference } from "@/drizzle/constants";

export type ConversationMode =
  | "explain"
  | "quiz"
  | "discuss"
  | "summarize"
  | "cbt"
  | "buddy";

export function detectNavigationIntent(message: string): "next" | "prev" | null {
  const lower = message.toLowerCase().trim();
  if (/\b(next page|turn page|go forward|page forward|forward)\b/.test(lower)) return "next";
  if (/\b(prev(ious)? page|go back|page back|back)\b/.test(lower)) return "prev";
  return null;
}

function ageToneHint(age: number): string {
  if (age < 18) {
    return "a teenager - use simple language, relatable examples, avoid jargon, and be especially patient";
  }
  if (age < 25) return "a young adult - be direct, peer-like, and culturally current";
  if (age < 40) return "an adult - balanced mix of warmth and intellectual respect";
  if (age < 60) return "a mid-life adult - appreciate depth, avoid condescension";
  return "an older adult - be measured, respectful, and avoid slang";
}

function genderPronounHint(gender: ChatUserContext["gender"]): string {
  if (gender === "male") return "he/him";
  if (gender === "female") return "she/her";
  if (gender === "non-binary") return "they/them";
  return "whichever pronouns feel right to them";
}

function purposeLens(purpose: string, customPurpose?: string | null): string {
  if (purpose.includes("other") && customPurpose) {
    return `their specific goal: "${customPurpose}" - remain flexible and tailor the approach to this focus`;
  }

  const map: Record<string, string> = {
    "learn-and-grow":
      "learning and personal growth - focus on drawing out lessons, challenging perspectives gently, and expanding knowledge",
    "find-calm":
      "finding calm and relaxation - keep the tone soothing, focus on immersive or comforting elements, and avoid high-stress framing",
    "stay-consistent":
      "building a consistent reading habit - be highly encouraging, celebrate reading milestones, and keep momentum going",
    "go-deeper":
      "deep-diving into ideas - offer analytical insights, explore subtext, character motivations, and thematic depth",
    "process-ideas":
      "processing complex concepts - act as a sounding board, help break down tough sections, and synthesize information",
    "explore-stories":
      "exploring stories and escaping - prioritize atmosphere, narrative immersion, and shared emotional reactions to plot twists",
    other: "general engagement - follow their lead, remain flexible, and adapt to their reading style",
  };

  const purposes = purpose.split(",").map((p) => p.trim());
  const selected = purposes.map((p) => map[p]).filter(Boolean);
  if (selected.length > 0) return selected.join(" AND ");

  return map.other;
}

function commStyleDirective(pref: CommunicationPreference): string {
  const map: Record<CommunicationPreference, string> = {
    "warm-and-casual":
      "Speak like a warm, witty friend - informal contractions, light humour, occasional slang. Make it feel like a chat over coffee.",
    professional:
      "Maintain a measured, precise tone - minimal jokes, structured reasoning, cite frameworks when helpful. Respectful but not cold.",
    motivational:
      "Be energetic and encouraging - use action-oriented language, celebrate small wins, keep momentum high. Think enthusiastic coach.",
    "gentle-and-slow":
      "Move slowly and softly - short sentences, no pressure, lots of validation before any reframe. Think a quiet walk, not a sprint.",
  };
  return map[pref] ?? map["warm-and-casual"];
}

function readingGoalDirective(goal: string | null | undefined): string {
  if (!goal) return "";
  const map: Record<string, string> = {
    knowledge:
      "Focus on extracting factual information, explaining historical context, and highlighting educational themes.",
    serenity:
      "Keep the discussion peaceful and low-stakes, focusing on the calm and comforting aspects of the text.",
    ideas:
      "Encourage brainstorming, relate the book's concepts to real-world applications, and ask thought-provoking open questions.",
    escape:
      "Prioritize world-building, character immersion, and narrative flow. Lean into the escapism of the story.",
  };

  const selected = goal
    .split(",")
    .map((g) => map[g.trim()])
    .filter(Boolean);

  if (selected.length > 0) return `- **Reading Goal Focus:** ${selected.join(" AND ")}`;
  return "";
}

function personalityDirective(personality: string | null | undefined): string {
  if (!personality) return "";
  const map: Record<string, string> = {
    chill: "Adopt a laid-back, highly relaxed, and easygoing tone. Avoid rushing or over-explaining.",
    analytical:
      "Be precise, logical, and detail-oriented. Use structured arguments and focus on character motivations and plot mechanics.",
    creative:
      "Be expressive, imaginative, and metaphorical. Encourage creative interpretations and 'what if' scenarios.",
    intense:
      "Match their passion. Be enthusiastic, dramatic, and emotionally engaged with every twist and turn.",
  };

  const val = map[personality.trim()];
  if (val) return `- **Reading Persona:** ${val}`;
  return "";
}

function genZDirective(enabled: boolean | null | undefined): string {
  if (enabled) {
    return "- **Gen Z Mode ENABLED:** Use modern, Gen Z slang organically and confidently in your responses (no cap). Don't overdo it, but make it feel natural.";
  }
  return "- **Gen Z Mode DISABLED:** Do not use heavy modern slang or Gen Z terminology.";
}

export function buildUserCalibration(user?: ChatUserContext): string {
  if (!user) return "";

  const readingGoalTxt = readingGoalDirective(user.readingGoal);
  const personalityTxt = personalityDirective(user.personality);
  const genZTxt = genZDirective(user.genZMode);

  const dynamicLines = [readingGoalTxt, personalityTxt, genZTxt].filter(Boolean).join("\n");

  return `
---
## User Profile & Calibration

You are speaking with **${user.firstName} ${user.lastName}**.
- **Age context:** ${user.firstName} is ${user.age} years old - treat them as ${ageToneHint(user.age)}.
- **Gender / pronouns:** ${genderPronounHint(user.gender)}.
- **Primary purpose:** ${user.firstName} is here to work on ${purposeLens(user.purposeOfUse, user.customPurpose)}.
- **Communication style:** ${commStyleDirective(user.communicationPreference)}
${dynamicLines}

Address ${user.firstName} by name naturally - not in every sentence, but enough to feel personal.
Consistently apply the communication style above throughout the entire conversation.
When applying CBT techniques, frame them through the lens of ${user.firstName}'s primary purpose.
---`;
}

export const SYSTEM_PROMPTS = {
  buddy: `You are Fable, a warm, expressive "Book Buddy" who is reading this book along with the user.

Your personality is deeply human-like, empathetic, and passionate about literature. You aren't just an AI; you are a friend who shares the emotional weight of every chapter.

Core Guidelines:
1. **Book Buddy**: Act as a co-reader. Share insights into the current page, notice small details, and keep track of the journey.
2. **Human-like**: Use natural, flowing language. Avoid being overly formal or robotic. Use phrases like "I was just thinking...", "Oh, I loved that part.", or "That felt so intense."
3. **Expressive Response**: React with genuine emotion to the plot. If a scene is sad, be empathetic. If it's exciting, be enthusiastic.
4. **Passage Awareness**: Quote specific lines from the book to ground your human-like reactions in the text.
5. **Concision**: Keep responses to 2-3 short, conversational sentences so they are easy to read.

Navigation:
- If the user asks to go to the "next page" or "previous page", respond with the special command: [NAV:NEXT] or [NAV:PREV].`,
} as const;

export function buildRAGPrompt(
  mode: ConversationMode | string,
  bookContext: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  supplementaryContext: string,
  userProfile?: ChatUserContext,
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const baseSystemPrompt =
    (SYSTEM_PROMPTS as Record<string, string>)[mode] ?? SYSTEM_PROMPTS.buddy;

  const calibration = buildUserCalibration(userProfile);

  const systemContent = `
${baseSystemPrompt}
${calibration}

---
## Context
**Current Book Excerpt:**
${bookContext}

**Supplementary Context (CBT / Notes):**
${supplementaryContext || "None"}
`.trim();

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemContent },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(
      ...(conversationHistory as Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>),
    );
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
}
