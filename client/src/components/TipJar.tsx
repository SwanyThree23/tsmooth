import { useState, useEffect } from 'react';
import { DollarSign, Heart, Trophy, Zap } from 'lucide-react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  receiverId?: string;
  roomId?: string;
  embedded?: boolean;
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

interface TipNotification {
  amount: number;
  message?: string;
  senderName: string;
}

export default function TipJar({ receiverId, roomId, embedded = false }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('5');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<TipNotification | null>(null);
  const [stripeKey, setStripeKey] = useState('');
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; chargesEnabled?: boolean } | null>(null);

  useEffect(() => {
    loadConnectStatus();
    const socket = socketService.connect();
    socket.on('tip:received', (data: any) => {
      setNotification({ amount: data.amount, message: data.message, senderName: data.senderName || 'Someone' });
      setTimeout(() => setNotification(null), 4000);
    });
    return () => { socket.off('tip:received'); };
  }, []);

  const loadConnectStatus = async () => {
    try {
      const data = await api.getStripeConnectStatus();
      setConnectStatus(data);
    } catch { setConnectStatus({ connected: false }); }
  };

  const handleOnboard = async () => {
    try {
      const data = await api.stripeConnectOnboard();
      window.location.href = data.url;
    } catch (err: any) { alert(err.message); }
  };

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) { alert('No creator selected'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt < 0.5) { alert('Minimum tip is $0.50'); return; }
    setLoading(true);
    try {
      const data = await api.createTipPaymentIntent(amt, receiverId, message);
      // In production integrate Stripe.js here for card collection
      alert(`Tip of $${amt} initiated! (Integrate Stripe.js Elements for card collection)\nCreator receives: $${data.creatorAmount.toFixed(2)}\nPlatform fee: $${data.platformFee.toFixed(2)}`);
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to process tip');
    } finally { setLoading(false); }
  };

  const wrapClass = embedded ? 'flex flex-col h-full p-4 space-y-4' : 'space-y-6';

  return (
    <div className={wrapClass}>
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tip Jar</h1>
          <p className="text-gray-400">Support your favourite creators — 90% goes directly to them</p>
        </div>
      )}

      {/* Incoming tip notification */}
      {notification && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
          <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-sm">
            <strong>{notification.senderName}</strong> tipped ${notification.amount}!
            {notification.message && <span className="italic"> "{notification.message}"</span>}
          </p>
        </div>
      )}

      {/* Stripe Connect Banner (for the creator themselves) */}
      {connectStatus && !connectStatus.connected && !receiverId && (
        <div className="glass rounded-xl p-4 border border-purple-500/30">
          <p className="text-white font-semibold mb-2">Accept Tips on Your Streams</p>
          <p className="text-gray-400 text-sm mb-3">Connect Stripe to receive 90% of every tip directly to your bank account.</p>
          <button onClick={handleOnboard} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
            Connect Stripe Account
          </button>
        </div>
      )}

      {/* Send Tip Form */}
      {receiverId && (
        <div className={embedded ? '' : 'glass rounded-xl p-6'}>
          {!embedded && <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500" /> Send a Tip</h2>}

          <form onSubmit={handleTip} className="space-y-4">
            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                    amount === String(preset)
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/40 text-gray-300 border border-purple-500/30 hover:border-purple-500'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Custom Amount ($)</label>
              <input
                type="number"
                min="0.50"
                step="0.50"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Message (optional)</label>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Keep up the great work!"
                maxLength={140}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {amount && parseFloat(amount) >= 0.5 && (
              <p className="text-xs text-gray-500">
                Creator receives: <span className="text-green-400">${(parseFloat(amount) * 0.9).toFixed(2)}</span>
                {' '}· Platform fee: <span className="text-gray-400">${(parseFloat(amount) * 0.1).toFixed(2)}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? 'Processing...' : `Send $${amount || '0'} Tip`}
            </button>
          </form>
        </div>
      )}

      {/* Leaderboard preview in embedded mode */}
      {embedded && <LeaderboardMini />}
    </div>
  );
}

function LeaderboardMini() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    api.getTipLeaderboard().then(setLeaders).catch(() => {});
  }, []);

  if (leaders.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-400" /> Top Supporters</p>
      <div className="space-y-1">
        {leaders.slice(0, 5).map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-300 truncate">{i + 1}. {entry.user?.name || 'Anonymous'}</span>
            <span className="text-green-400">${entry.totalTipped.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
