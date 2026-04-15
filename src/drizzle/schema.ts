import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import { CommunicationPreference, Gender } from "./constants";

// ─── Auth Tables ──────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  selectedImage: text("selected_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpiresAt: timestamp("ban_expires_at"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by").references(() => user.id),
  },
  (table) => [index("idx_session_id").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_account_id").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── User Profiles ────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique() // enforces 1-to-1 with user
    .references(() => user.id, { onDelete: "cascade" }),

  // ── Onboarding step 1: personal info ──────────────────────
  firstName: varchar("first_name", { length: 255 }).notNull().default(""),
  lastName: varchar("last_name", { length: 255 }).notNull().default(""),
  age: smallint("age").notNull(),
  gender: text("gender").$type<Gender>().notNull(),

  // ── Onboarding step 2: CBT calibration ────────────────────
  purposeOfUse: text("purpose_of_use").notNull(),
  customPurpose: varchar("custom_purpose", { length: 500 }),
  readingGoal: text("reading_goal").notNull().default(""),
  personality: text("personality").notNull().default(""),
  genZMode: boolean("gen_z_mode").notNull().default(false),
  communicationPreference: text("communication_preference")
    .$type<CommunicationPreference>()
    .notNull(),

  // ── Meta ──────────────────────────────────────────────────
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Book & App Tables ──────────────────────────────────────────────

export const books = pgTable(
  "books",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    author: varchar("author", { length: 255 }).notNull().default("Unknown"),
    fileName: text("file_name").notNull(),
    coverUrl: text("cover_url"),
    description: text("description"),
    era: text("era"),
    coverGradient: jsonb("cover_gradient").$type<[string, string]>(),
    isSample: boolean("is_sample").notNull().default(false),
    totalPages: integer("total_pages").notNull().default(0),
    totalChunks: integer("total_chunks").notNull().default(0),
    estimatedReadTime: integer("estimated_read_time"),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastPageRead: integer("last_page_read").notNull().default(0),
  },
  (table) => [index("idx_book_user").on(table.userId)],
);

export const bookChunks = pgTable(
  "book_chunks",
  {
    id: serial("id").primaryKey(),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    chapterNumber: integer("chapter_number"),
    pageNumber: integer("page_number"),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_chunk_book").on(table.bookId),
    index("idx_chunk_index").on(table.bookId, table.chunkIndex),
  ],
);


// ─── Media Annotations (multimedia tied to text passages) ──────
export const mediaAnnotations = pgTable(
  "media_annotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: text("book_id").notNull(),
    chapterId: text("chapter_id"),
    pageNumber: integer("page_number"),
    passageText: text("passage_text"),
    mediaType: text("media_type").$type<"image" | "video" | "audio" | "annotation">().notNull(),
    mediaUrl: text("media_url"),
    caption: text("caption"),
    source: text("source"),
    thumbnailUrl: text("thumbnail_url"),
    sources: jsonb("sources").$type<string[]>().default([]),
    autoplay: boolean("autoplay").notNull().default(true),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_annotation_book").on(table.bookId),
    index("idx_annotation_book_page").on(table.bookId, table.pageNumber),
  ],
);

// ─── Quiz Questions (per-chapter quiz) ────────────────────────
export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: text("book_id").notNull(),
    chapterId: text("chapter_id"),
    pageNumber: integer("page_number"),
    question: text("question").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    explanation: text("explanation"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_quiz_book").on(table.bookId)],
);

// ─── Quiz Results (user quiz scores) ──────────────────────────
export const quizResults = pgTable(
  "quiz_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    bookId: text("book_id").notNull(),
    chapterId: text("chapter_id"),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (table) => [index("idx_quiz_result_user").on(table.userId, table.bookId)],
);


// ─── Favorite Books ───────────────────────────────────────────

export const favoriteBooks = pgTable(
  "favorite_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bookId: text("book_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_fav_user_book").on(table.userId, table.bookId)],
);

// ─── Reading Progress ─────────────────────────────────────────

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bookId: text("book_id").notNull(),
    lastPageRead: integer("last_page_read").notNull().default(1),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("idx_reading_progress_user_book").on(table.userId, table.bookId)],
);
