import React, { useEffect, useState } from 'react';
import { RefreshCw, GraduationCap, CheckCircle, AlertTriangle, Users, Layers } from 'lucide-react';

interface GuessRecord {
  id: number;
  playerName: string;
  dialogueText: string;
  isNative: boolean;
  userGuess: boolean;
  isCorrect: boolean;
  createdAt: string;
}

interface AggregatedStats {
  totalRuns: number;
  accuracyRate: number;
  totalCorrect: number;
  totalIncorrect: number;
  allGuesses: GuessRecord[];
}

interface StatsPanelProps {
  statsTrigger?: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ statsTrigger = 0 }) => {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats/global');
      if (!res.ok) {
        throw new Error('Failed to retrieve researcher statistics from MySQL.');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [statsTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-mono text-gray-500">Retrieving MySQL trial logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300">
        <p className="font-mono text-xs">{error}</p>
        <button onClick={fetchStats} className="mt-3 text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-500/20 px-3 py-1.5 rounded transition uppercase font-mono tracking-wider font-bold">
          Retry Query
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#333] pb-4">
        <div>
          <h2 className="text-lg font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500 animate-pulse" />
            Linguistic Telemetry Logs & SQL Metrics
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Statistical logs query output from dialogue perception variables in active database tables.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded border border-blue-500/20 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Query Database
        </button>
      </div>

      {stats && stats.totalRuns > 0 ? (
        <>
          {/* High-Tech Grid Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#161616] border border-[#333] p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Accuracy index</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-mono font-light text-emerald-400 mt-2">
                {stats.accuracyRate}%
              </p>
              <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">WIN RATE OVER DIALECTS</p>
            </div>

            <div className="bg-[#161616] border border-[#333] p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Total trials</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-mono font-light text-blue-400 mt-2">
                {stats.totalRuns}
              </p>
              <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">MYSQL RECORDS</p>
            </div>

            <div className="bg-[#161616] border border-[#333] p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Success detections</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl font-mono font-light text-indigo-400 mt-2">
                {stats.totalCorrect}
              </p>
              <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">HUMAN CORRECT PERCEPTION</p>
            </div>

            <div className="bg-[#161616] border border-[#333] p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Machine deception</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-mono font-light text-red-400 mt-2">
                {stats.totalIncorrect}
              </p>
              <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">SUBJECTS TRICKED BY BOT</p>
            </div>
          </div>

          {/* Database System Table Sheet */}
          <div className="bg-[#161616] border border-[#333] rounded-lg overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-[#1F1F1F] border-b border-[#333] flex items-center justify-between">
              <h3 className="text-[10px] font-mono font-bold uppercase text-gray-300 tracking-widest flex items-center gap-1.5">
                DATABASE TABLE: game_results
              </h3>
              <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 font-mono px-2 py-0.5 rounded">
                METRICS HANDSHAKE SECURE [MYSQL]
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#111] text-gray-400 uppercase text-[9px] tracking-wider border-b border-[#333]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Operator Name</th>
                    <th className="py-3 px-4">Dialogue Sequence Transcript</th>
                    <th className="py-3 px-4 text-center">Identity</th>
                    <th className="py-3 px-4 text-center">Prediction</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] text-gray-300">
                  {stats.allGuesses.map((record) => (
                    <tr key={record.id} className="hover:bg-blue-500/5 transition">
                      <td className="py-3 px-4 text-gray-500">#{record.id}</td>
                      <td className="py-3 px-4 text-white font-bold">{record.playerName}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="line-clamp-2 text-gray-300 font-mono bg-black/40 px-2 py-1.5 rounded border border-[#222] whitespace-pre-line text-[10px]">
                          {record.dialogueText}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          record.isNative 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                        }`}>
                          {record.isNative ? 'NATIVE_ID' : 'MACHINE_BOT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          record.userGuess 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                        }`}>
                          {record.userGuess ? 'NATIVE' : 'MACHINE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          record.isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {record.isCorrect ? '✓ CORRECT' : '✗ FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-[#161616] rounded-lg border border-dashed border-[#333] text-center">
          <GraduationCap className="w-10 h-10 text-gray-600 mb-3" />
          <h4 className="font-mono font-medium text-white uppercase tracking-wider">No active trial records</h4>
          <p className="text-xs text-gray-400 max-w-xs mt-1">
            Conduct dialogues in the Trial Simulator tab to write active telemetry logs to MySQL tables.
          </p>
        </div>
      )}
    </div>
  );
};
