import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Award } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, wallet?.publicKey]);

  const loadLeaderboard = async () => {
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
  };

  if (!isOpen) return null;

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount || '0');
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-lg border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 p-6 border-b border-cyan-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">
              Leaderboard
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : leaderboard ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-400 text-sm">Total Players</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{leaderboard.total_users}</p>
                </div>
                {leaderboard.user_ranking && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Your Rank</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">
                      #{leaderboard.user_ranking.rank}
                    </p>
                  </div>
                )}
                {user && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Your Score</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatAmount(user.amount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Top Users List */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white mb-4">Top 100 Players</h3>
                <div className="space-y-2">
                  {leaderboard.top_users.map((player, index) => {
                    const isCurrentUser = wallet?.publicKey === player.walletid;
                    return (
                      <div
                        key={player.walletid}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/50'
                            : 'bg-gray-800/30 border-gray-700/50 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <span
                            className={`text-lg font-bold ${
                              index === 0
                                ? 'text-yellow-400'
                                : index === 1
                                ? 'text-gray-300'
                                : index === 2
                                ? 'text-orange-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              isCurrentUser ? 'text-cyan-400' : 'text-white'
                            }`}
                          >
                            {isCurrentUser ? 'You' : `${player.walletid.substring(0, 8)}...${player.walletid.substring(player.walletid.length - 8)}`}
                          </p>
                          <p className="text-sm text-gray-400">
                            Highest: {formatAmount(player.highest)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            {formatAmount(player.amount)}
                          </p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No leaderboard data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;

