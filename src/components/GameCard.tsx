import React, { useState } from 'react';
import { useAuth } from './AuthContext.tsx';
import { motion } from 'motion/react';
import { RefreshCw, CheckCircle, AlertTriangle, MessageSquare, Play, User } from 'lucide-react';

interface DialogueData {
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  isNative: boolean;
}

export const GameCard: React.FC = () => {
  const { token, user } = useAuth();
  const [playerName, setPlayerName] = useState(user?.displayName || '');
  const [gameState, setGameState] = useState<'name_input' | 'dialogue_active' | 'guess_submitted'>('name_input');
  
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [userGuess, setUserGuess] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ isCorrect: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNewDialogue = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dialogue/random', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Could not fetch dialogue from database.');
      }
      const data = await res.json();
      setDialogue(data);
      setGameState('dialogue_active');
    } catch (err: any) {
      setError(err.message || 'Linguistic trial initiation error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    fetchNewDialogue();
  };

  const handleGuess = async (guess: boolean) => {
    if (!dialogue || !token || submitting) return;
    setSubmitting(true);
    setUserGuess(guess);
    
    const transcript = `A: ${dialogue.q1}\nB: ${dialogue.a1}\nA: ${dialogue.q2}\nB: ${dialogue.a2}`;

    try {
      const res = await fetch('/api/guesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          dialogueText: transcript,
          isNative: dialogue.isNative,
          userGuess: guess
        })
      });

      if (!res.ok) {
        throw new Error('Failed to record guess inside postgres.');
      }

      const savedGuess = await res.json();
      setResults({ isCorrect: savedGuess.isCorrect });
      setGameState('guess_submitted');
    } catch (err: any) {
      setError(err.message || 'Error occurred while locking in your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setDialogue(null);
    setUserGuess(null);
    setResults(null);
    fetchNewDialogue();
  };

  // 1. Name Entry View
  if (gameState === 'name_input') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-[#161616] border border-[#333] p-8 rounded-xl shadow-2xl glow-blue"
      >
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-lg font-mono uppercase tracking-wider text-white">
            Configure Session
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Designate a participant identifier code or operator callsign to write logs to SQL.
          </p>
        </div>

        <form onSubmit={handleStartGame} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">
              OPERATOR_ID / CALLSIGN
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUBJECT_BETA"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-[#0E0E0E] border border-[#333] text-[#E0E0E0] font-mono text-xs px-4 py-3 rounded focus:outline-none focus:border-blue-500 focus:bg-black/80 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase text-xs font-bold py-3.5 px-4 rounded flex items-center justify-center gap-2 shadow-lg transition duration-150 cursor-pointer"
          >
            Launch Dialogue Stream
            <Play className="w-3.5 h-3.5 fill-white" />
          </button>
        </form>
      </motion.div>
    );
  }

  // 2. Active Trial & Speech Bubbles View
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500 text-red-300 text-xs font-mono rounded flex items-center justify-between">
          <span>ERROR: {error}</span>
          <button onClick={handleReset} className="underline font-bold hover:text-red-100">Reset</button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#161616] border border-[#333] p-12 rounded-xl text-center space-y-4 shadow-xl">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
          <p className="text-xs font-mono text-gray-400 tracking-wider">
            COMPILE RANDOM NLP TRANSCRIPT FROM postgres_pool...
          </p>
        </div>
      ) : (
        dialogue && (
          <div className="space-y-6">
            
            {/* THE TRANSCRIPT TERMINAL PANEL */}
            <div className="bg-[#161616] border border-[#333] rounded-xl shadow-2xl p-6 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed flex flex-col space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3 mb-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  TRANSCRIPT_STREAM #{(1082 + Math.floor(Math.random() * 50)).toString()}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  OPERATOR: <span className="text-blue-400 font-bold">{playerName}</span>
                </div>
              </div>

              <div className="space-y-6 font-mono">
                {/* Line 1: SUBJECT A */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <span className="text-blue-500 font-bold shrink-0">[SUBJECT_A]:</span>
                  <span className="text-white bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 flex-1">{dialogue.q1}</span>
                </motion.div>

                {/* Line 2: SUBJECT B */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex gap-4"
                >
                  <span className="text-[#10B981] font-bold shrink-0">[SUBJECT_B]:</span>
                  <span className="text-[#E0E0E0] bg-[#10B981]/5 px-2 py-0.5 rounded border border-[#10B981]/10 flex-1">{dialogue.a1}</span>
                </motion.div>

                {/* Line 3: SUBJECT A */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4"
                >
                  <span className="text-blue-500 font-bold shrink-0">[SUBJECT_A]:</span>
                  <span className="text-white bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 flex-1">{dialogue.q2}</span>
                </motion.div>

                {/* Line 4: SUBJECT B */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex gap-4"
                >
                  <span className="text-[#10B981] font-bold shrink-0">[SUBJECT_B]:</span>
                  <span className="text-[#E0E0E0] bg-[#10B981]/5 px-2 py-0.5 rounded border border-[#10B981]/10 flex-1">{dialogue.a2}</span>
                </motion.div>
              </div>

              {/* DECISION BUTTONS & INPUT INSIDE TERMINAL BASE */}
              {gameState === 'dialogue_active' && (
                <div className="mt-8 pt-6 border-t border-[#333] flex flex-col md:flex-row items-center justify-between gap-4">
                  <span className="text-[10px] text-gray-500 italic uppercase">SYSTEM_HANDSHAKE: awaiting classification...</span>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleGuess(true)}
                      disabled={submitting}
                      className="flex-1 md:flex-none px-6 py-3 border border-white text-white hover:bg-white hover:text-black transition-all cursor-pointer uppercase text-[10px] font-mono tracking-widest font-bold"
                    >
                      {submitting ? 'RECORDING_TRX...' : 'NATIVE_SPEAKER'}
                    </button>
                    <button
                      onClick={() => handleGuess(false)}
                      disabled={submitting}
                      className="flex-1 md:flex-none px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer uppercase text-[10px] font-mono tracking-widest font-bold"
                    >
                      {submitting ? 'RECORDING_TRX...' : 'MACHINE_BOT'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* VERDICT REVEAL STAGE */}
            {gameState === 'guess_submitted' && results && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-xl p-6 shadow-2xl text-center space-y-6 ${
                  results.isCorrect
                    ? 'bg-[#0f1d14]/40 border-[#10B981] text-[#E0E0E0] glow-green'
                    : 'bg-[#210f0f]/40 border-red-500 text-[#E0E0E0] glow-red'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {results.isCorrect ? (
                    <>
                      <div className="p-3 bg-emerald-500/10 border border-[#10B981]/25 rounded-full text-[#10B981]">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-mono uppercase tracking-wider font-bold">
                        VERDICT: PERFECT HANDSHAKE 🎉
                      </h3>
                      <p className="text-xs text-gray-300 max-w-sm font-sans mx-auto leading-relaxed">
                        Your cognitive parsing is accurate. Dialogue metrics have been written flawlessly to Cloud SQL tables.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-full text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-mono uppercase tracking-wider font-bold">
                        VERDICT: METRIC DISCREPANCY 🤖
                      </h3>
                      <p className="text-xs text-gray-300 max-w-sm font-sans mx-auto leading-relaxed">
                        The simulated syntactics matched human dialect layers completely. Handshake telemetry reported a discrepancy.
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t border-[#333] pt-4 flex flex-col items-center gap-2">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                    Linguistic Calibration Matrix
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-left w-full max-w-xs font-mono text-xs">
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#222]">
                      <p className="text-[9px] text-gray-500">CORPUS IDENTITY</p>
                      <p className="font-semibold text-white mt-1 uppercase tracking-wide">
                        {dialogue.isNative ? 'NATIVE_ID' : 'MACHINE_BOT'}
                      </p>
                    </div>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#222]">
                      <p className="text-[9px] text-gray-500">YOUR CLASSIF.</p>
                      <p className="font-semibold text-white mt-1 uppercase tracking-wide">
                        {userGuess ? 'NATIVE_ID' : 'MACHINE_BOT'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase text-xs font-bold px-8 py-3 rounded inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Begin New Trial Run
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )
      )}
    </div>
  );
};

