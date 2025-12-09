import React, { useState, useEffect } from 'react';
import { Play, Gamepad2, Trophy, ShoppingCart, Award } from 'lucide-react';
import PacmanGameWrapper from './PacmanGameWrapper';
import LeaderboardModal from './LeaderboardModal';
import BuyGamesModal from './BuyGamesModal';
import PayLeaderboardModal from './PayLeaderboardModal';
import BuyGamesTransaction from './BuyGamesTransaction';
import { useUser } from '../contexts/UserContext';
import { useQubicConnect } from './connect/QubicConnectContext';
import { startGame } from '../services/backend.service';
import { toast } from 'react-hot-toast';

const GameSection = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBuyGames, setShowBuyGames] = useState(false);
  const [showPayLeaderboard, setShowPayLeaderboard] = useState(false);
  const { user, refreshUser } = useUser();
  const { connected } = useQubicConnect();

  useEffect(() => {
    // Handle ESC key to close game
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGameOpen) {
        setIsGameOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isGameOpen]);

  return (
    <>
      <section id="game" className="py-12 bg-gray-900/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Game Preview Section */}
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-lg blur opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 md:p-12 border border-cyan-500/30">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Gamepad2 className="w-10 h-10 text-cyan-400" />
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Play Pacman
                    </h2>
                  </div>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Experience the classic arcade game with a modern twist. Test your skills and aim for the high score!
                  </p>
                </div>

                {/* Game Preview */}
                <div className="relative w-full h-0 pb-[56.25%] bg-gray-950 rounded-lg overflow-hidden mb-8 border border-cyan-500/20">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20">
                    {/* Pacman Preview Animation */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <div className="w-24 h-24 border-4 border-transparent rounded-full border-t-yellow-400 border-r-yellow-400 animate-spin-slow"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gamepad2 className="w-12 h-12 text-yellow-400 animate-pulse" />
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm animate-pulse">Click Play to Start</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* User Score, Games Remaining and Actions */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  {connected && user && (
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg px-6 py-3 border border-cyan-500/30">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-gray-300 text-sm">Leaderboard Score:</span>
                          <span className="text-white font-bold text-lg">
                            {parseFloat(user.amount || '0').toLocaleString()}
                          </span>
                          {user.leaderboard_access !== '1' && (
                            <span className="text-yellow-400 text-xs">(Not on leaderboard)</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg px-6 py-3 border border-purple-500/30">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300 text-sm">High Score:</span>
                          <span className="text-white font-bold text-lg">
                            {parseFloat(user.highest || '0').toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {connected && user && user.leaderboard_access !== '1' && (
                      <button
                        onClick={() => setShowPayLeaderboard(true)}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50 flex items-center gap-2"
                      >
                        <Award className="w-5 h-5" />
                        Join Leaderboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Free play - no wallet required
                        setIsGameOpen(true);
                      }}
                      className="group relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-2"
                    >
                      <Play className="w-5 h-5 group-hover:animate-pulse" />
                      Play Game (Free)
                    </button>
                  </div>
                </div>

                {/* Game Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-white">Classic Experience</h3>
                    </div>
                    <p className="text-sm text-gray-400">Original Pacman gameplay with authentic arcade sounds</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold text-white">Simple Controls</h3>
                    </div>
                    <p className="text-sm text-gray-400">Use arrow keys to navigate and eat all the dots</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">High Score</h3>
                    </div>
                    <p className="text-sm text-gray-400">Challenge yourself to beat your best score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Overlay */}
      {isGameOpen && <PacmanGameWrapper onClose={() => setIsGameOpen(false)} />}
      
      {/* Leaderboard Modal */}
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      
      {/* Buy Games Modal */}
      <BuyGamesModal 
        isOpen={showBuyGames} 
        onClose={() => setShowBuyGames(false)}
        onPurchaseComplete={() => {
          refreshUser();
          setShowBuyGames(false);
        }}
      />
      
      {/* Pay Leaderboard Modal */}
      <PayLeaderboardModal 
        isOpen={showPayLeaderboard} 
        onClose={() => setShowPayLeaderboard(false)}
        onPaymentComplete={() => {
          refreshUser();
          setShowPayLeaderboard(false);
        }}
      />
      
      {/* Buy Games Transaction Component (hidden, handles transactions) */}
      <BuyGamesTransaction onPurchaseComplete={refreshUser} />
    </>
  );
};

export default GameSection;
