import { useState, useEffect } from 'react';
import { Trophy, DollarSign, Heart, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface Leader {
  user: { id: string; name: string; avatar?: string };
  totalTipped: number;
  tipCount: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const socket = socketService.connect();
    // Refresh leaderboard whenever a tip completes
    socket.on('tip:received', () => load());
    return () => { socket.off('tip:received'); };
  }, []);

  const load = async () => {
    try {
      const data = await api.getTipLeaderboard();
      setLeaders(data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const medalColor = (i: number) =>
    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500';

  const medalBg = (i: number) =>
    i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
    i === 1 ? 'bg-gray-400/10 border-gray-400/30' :
    i === 2 ? 'bg-amber-600/10 border-amber-600/30' : 'bg-black/40 border-purple-500/20';

  if (loading) return <div className="text-white text-center py-12">Loading leaderboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tip Leaderboard</h1>
        <p className="text-gray-400">Top supporters of T-Smooth Productions</p>
      </div>

      {/* Podium — top 3 */}
      {leaders.length >= 3 && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* 2nd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-500/20 border-2 border-gray-400 flex items-center justify-center text-2xl font-bold text-white mb-2">
                {leaders[1].user.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-sm font-semibold truncate max-w-[80px] text-center">{leaders[1].user.name}</p>
              <p className="text-gray-300 text-xs">${leaders[1].totalTipped.toFixed(2)}</p>
              <div className="mt-2 h-16 w-20 bg-gray-500/20 border border-gray-400/30 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-300 text-2xl font-bold">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center -mb-2">
              <Trophy className="w-8 h-8 text-yellow-400 mb-1" />
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-3xl font-bold text-white mb-2">
                {leaders[0].user.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold truncate max-w-[90px] text-center">{leaders[0].user.name}</p>
              <p className="text-yellow-400 text-sm font-semibold">${leaders[0].totalTipped.toFixed(2)}</p>
              <div className="mt-2 h-24 w-24 bg-yellow-500/20 border border-yellow-400/30 rounded-t-lg flex items-center justify-center">
                <span className="text-yellow-400 text-3xl font-bold">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-amber-700/20 border-2 border-amber-600 flex items-center justify-center text-xl font-bold text-white mb-2">
                {leaders[2].user.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-sm font-semibold truncate max-w-[70px] text-center">{leaders[2].user.name}</p>
              <p className="text-amber-500 text-xs">${leaders[2].totalTipped.toFixed(2)}</p>
              <div className="mt-2 h-10 w-20 bg-amber-700/20 border border-amber-600/30 rounded-t-lg flex items-center justify-center">
                <span className="text-amber-500 text-2xl font-bold">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" /> All-Time Rankings
        </h2>
        {leaders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No tips yet. Be the first to support!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((entry, i) => (
              <div key={entry.user.id} className={`flex items-center gap-4 p-4 rounded-xl border ${medalBg(i)}`}>
                <div className={`text-2xl font-bold w-8 text-center ${medalColor(i)}`}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {entry.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{entry.user.name}</p>
                  <p className="text-gray-400 text-xs">{entry.tipCount} tip{entry.tipCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${medalColor(i)}`}>${entry.totalTipped.toFixed(2)}</p>
                  <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                    <DollarSign className="w-3 h-3" /> total
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
