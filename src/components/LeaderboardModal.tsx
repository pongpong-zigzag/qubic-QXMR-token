import React, { useState, useEffect, useCallback } from 'react';
import { X, Trophy, Users, Award, Wallet } from 'lucide-react';
import { getLeaderboard, LeaderboardResponse } from '../services/backend.service';
import { useQubicConnect } from './connect/QubicConnectContext';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { wallet } = useQubicConnect();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(wallet?.publicKey);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [wallet?.publicKey]);

  useEffect(() => {
    if (isOpen) {
      void loadLeaderboard();
    }
  }, [isOpen, loadLeaderboard]);

  if (!isOpen) return null;

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount || '0');
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatWallet = (walletId: string) => {
    if (!walletId) return '--';
    return `${walletId.substring(0, 6)}…${walletId.substring(walletId.length - 6)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-[32px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_40px_140px_rgba(2,6,23,0.7)] overflow-hidden">
        <div className="absolute inset-x-0 -top-32 h-60 bg-electric/20 blur-[160px] pointer-events-none z-0" aria-hidden />
        <div className="relative p-8 overflow-y-auto max-h-[90vh] space-y-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-electric/15 p-3">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-electricLight/80">Live Standings</p>
                <h2 className="text-3xl font-bold text-white">Leaderboard</h2>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-white/80">
                Top 100
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/20 bg-black/30 p-2 text-white/70 hover:text-white hover:border-white/40 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-electric animate-spin" />
            </div>
          ) : leaderboard ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.3em] mb-2">
                    <Users className="w-4 h-4 text-electric" />
                    Total players
                  </div>
                  <p className="text-3xl font-semibold text-white">{leaderboard.total_users.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.3em] mb-2">
                    <Award className="w-4 h-4 text-amber-300" />
                    Your rank
                  </div>
                  <p className="text-3xl font-semibold text-amber-200">
                    {leaderboard.user_ranking ? `#${leaderboard.user_ranking.rank}` : '--'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.3em] mb-2">
                    <Wallet className="w-4 h-4 text-purple-300" />
                    Wallet
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-white/90 font-mono break-all">{wallet?.publicKey ? formatWallet(wallet.publicKey) : '--'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">ATH</p>
                        <p className="text-lg font-semibold text-purple-200">{user ? formatAmount(user.highest) : '--'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Current total</p>
                        <p className="text-lg font-semibold text-cyan-200">{user ? formatAmount(user.amount) : '--'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {leaderboard.top_users.map((player, index) => {
                  const isCurrentUser = wallet?.publicKey === player.walletid;
                  return (
                    <div
                      key={player.walletid}
                      className={`flex items-center gap-4 rounded-[20px] border border-white/10 bg-black/40 p-4 transition hover:border-electric/40 ${
                        isCurrentUser ? 'shadow-lg shadow-electric/20' : ''
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                          index === 0
                            ? 'bg-yellow-400/90 text-yellow-100'
                            : index === 1
                            ? 'bg-white/50 text-white/80'
                            : index === 2
                            ? 'bg-orange-300/50 text-orange-100'
                            : 'bg-white/5 text-white/60'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isCurrentUser ? 'text-electric' : 'text-white'}`}>
                          {isCurrentUser ? 'You' : `${player.walletid.substring(0, 6)}…${player.walletid.substring(player.walletid.length - 6)}`}
                        </p>
                        <p className="text-xs text-white/60">Current total: {formatAmount(player.amount)}</p>
                        <p className="text-xs text-white/45">ATH: {formatAmount(player.highest)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">{formatAmount(player.highest)}</p>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Current High Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-white/60">No leaderboard data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;

