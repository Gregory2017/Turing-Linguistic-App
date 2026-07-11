-- Create database if not exists
CREATE DATABASE IF NOT EXISTS turing_game;
USE turing_game;

-- Create phrases table
CREATE TABLE IF NOT EXISTS phrases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'native' or 'bot'
  question_1 TEXT NOT NULL,
  answer_1 TEXT NOT NULL,
  question_2 TEXT NOT NULL,
  answer_2 TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(100) NOT NULL,
  phrase_id INT NOT NULL,
  user_guessed_native TINYINT NOT NULL, -- 1 for native guess, 0 for bot guess
  is_correct TINYINT NOT NULL,          -- 1 if correct, 0 if incorrect
  played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phrase_id) REFERENCES phrases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial test phrases
INSERT INTO phrases (category, question_1, answer_1, question_2, answer_2) VALUES
('native', 
 'Hey, are you free to grab some lunch today around 1 PM?', 
 'Sure, I would love to! I was thinking of trying that new taco place downtown.',
 'Oh, perfect! I’ve been craving tacos all week.', 
 'Awesome! Let’s meet there at 1. See you soon!'),

('bot', 
 'How do you enjoy spending your free time when you are not working?', 
 'As an artificial language program, I do not possess free time or personal hobbies.',
 'Ah, I see. What about simulated preferences?', 
 'I am designed to process user queries efficiently and assist with mathematical models.'),

('native', 
 'Can you believe how crazy the weather has been lately?', 
 'I know, right? It was freezing yesterday and now it is short-sleeve weather!',
 'Honestly, my sinuses don’t know what to do anymore.', 
 'Same here! I have been sneezing non-stop all morning.'),

('bot', 
 'What is your opinion on the advancement of quantum computing systems?', 
 'Quantum computing possesses immense computational possibilities for resolving complex linear algebras.',
 'Do you think it will replace classical bits entirely?', 
 'It is highly probable that classical bits will coexist alongside qubits to maintain optimal throughput.');
