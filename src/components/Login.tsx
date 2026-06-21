import React from 'react';
import { useAuth } from './AuthContext.tsx';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4 grid-lines">
      <div className="max-w-md w-full bg-[#161616] border border-[#333] rounded-xl overflow-hidden shadow-2xl glow-blue">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex p-4 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20"
            >
              <ShieldAlert className="w-8 h-8 animate-pulse text-blue-400" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-mono uppercase font-bold tracking-wider text-white">
                The Turing Test!
              </h1>
              <p className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">
                Linguistic Perception Experiment Suite
              </p>
            </div>

            <div className="bg-[#101010] border border-[#222] p-4 rounded-lg text-left">
              <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Scientific Hypothesis
              </p>
              <p className="text-xs font-sans text-gray-300 italic leading-relaxed">
                "The fundamental difference between human beings and machines is perception. By judging whether a conversational thread originates from matched native English speakers or an automated bot, we map limits in syntactic simulation."
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full bg-[#1c1a1f] hover:bg-blue-600/20 text-white border border-[#333] hover:border-blue-500 font-mono uppercase text-xs font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Establishing secure handshakes...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.28.62 4.51 1.643l2.425-2.425C17.435 1.71 15 0 12.24 0c-6.077 0-11 4.923-11 11s4.923 11 11 11c5.73 0 10.2-4.015 10.2-10 0-.675-.06-1.315-.175-1.715H12.24z"/>
                  </svg>
                  Sign In with Google
                </>
              )}
            </button>

            <p className="text-[9px] text-gray-500 font-mono text-center leading-normal">
              Authorization managed via Cloud handshakes (Google OAuth + Firebase Authentication). Telemetry metadata will be committed to Postgres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

