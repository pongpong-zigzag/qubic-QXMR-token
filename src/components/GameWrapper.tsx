import React, { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import PacmanGame from '../game/PacmanGame';
import { useUser } from '../contexts/UserContext';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';
import LeaderboardModal from './LeaderboardModal';

interface GameWrapperProps {
  onClose: () => void;
}

const GameWrapper: React.FC<GameWrapperProps> = ({ onClose }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<PacmanGame | null>(null);
  const { user, updateScore } = useUser();
  const { connected } = useQubicConnect();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameEnd = React.useCallback(async (score: number) => {
    if (!connected) {
      console.log('Not connected, skipping score update');
      return;
    }

    try {
      await updateScore(score);
      toast.success(`Score updated! +${score} points`);
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    }
  }, [connected, updateScore]);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Initialize game
    const game = new PacmanGame(gameContainerRef.current);
    gameInstanceRef.current = game;
    let lastScore = 0;
    let gameEndHandled = false;

    // Wait for game to be ready
    game.onReady(() => {
      console.log('Game ready');
    });

    // Monitor game score and game end
    const gameMonitor = setInterval(() => {
      if (!game) return;

      const gameAny = game as any;
      const score = gameAny.score || 0;
      const gameEnded = gameAny.gameEnded || false;

      // Update current score display
      if (score !== lastScore) {
        setCurrentScore(score);
        lastScore = score;
      }

      // Handle game end
      if (gameEnded && !gameEndHandled && score > 0 && connected) {
        gameEndHandled = true;
        handleGameEnd(score);
      }

      // Reset flag when game restarts
      if (!gameEnded && gameEndHandled) {
        gameEndHandled = false;
      }
    }, 200);

    return () => {
      clearInterval(gameMonitor);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [connected, handleGameEnd]);

  const handleStart = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.start();
      setGameStarted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
      <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Header with Leaderboard Button */}
        <div className="absolute top-20 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg font-medium"
          >
            ← Back
          </button>
          
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg font-medium"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        {/* Game Container */}
        <div className="w-full max-w-[1200px] aspect-square max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl border border-cyan-500/30">
          <div ref={gameContainerRef} className="w-full h-full" />
          
          {/* Start Button Overlay */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg px-8 py-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
              >
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="mt-4 text-center text-white">
          <p className="text-sm text-gray-300">
            {connected && user ? (
              <>Your Score: {parseFloat(user.amount || '0').toLocaleString()} | Current: {currentScore}</>
            ) : (
              'Connect wallet to save your score'
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">Use arrow keys or touch to play</p>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
};

export default GameWrapper;

