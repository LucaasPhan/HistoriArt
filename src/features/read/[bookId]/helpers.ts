import type { ChatMessage } from "./types";

export function getChatStorageKey(bookId: string) {
  return `litcompanion_chat_${bookId}`;
}

export function buildAssistantChatMessage(responseText: string, timestampISO: string): ChatMessage {
  return {
    role: "assistant",
    content: responseText,
    timestamp: timestampISO,
  };
}

export function buildUserChatMessage(messageText: string, timestampISO: string): ChatMessage {
  return {
    role: "user",
    content: messageText,
    timestamp: timestampISO,
  };
}

export function clampText(text: string, maxLen: number) {
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

