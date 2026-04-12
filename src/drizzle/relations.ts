import { relations } from "drizzle-orm";
import { account, bookChunks, books, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  books: many(books),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(user, {
    fields: [books.userId],
    references: [user.id],
  }),
  chunks: many(bookChunks),
}));

export const bookChunksRelations = relations(bookChunks, ({ one }) => ({
  book: one(books, {
    fields: [bookChunks.bookId],
    references: [books.id],
  }),
}));
