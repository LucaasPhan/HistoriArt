import type { ConversationMode } from "@/lib/prompts";

export const HIGHLIGHTS_STORAGE_KEY_PREFIX = "highlights_v2_";
export const LAST_PAGE_STORAGE_KEY_PREFIX = "last_page_";
export const READER_MODE: ConversationMode = "buddy";

export const PAGE_RETRY_DELAY = 2000;
export const MAX_HISTORY_MESSAGES = 8;
export const MAX_MEDIA_ATTACHMENTS = 8;

export const CHAT_SAVE_DELAY = 400;
export const PULSE_HIGHLIGHT_DURATION = 2000;
export const PANEL_ANIMATION_DELAY = 350;
