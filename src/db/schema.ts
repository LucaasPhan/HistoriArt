import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  boolean,
  serial,
  varchar,
  customType,
} from "drizzle-orm/pg-core";

// Custom pgvector type
const vector = customType<{ data: number[]; dpiverType: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown) {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map(Number) as number[];
    }
    return value as number[];
  },
});

// ─── Auth Tables (better-auth managed) ───────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── App Tables ──────────────────────────────────────────────
export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  coverUrl: text("cover_url"),
  description: text("description"),
  totalPages: integer("total_pages").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  number: integer("number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  startPage: integer("start_page").notNull(),
  endPage: integer("end_page").notNull(),
});

export const bookChunks = pgTable("book_chunks", {
  id: serial("id").primaryKey(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  chapterNumber: integer("chapter_number").notNull(),
  pageNumber: integer("page_number").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding"),
  metadata: jsonb("metadata"),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  messages: jsonb("messages").$type<
    Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
  >().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
