const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Setup a direct MySQL connection pool using mysql2/promise
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'turing_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Serve our single index.html file at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/dialogue
// Returns a single random dialogue from the 'phrases' table.
app.get('/api/dialogue', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, category, question_1, answer_1, question_2, answer_2 FROM phrases ORDER BY RAND() LIMIT 1');
    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        error: 'No dialogues found. Please verify that the "phrases" table is created and seeded.' 
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error querying random dialogue:', err);
    res.status(500).json({ error: 'Database query failed: ' + err.message });
  }
});

// POST /api/guesses
// Saves the player's prediction and verifies if it matches the true category of the phrase.
app.post('/api/guesses', async (req, res) => {
  try {
    const { playerName, phraseId, userGuessedNative } = req.body;

    if (!playerName || phraseId === undefined || userGuessedNative === undefined) {
      return res.status(400).json({ 
        error: 'Missing required request parameters: playerName, phraseId, or userGuessedNative.' 
      });
    }

    // Retrieve category to verify correctness of user answer
    const [phrases] = await pool.query('SELECT category FROM phrases WHERE id = ?', [phraseId]);
    if (!phrases || phrases.length === 0) {
      return res.status(404).json({ error: 'Dialogue phrase ID not found.' });
    }

    const category = phrases[0].category || '';
    const isNative = category.toLowerCase() === 'native';
    const isCorrect = isNative === !!userGuessedNative;

    // Record results directly in game_results table
    await pool.query(
      'INSERT INTO game_results (player_name, phrase_id, user_guessed_native, is_correct) VALUES (?, ?, ?, ?)',
      [playerName.trim(), phraseId, userGuessedNative ? 1 : 0, isCorrect ? 1 : 0]
    );

    res.json({
      success: true,
      isCorrect: isCorrect,
      category: category,
      isNative: isNative
    });
  } catch (err) {
    console.error('Error writing guess result:', err);
    res.status(500).json({ error: 'Database transaction failed: ' + err.message });
  }
});

// Error fallback handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Turing Game Server] Online at http://localhost:${PORT}`);
});
