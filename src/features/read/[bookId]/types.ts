export type InteractionMode = "chat" | "voice";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

