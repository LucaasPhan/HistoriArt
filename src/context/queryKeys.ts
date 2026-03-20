export const authKeys = {
  session: ["user", "session"] as const,
} as const;

export const bookmarkKeys = {
  all: ["all_user_bookmarks"] as const,
} as const;

export const userRecentQueryKeys = {
  all: ["user_recent_query"] as const,
} as const;

export const userFinishedQuestionsKeys = {
  all: ["user_finished_questions"] as const,
} as const;
