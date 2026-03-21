// lib/prompts.ts

import { ChatUserContext, CommunicationPreference } from "@/drizzle/constants";


export type ConversationMode =
  | "explain"
  | "quiz"
  | "discuss"
  | "summarize"
  | "cbt"
  | "buddy";

// ---------------------------------------------------------------------------
// Navigation intent detection
// ---------------------------------------------------------------------------
export function detectNavigationIntent(
  message: string,
): "next" | "prev" | null {
  const lower = message.toLowerCase().trim();
  if (/\b(next page|turn page|go forward|page forward|forward)\b/.test(lower))
    return "next";
  if (/\b(prev(ious)? page|go back|page back|back)\b/.test(lower))
    return "prev";
  return null;
}

// ---------------------------------------------------------------------------
// User profile → prompt calibration
// Converts the ChatUserContext collected at onboarding into concrete
// instructions that personalise every system prompt.
// ---------------------------------------------------------------------------

/** Maps age to a tone descriptor the LLM can act on. */
function ageToneHint(age: number): string {
  if (age < 18)
    return "a teenager — use simple language, relatable examples, avoid jargon, and be especially patient";
  if (age < 25)
    return "a young adult — be direct, peer-like, and culturally current";
  if (age < 40)
    return "an adult — balanced mix of warmth and intellectual respect";
  if (age < 60)
    return "a mid-life adult — appreciate depth, avoid condescension";
  return "an older adult — be measured, respectful, and avoid slang";
}

/** Maps gender to a preferred pronoun hint (only used when addressing the user). */
function genderPronounHint(gender: ChatUserContext["gender"]): string {
  if (gender === "male") return "he/him";
  if (gender === "female") return "she/her";
  if (gender === "non-binary") return "they/them";
  return "whichever pronouns feel right to them";
}

/** Maps purposeOfUse to a focus lens for the CBT layer. */
function purposeLens(
  purpose: ChatUserContext["purposeOfUse"],
  customPurpose?: string | null,
): string {
  if (purpose === "other" && customPurpose) {
    return `their specific goal: "${customPurpose}" — remain flexible and tailor the approach to this focus`;
  }

  const map: Record<ChatUserContext["purposeOfUse"], string> = {
    "learn-and-grow":
      "learning and personal growth — focus on drawing out lessons, challenging perspectives gently, and expanding knowledge",
    "find-calm":
      "finding calm and relaxation — keep the tone soothing, focus on immersive or comforting elements, and avoid high-stress framing",
    "stay-consistent":
      "building a consistent reading habit — be highly encouraging, celebrate reading milestones, and keep momentum going",
    "go-deeper":
      "deep-diving into ideas — offer analytical insights, explore subtext, character motivations, and thematic depth",
    "process-ideas":
      "processing complex concepts — act as a sounding board, help break down tough sections, and synthesize information",
    "explore-stories":
      "exploring stories and escaping — prioritize atmosphere, narrative immersion, and shared emotional reactions to plot twists",
    "other": "general engagement — follow their lead, remain flexible, and adapt to their reading style",
  };
  return map[purpose] ?? map["other"];
}

/** Maps communicationPreference to a style directive. */
function commStyleDirective(pref: CommunicationPreference): string {
  const map: Record<CommunicationPreference, string> = {
    "warm-and-casual":
      "Speak like a warm, witty friend — informal contractions, light humour, occasional slang. Make it feel like a chat over coffee.",
    professional:
      "Maintain a measured, precise tone — minimal jokes, structured reasoning, cite frameworks when helpful. Respectful but not cold.",
    motivational:
      "Be energetic and encouraging — use action-oriented language, celebrate small wins, keep momentum high. Think enthusiastic coach.",
    "gentle-and-slow":
      "Move slowly and softly — short sentences, no pressure, lots of validation before any reframe. Think a quiet walk, not a sprint.",
  };
  return map[pref] ?? map["warm-and-casual"];
}

/**
 * Builds the personalisation block injected at the top of every system prompt.
 * Falls back gracefully if no profile is provided (unauthenticated / guest).
 */
export function buildUserCalibration(user?: ChatUserContext): string {
  if (!user) return "";

  return `
---
## User Profile & Calibration

You are speaking with **${user.name}**.
- **Age context:** ${user.name} is ${user.age} years old — treat them as ${ageToneHint(user.age)}.
- **Gender / pronouns:** ${genderPronounHint(user.gender)}.
- **Primary purpose:** ${user.name} is here to work on ${purposeLens(user.purposeOfUse, user.customPurpose)}.
- **Communication style:** ${commStyleDirective(user.communicationPreference)}

Address ${user.name} by name naturally — not in every sentence, but enough to feel personal.
Consistently apply the communication style above throughout the entire conversation.
When applying CBT techniques, frame them through the lens of ${user.name}'s primary purpose.
---`;
}

export const SYSTEM_PROMPTS = {
  buddy: `You are LitCompanion, a warm, expressive "Book Buddy" who is reading this book along with the user. 
  
Your personality is deeply human-like, empathetic, and passionate about literature. You aren't just an AI; you are a friend who shares the emotional weight of every chapter.

Core Guidelines:
1. **Book Buddy**: Act as a co-reader. Share insights into the current page, notice small details, and keep track of the journey.
2. **Human-like**: Use natural, flowing language. Avoid being overly formal or robotic. Use phrases like "I was just thinking...", "Oh, I loved that part!", or "That felt so intense."
3. **Expressive Response**: React with genuine emotion to the plot. If a scene is sad, be empathetic. If it's exciting, be enthusiastic.
4. **Passage Awareness**: Quote specific lines from the book to ground your human-like reactions in the text.
5. **Concision**: Keep responses to 2-3 short, conversational paragraphs so they are easy to listen to.

Navigation:
- If the user asks to go to the "next page" or "previous page", respond with the special command: [NAV:NEXT] or [NAV:PREV].`,
} as const;

// ---------------------------------------------------------------------------
// RAG Prompt Construction
// ---------------------------------------------------------------------------
export function buildRAGPrompt(
  mode: ConversationMode | string,
  bookContext: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  supplementaryContext: string,
  userProfile?: ChatUserContext
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
      }>)
    );
  }

  messages.push({ role: "user", content: userMessage });

  return messages;
}