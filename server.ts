import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { getDbPool } from "./src/db/index.ts";

// Load environment variables early
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GET /api/dialogue/random
  // Fetches a random phrase from the pre-built MySQL table and formats it for the game.
  app.get("/api/dialogue/random", async (req, res) => {
    try {
      const pool = getDbPool();
      
      // Select 1 random phrase from MySQL phrases table
      const [rows]: any = await pool.query(
        "SELECT id, category, question_1, answer_1, question_2, answer_2 FROM phrases ORDER BY RAND() LIMIT 1"
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ 
          error: "No phrases found in the 'phrases' table. Please ensure the database is seeded." 
        });
      }

      const row = rows[0];
      const isNative = row.category?.toLowerCase() === "native";

      res.json({
        id: row.id,
        category: row.category,
        q1: row.question_1,
        a1: row.answer_1,
        q2: row.question_2,
        a2: row.answer_2,
        isNative: isNative
      });
    } catch (error: any) {
      console.error("Failed to fetch random dialogue:", error);
      res.status(500).json({ 
        error: `Database query failed: ${error.message || "Unknown error"}. Check your .env configuration.` 
      });
    }
  });

  // POST /api/guesses
  // Receives user guess and inserts a new game result into 'game_results'.
  app.post("/api/guesses", async (req, res) => {
    try {
      const { playerName, phraseId, userGuessedNative } = req.body;

      if (!playerName || phraseId === undefined || userGuessedNative === undefined) {
        return res.status(400).json({ error: "Missing required properties: playerName, phraseId, or userGuessedNative." });
      }

      const pool = getDbPool();

      // Retrieve the phrase category from the database to securely verify the correct answer
      const [phrases]: any = await pool.query(
        "SELECT category FROM phrases WHERE id = ?",
        [phraseId]
      );

      if (!phrases || phrases.length === 0) {
        return res.status(404).json({ error: "Referenced phrase_id not found in 'phrases' table." });
      }

      const category = phrases[0].category || "";
      const isNative = category.toLowerCase() === "native";
      const isCorrect = isNative === !!userGuessedNative;

      // Insert the trial guess log into 'game_results' table
      const [insertResult]: any = await pool.query(
        "INSERT INTO game_results (player_name, phrase_id, user_guessed_native, is_correct, played_at) VALUES (?, ?, ?, ?, NOW())",
        [playerName.trim(), phraseId, userGuessedNative ? 1 : 0, isCorrect ? 1 : 0]
      );

      res.status(201).json({
        id: insertResult.insertId,
        isCorrect: isCorrect,
        category: category,
        isNative: isNative
      });
    } catch (error: any) {
      console.error("Failed to record guess:", error);
      res.status(500).json({ 
        error: `Database insert failed: ${error.message || "Unknown error"}. Check your .env configuration.` 
      });
    }
  });

  // GET /api/stats/global
  // Compiles overall linguistics statistics and logs from game_results left-joined with phrases.
  app.get("/api/stats/global", async (req, res) => {
    try {
      const pool = getDbPool();

      // SQL JOIN to fetch result logs combined with the actual phrase dialogues
      const [rows]: any = await pool.query(
        `SELECT r.id, r.player_name AS playerName, r.user_guessed_native AS userGuess, r.is_correct AS isCorrect, r.played_at AS createdAt,
                p.question_1, p.answer_1, p.question_2, p.answer_2, p.category
         FROM game_results r
         LEFT JOIN phrases p ON r.phrase_id = p.id
         ORDER BY r.id DESC`
      );

      const allGuesses = rows.map((row: any) => {
        const q1 = row.question_1 || "";
        const a1 = row.answer_1 || "";
        const q2 = row.question_2 || "";
        const a2 = row.answer_2 || "";
        const transcript = `A: ${q1}\nB: ${a1}\nA: ${q2}\nB: ${a2}`;
        const isNative = row.category?.toLowerCase() === "native";

        return {
          id: row.id,
          playerName: row.playerName,
          dialogueText: transcript,
          isNative: isNative,
          userGuess: !!row.userGuess,
          isCorrect: !!row.isCorrect,
          createdAt: row.createdAt
        };
      });

      const total = allGuesses.length;
      const correct = allGuesses.filter((g: any) => g.isCorrect).length;
      const accuracyRate = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;

      res.json({
        totalRuns: total,
        accuracyRate: accuracyRate,
        totalCorrect: correct,
        totalIncorrect: total - correct,
        allGuesses: allGuesses
      });
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error);
      res.status(500).json({ 
        error: `Database stats fetch failed: ${error.message || "Unknown error"}. Check your .env configuration.` 
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Test Turing Game] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
