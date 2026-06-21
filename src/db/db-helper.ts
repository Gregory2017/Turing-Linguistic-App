import { db } from './index.ts';
import { users, dialoguePhrases, guesses } from './schema.ts';
import { eq } from 'drizzle-orm';

// Get or sync user in DB using Firebase Auth UID
export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to get or create SQL user:", error);
    throw new Error("Database sync failed. Please try again later.", { cause: error });
  }
}

// Fetch all dialogue phrases from the pool to dynamically assemble a conversation
export async function getDialoguePhrases() {
  try {
    const phrases = await db.select().from(dialoguePhrases);
    return phrases;
  } catch (error) {
    console.error("Failed to fetch dialogue phrases:", error);
    throw new Error("Could not retrieve dialogue phrases from database.", { cause: error });
  }
}

export interface GuessInput {
  userId: string;
  playerName: string;
  dialogueText: string;
  isNative: boolean;
  userGuess: boolean;
}

// Store a user guess along with calculated correctness and details
export async function saveGuess(input: GuessInput) {
  try {
    const isCorrect = input.isNative === input.userGuess;
    const result = await db.insert(guesses)
      .values({
        userId: input.userId,
        playerName: input.playerName,
        dialogueText: input.dialogueText,
        isNative: input.isNative,
        userGuess: input.userGuess,
        isCorrect: isCorrect,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to save user guess to DB:", error);
    throw new Error("Could not save stats to the database.", { cause: error });
  }
}

// Retrieve game history and stats for backend reporting or historical analysis
export async function getUserStats(userId: string) {
  try {
    const results = await db.select().from(guesses).where(eq(guesses.userId, userId));
    return results;
  } catch (error) {
    console.error("Failed to fetch user game records:", error);
    throw new Error("Could not retrieve user stats from the database.", { cause: error });
  }
}

// Get global stats aggregated across all responses (great for researcher analysis)
export async function getGlobalStats() {
  try {
    const allGuesses = await db.select().from(guesses);
    const total = allGuesses.length;
    const correct = allGuesses.filter(g => g.isCorrect).length;
    const nativeGuesses = allGuesses.filter(g => g.isNative).length;
    
    return {
      totalRuns: total,
      accuracyRate: total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0,
      totalCorrect: correct,
      totalIncorrect: total - correct,
      allGuesses: allGuesses
    };
  } catch (error) {
    console.error("Global stats query failed:", error);
    throw new Error("Failed to compile linguistic statistics.", { cause: error });
  }
}
