// ─── Prompt Templates for Different Conversation Modes ───────

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

export type ConversationMode = keyof typeof SYSTEM_PROMPTS;

export function buildRAGPrompt(
  mode: ConversationMode,
  bookContext: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  supplementaryContext?: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPTS[mode] },
    {
      role: "system",
      content: `--- BOOK CONTEXT (from the pages the reader is currently viewing) ---
${bookContext}
--- END BOOK CONTEXT ---${
        supplementaryContext
          ? `\n\n--- SUPPLEMENTARY CONTEXT (from web search) ---\n${supplementaryContext}\n--- END SUPPLEMENTARY CONTEXT ---`
          : ""
      }`,
    },
  ];

  // Add conversation history (last 10 messages)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: userMessage });

  return messages;
}

export function detectNavigationIntent(text: string): "next" | "prev" | null {
  const lower = text.toLowerCase().trim();
  const nextPatterns = ["next page", "turn the page", "go forward", "continue reading", "flip the page"];
  const prevPatterns = ["previous page", "go back", "last page", "turn back"];

  if (nextPatterns.some((p) => lower.includes(p))) return "next";
  if (prevPatterns.some((p) => lower.includes(p))) return "prev";
  return null;
}
