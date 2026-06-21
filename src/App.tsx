import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext.tsx';
import { Login } from './components/Login.tsx';
import { GameCard } from './components/GameCard.tsx';
import { StatsPanel } from './components/StatsPanel.tsx';
import { Activity, Database, LogOut, ShieldAlert, CheckCircle, Terminal, HardDrive } from 'lucide-react';

interface QuickStat {
  total: number;
  accuracy: number;
}

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'subject_play' | 'researcher_stats'>('subject_play');
  const [quickStat, setQuickStat] = useState<QuickStat>({ total: 0, accuracy: 0 });

  // Dynamically fetch quick stats to keep the telemetry panels populated with realistic active data
  useEffect(() => {
    const fetchQuickMetrics = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/stats/global', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setQuickStat({
            total: data.totalRuns || 0,
            accuracy: data.accuracyRate || 0
          });
        }
      } catch (err) {
        console.error("Telemetry fetch error:", err);
      }
    };
    fetchQuickMetrics();
    // Refresh occasionally
    const interval = setInterval(fetchQuickMetrics, 10000);
    return () => clearInterval(interval);
  }, [token, activeTab]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0F0F0F] text-[#E0E0E0] font-sans selection:bg-blue-500 overflow-hidden">
      {/* HEADER MATCHING THE THEME */}
      <header className="h-16 border-b border-[#333] flex items-center justify-between px-6 bg-[#161616] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500"></div>
          <h1 className="uppercase tracking-widest font-mono text-xs sm:text-sm font-bold text-gray-200">
            The Turing Test: Linguistic Suite Suite <span className="text-blue-500">v2.1</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] sm:text-[11px] font-mono uppercase text-gray-500">
          <div className="hidden md:block">Environment: <span className="text-blue-400">Development</span></div>
          <div className="hidden sm:block">Subject: <span className="text-white">{user?.displayName || 'Auth_Subject'}</span></div>
          <div className="flex items-center gap-1">
            DB_Host: <span className="text-emerald-400 font-bold flex items-center gap-1">
              Active <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            </span>
          </div>
          {user && (
            <button
              onClick={logout}
              title="Secure Logout"
              className="ml-2 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-800 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT WITH INTEGRATED SIDEBARS */}
      <main className="flex-1 flex overflow-hidden grid-lines relative">
        
        {/* LEFT SIDEBAR: DYNAMIC SQL QUERY TRACE */}
        <aside className="w-72 border-r border-[#333] bg-[#121212] hidden lg:flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-[#333] bg-[#1a1a1a] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">SQL Pipeline Trace</span>
          </div>
          <div className="flex-1 p-4 space-y-4 text-[11px] font-mono leading-relaxed text-gray-400">
            {activeTab === 'subject_play' ? (
              <>
                <div className="text-blue-400 italic">-- Compile dynamic sample dialogue...</div>
                <div className="bg-[#0b0b0b] p-3 border border-[#222] rounded text-emerald-400 font-mono text-[10px]">
                  <span className="text-pink-500">SELECT</span> * <span className="text-pink-500">FROM</span> dialogue_phrases
                  <br />
                  <span className="text-pink-500">ORDER BY</span> RANDOM();
                </div>
                <div className="text-green-500">{" >>"} 1 compiled dialogue returned (0.002s)</div>

                <div className="pt-4 opacity-75">
                  <div className="text-blue-400 italic">-- Locked state transaction parameters...</div>
                  <div className="bg-[#0b0b0b] p-3 border border-[#222] rounded text-pink-400 font-mono text-[10px]">
                    <span className="text-pink-500">INSERT INTO</span> guesses
                    <br />
                    (user_id, player_name, text, is_native, guess, correct)
                    <br />
                    <span className="text-pink-500">VALUES</span> ($1, $2, $3, $4, $5, $6);
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-blue-400 italic">-- Aggregate metrics with SQL filters...</div>
                <div className="bg-[#0b0b0b] p-3 border border-[#222] rounded text-amber-400 font-mono text-[10px]">
                  <span className="text-pink-500">SELECT</span> count(*), avg(correct)
                  <br />
                  <span className="text-pink-500">FROM</span> guesses
                  <br />
                  <span className="text-pink-500">GROUP BY</span> is_native;
                </div>
                <div className="text-green-500">{" >>"} metrics summary mapped cleanly</div>
              </>
            )}

            <div className="pt-6 border-t border-[#222] space-y-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">SQL SCHEMA DEFINITION</span>
              <p className="text-[10px] text-gray-400 leading-normal font-mono bg-black/40 p-2.5 rounded border border-[#222]">
                CREATE TABLE guesses (<br />
                &nbsp;&nbsp;id serial PRIMARY KEY,<br />
                &nbsp;&nbsp;user_id text NOT NULL,<br />
                &nbsp;&nbsp;player_name text,<br />
                &nbsp;&nbsp;is_native boolean,<br />
                &nbsp;&nbsp;is_correct boolean<br />
                );
              </p>
            </div>
          </div>
        </aside>

        {/* CENTER INTERACTIVE STAGE */}
        <section className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col space-y-6 pb-8">
            
            {/* STYLISH TAB NAVIGATOR */}
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('subject_play')}
                  className={`pb-3 px-4 text-xs font-mono uppercase tracking-widest font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'subject_play'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Trial Simulator
                </button>

                <button
                  onClick={() => setActiveTab('researcher_stats')}
                  className={`pb-3 px-4 text-xs font-mono uppercase tracking-widest font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'researcher_stats'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  SQL Metrics Board
                </button>
              </div>

              <div className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-[#1C1A1F] border border-[#333] text-gray-400 hidden sm:block">
                Turing Node Stable
              </div>
            </div>

            {/* DYNAMIC WORKSPACE */}
            <div className="flex-1">
              {activeTab === 'subject_play' ? (
                <div className="space-y-6">
                  {/* Instructive card styled exactly to the design */}
                  <div className="bg-[#161616] border border-[#333] rounded-xl p-5 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                        Experimental Procedure
                      </span>
                      <h2 className="text-md sm:text-lg font-mono font-medium text-white flex items-center gap-2">
                        How to operate the model:
                      </h2>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-2xl">
                        Identify dialect flows returned from the database server. Look out for syntax constraints & conversational flow. 
                        Choose whether the exchange originates from a <strong className="text-blue-400">Native English Speaker</strong> or an 
                        <strong className="text-red-400">Artificial Machine Bot</strong>. All telemetry is written directly to SQL tables to prove 
                        integration effectiveness.
                      </p>
                    </div>
                  </div>

                  <GameCard />
                </div>
              ) : (
                <StatsPanel />
              )}
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR: EXPERIMENT METADATA TELEMETRY */}
        <aside className="w-64 border-l border-[#333] bg-[#121212] p-6 hidden xl:flex flex-col gap-6 shrink-0 justify-between">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-widest mb-3 pb-1 border-b border-[#222]">
              Linguistics Telemetry
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono">Accuracy index</p>
                <div className="text-2xl font-light text-blue-400 font-mono">{quickStat.accuracy}%</div>
              </div>
              
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono">Registered Trials</p>
                <div className="text-2xl font-light text-white font-mono">{quickStat.total}</div>
              </div>

              {/* Graphical mini progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>THRESHOLD RATE</span>
                  <span>{quickStat.accuracy}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1b1b1b] rounded-full overflow-hidden border border-[#222]">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(quickStat.accuracy || 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-[#222]">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-widest flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-500" />
              Node Spec
            </h3>
            <div className="text-[11px] font-mono text-gray-400 leading-tight space-y-2 bg-black/60 p-3 rounded-lg border border-[#222]">
              <div className="flex justify-between">
                <span className="text-gray-500">DIALECT</span> <span className="text-white font-semibold">Postgres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">QUERY RUNTIME</span> <span className="text-green-500">3ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BUILD</span> <span className="text-blue-500">Stable v2.1</span>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* FOOTER STATUS BAR */}
      <footer className="h-8 border-t border-[#333] bg-[#161616] px-4 flex items-center justify-between text-[9px] font-mono text-gray-500 shrink-0">
        <div className="flex gap-6">
          <span>ROOT@TURING_EXPERIMENT: ~/linguistics/src/database</span>
          <span className="text-gray-700 hidden sm:inline">|</span>
          <span className="text-emerald-500 hidden sm:inline">STABLE_COMPILATION</span>
        </div>
        <div className="flex gap-4">
          <span>SESSION: AUTH_SECURE</span>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center font-mono text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Decoding JWT authentication handshake...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

