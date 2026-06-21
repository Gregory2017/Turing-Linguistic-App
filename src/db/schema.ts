import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 'users' table holds authenticated accounts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 'dialogue_phrases' table holds the pool of phrases for dynamic game dialogue generation
export const dialoguePhrases = pgTable('dialogue_phrases', {
  id: serial('id').primaryKey(),
  phraseType: text('phrase_type').notNull(), // 'q1', 'a1', 'q2_native', 'a2_native', 'q2_non_native', 'a2_non_native'
  content: text('content').notNull(),
});

// 'guesses' table holds responses for statistics and analysis
export const guesses = pgTable('guesses', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  playerName: text('player_name').notNull(),
  dialogueText: text('dialogue_text').notNull(),
  isNative: boolean('is_native').notNull(),
  userGuess: boolean('user_guess').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  guesses: many(guesses),
}));

export const guessesRelations = relations(guesses, ({ one }) => ({
  user: one(users, {
    fields: [guesses.userId],
    references: [users.uid],
  }),
}));
