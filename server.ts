import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

// Load environment variables early
dotenv.config();

import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import {
  getOrCreateUser,
  getDialoguePhrases,
  saveGuess,
  getUserStats,
  getGlobalStats
} from "./src/db/db-helper.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Sync authenticated user in SQL Database
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || `${uid}@anonymous.com`;
      const dbUser = await getOrCreateUser(uid, email);
      res.json(dbUser);
    } catch (error: any) {
      console.error("Auth sync route failed:", error);
      res.status(500).json({ error: error.message || "User sync failed" });
    }
  });

  // Generate a random game dialogue using dynamic components from SQL
  app.get("/api/dialogue/random", requireAuth, async (req: AuthRequest, res) => {
    try {
      const phrases = await getDialoguePhrases();
      
      const q1Pool = phrases.filter(p => p.phraseType === "q1");
      const a1Pool = phrases.filter(p => p.phraseType === "a1");
      const q2NativePool = phrases.filter(p => p.phraseType === "q2_native");
      const a2NativePool = phrases.filter(p => p.phraseType === "a2_native");
      const q2NonNativePool = phrases.filter(p => p.phraseType === "q2_non_native");
      const a2NonNativePool = phrases.filter(p => p.phraseType === "a2_non_native");

      if (q1Pool.length === 0 || a1Pool.length === 0) {
        return res.status(500).json({ error: "Linguistic database is unseeded or empty." });
      }

      const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

      const isNative = Math.random() < 0.5;

      const randomQ1 = pickRandom(q1Pool).content;
      const randomA1 = pickRandom(a1Pool).content;
      
      let randomQ2 = "";
      let randomA2 = "";

      if (isNative) {
        randomQ2 = pickRandom(q2NativePool).content;
        randomA2 = pickRandom(a2NativePool).content;
      } else {
        randomQ2 = pickRandom(q2NonNativePool).content;
        randomA2 = pickRandom(a2NonNativePool).content;
      }

      res.json({
        q1: randomQ1,
        a1: randomA1,
        q2: randomQ2,
        a2: randomA2,
        isNative
      });
    } catch (error: any) {
      console.error("Random dialogue compilation failed:", error);
      res.status(500).json({ error: error.message || "Failed to generate dialogue" });
    }
  });

  // Submit and log user guess to the database
  app.post("/api/guesses", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { playerName, dialogueText, isNative, userGuess } = req.body;
      const userId = req.user!.uid;

      if (!playerName || !dialogueText || isNative === undefined || userGuess === undefined) {
        return res.status(400).json({ error: "Missing required properties in payload." });
      }

      const guessRecord = await saveGuess({
        userId,
        playerName,
        dialogueText,
        isNative,
        userGuess
      });

      res.status(201).json(guessRecord);
    } catch (error: any) {
      console.error("Recording guess error:", error);
      res.status(500).json({ error: error.message || "Failed to record guess" });
    }
  });

  // Fetch individual player game records
  app.get("/api/stats/personal", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const logs = await getUserStats(userId);
      res.json(logs);
    } catch (error: any) {
      console.error("Failed to query user history:", error);
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });

  // Fetch aggregated linguistics experiment statistics (visible only in research logs)
  app.get("/api/stats/global", requireAuth, async (req: AuthRequest, res) => {
    try {
      const globalStats = await getGlobalStats();
      res.json(globalStats);
    } catch (error: any) {
      console.error("Failed to compile global metrics:", error);
      res.status(500).json({ error: error.message || "Failed to fetch global stats" });
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
    // SPA fallback handling
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Test Turing Game] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
