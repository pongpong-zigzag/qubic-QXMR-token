import React, { useState, useEffect } from 'react';
import { Wallet, Smartphone, Shield, Zap, ExternalLink, CheckCircle2, AlertCircle, Trophy, Users, Award } from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton';
import TransactionButton from './TransactionButton';
import { useQubicConnect } from './connect/QubicConnectContext';
import { getLeaderboard, LeaderboardResponse } from '../services/backend.service';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

export const ConnectWalletSection: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const { connected, wallet } = useQubicConnect();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [wallet?.publicKey]);

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await getLeaderboard(wallet?.publicKey);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount || '0');
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <section id="connect-wallet" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Wallet className="w-10 h-10 text-electric" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-electric via-electricAccent to-cyan bg-clip-text text-transparent">
              Connect Your Wallet
            </h2>
          </div>
          <p className="text-xl text-electricLight/80 max-w-3xl mx-auto mt-4">
            Connect your <span className="text-electric font-semibold">Qubic Wallet</span> to interact with QXMR tokens, participate in raffles, and manage your assets on the Qubic network.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Side - Leaderboard */}
          <div className="space-y-8">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-electric/20">
              <h3 className="text-2xl font-semibold text-electric mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                Leaderboard
              </h3>
              
              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric"></div>
                </div>
              ) : leaderboard ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-400 text-xs">Total Players</span>
                      </div>
                      <p className="text-xl font-bold text-white">{leaderboard.total_users}</p>
                    </div>
                    {leaderboard.user_ranking && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-xs">Your Rank</span>
                        </div>
                        <p className="text-xl font-bold text-yellow-400">
                          #{leaderboard.user_ranking.rank}
                        </p>
                      </div>
                    )}
                    {user && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400 text-xs">Your Score</span>
                        </div>
                        <p className="text-xl font-bold text-purple-400">
                          {formatAmount(user.amount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Top Users List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-white mb-3">Top Players</h4>
                    <div className="space-y-2">
                      {leaderboard.top_users.slice(0, 10).map((player, index) => {
                        const isCurrentUser = wallet?.publicKey === player.walletid;
                        return (
                          <div
                            key={player.walletid}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              isCurrentUser
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/50'
                                : 'bg-gray-800/30 border-gray-700/50 hover:border-cyan-500/30'
                            }`}
                          >
                            <div className="flex-shrink-0 w-8 text-center">
                              <span
                                className={`text-sm font-bold ${
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
                                className={`font-medium truncate text-sm ${
                                  isCurrentUser ? 'text-cyan-400' : 'text-white'
                                }`}
                              >
                                {isCurrentUser ? 'You' : `${player.walletid.substring(0, 6)}...${player.walletid.substring(player.walletid.length - 6)}`}
                              </p>
                              <p className="text-xs text-gray-400">
                                High: {formatAmount(player.highest)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">
                                {formatAmount(player.amount)}
                              </p>
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

          {/* Right Side - Connection Area */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-electric/10 to-cyan/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-electric/30">
              <h3 className="text-2xl font-semibold text-electric mb-6 text-center">
                Connect Now
              </h3>
              
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="bg-black/60 rounded-xl p-6 w-full">
                  <ConnectWalletButton 
                    variant="default" 
                    size="lg" 
                  />
                </div>
                
                {connected && wallet && (
                  <>
                    <div className="w-full bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <p className="text-sm text-green-400 mb-2">Connected Address:</p>
                      <p className="font-mono text-sm break-all text-electricLight">{wallet.publicKey}</p>
                    </div>
                    <div className="bg-black/60 rounded-xl p-6 w-full">
                      <TransactionButton 
                        variant="default" 
                        size="lg" 
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    <p className="font-semibold mb-1">Don't have Qubic Wallet?</p>
                    <p className="text-yellow-200/80">Download it from the official app stores to get started.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-electric/20">
              <h3 className="text-xl font-semibold text-electric mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </h3>
              <ul className="space-y-3 text-electricLight/90 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-electric">•</span>
                  <span>Your private keys never leave your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-electric">•</span>
                  <span>No personal information is stored or shared</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-electric">•</span>
                  <span>All connections are encrypted and secure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-electric">•</span>
                  <span>You maintain full control of your assets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Download Links */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-electric/20">
          <h3 className="text-2xl font-semibold text-electric mb-6 text-center">
            Get Qubic Wallet
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://apps.apple.com/us/app/qubic-wallet/id6502265811"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/50"
            >
              <Smartphone className="w-5 h-5" />
              <span>Download for iOS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=org.qubic.wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-green-500/50"
            >
              <Smartphone className="w-5 h-5" />
              <span>Download for Android</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-center text-electricLight/60 text-sm mt-4">
            Make sure you download the official Qubic Wallet app to ensure security and compatibility
          </p>
        </div>
      </div>
    </section>
  );
};



