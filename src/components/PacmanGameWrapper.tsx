import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowLeft, Trophy, ShoppingCart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useQubicConnect } from './connect/QubicConnectContext';
import { startGame } from '../services/backend.service';
import { toast } from 'react-hot-toast';
import LeaderboardModal from './LeaderboardModal';
import BuyGamesModal from './BuyGamesModal';

interface PacmanGameWrapperProps {
  onClose: () => void;
}

const PacmanGameWrapper: React.FC<PacmanGameWrapperProps> = ({ onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user, updateScore, refreshUser } = useUser();
  const { connected, wallet } = useQubicConnect();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBuyGames, setShowBuyGames] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const lastScoreRef = useRef(0);
  const gameEndHandledRef = useRef(false);
  const startGameCalledRef = useRef(false); // Track if startGame has been called
  const startGameInProgressRef = useRef(false); // Track if startGame is currently in progress

  const handleGameEnd = React.useCallback(async (score: number) => {
    if (!connected || !wallet?.publicKey) {
      console.log('Not connected, skipping score update');
      toast.info(`Game Over! Score: ${score} points. Connect wallet to save your score.`);
      return;
    }

    console.log('Handling game end, updating score:', score);
    try {
      await updateScore(score);
      await refreshUser(); // Refresh user data to get updated highest
      // Check user state after refresh
      setTimeout(() => {
        if (user?.leaderboard_access !== '1') {
          toast.success(`Game Over! Score: ${score} points. Your high score is saved, but you're not on the leaderboard. Pay 1000 QXMR to join!`);
        } else {
          toast.success(`Game Over! Score saved: ${score} points`);
        }
      }, 500);
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    }
  }, [connected, wallet?.publicKey, updateScore, refreshUser]);

  // Send high score to game when user data loads
  useEffect(() => {
    if (!iframeRef.current || !user) return;
    
    const highScore = parseFloat(user.highest || '0');
    // Send even if 0 to replace default 10000

    // Retry sending high score multiple times as game loads
    let retryCount = 0;
    const maxRetries = 10;
    
    const sendHighScore = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'setHighScore',
          highScore: highScore.toString()
        }, '*');
        setGameHighScore(highScore);
        console.log('Sent high score to game:', highScore);
      }
      
      // Retry multiple times to ensure it's set (game loads asynchronously)
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(sendHighScore, 500); // Retry every 500ms
      }
    };

    // Start sending immediately and keep retrying
    sendHighScore();
  }, [user]);

  // Listen for messages from game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our game iframe
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'scoreUpdate') {
        const score = event.data.score || 0;
        const highScore = event.data.highScore || 0;
        setCurrentScore(score);
        setGameHighScore(highScore);
        
        // Reset game end flag when score changes
        if (score !== lastScoreRef.current) {
          gameEndHandledRef.current = false;
          lastScoreRef.current = score;
        }
      } else if (event.data.type === 'gameEnd') {
        const finalScore = event.data.finalScore || 0;
        if (finalScore > 0 && !gameEndHandledRef.current && connected) {
          gameEndHandledRef.current = true;
          console.log('Received game end event, final score:', finalScore);
          // Call immediately
          handleGameEnd(finalScore);
        } else if (finalScore > 0 && gameEndHandledRef.current) {
          console.log('Game end already handled, ignoring duplicate event');
        }
      } else if (event.data.type === 'highScoreUpdate') {
        const highScore = event.data.highScore || 0;
        setGameHighScore(highScore);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [connected, handleGameEnd]);

  // Allow free play - no wallet required
  useEffect(() => {
    const checkCanPlay = async () => {
      // Free play - always allow, but try to get user if wallet is connected
      if (connected && wallet?.publicKey) {
        // Prevent calling startGame multiple times - check both flags
        if (startGameCalledRef.current || startGameInProgressRef.current) {
          console.log('startGame already called or in progress, skipping');
          setCanPlay(true); // Still allow play
          return;
        }

        // Set both flags immediately (synchronously) before async call
        startGameCalledRef.current = true;
        startGameInProgressRef.current = true;

        let isDuplicateCall = false;
        try {
          const result = await startGame(wallet.publicKey);
          if (result.can_play) {
            setCanPlay(true);
            setGameStarted(true);
            await refreshUser(); // Refresh to get updated user data
          } else {
            setCanPlay(true); // Still allow free play
          }
        } catch (error: any) {
          // Don't show error for intentional duplicate call prevention
          if (error?.message === 'Game start already in progress' || 
              error?.message === 'Game start called too soon') {
            console.log('Duplicate call prevented:', error.message);
            isDuplicateCall = true;
            setCanPlay(true); // Still allow play
          } else {
            console.error('Error checking if can play:', error);
            setCanPlay(true); // Still allow free play even on error
          }
        } finally {
          // Only clear the in-progress flag if it wasn't a duplicate call
          if (!isDuplicateCall) {
            startGameInProgressRef.current = false;
          }
        }
      } else {
        // No wallet connected - allow free play
        setCanPlay(true);
        setGameStarted(true);
      }
    };

    checkCanPlay();
    
    // Reset refs when component unmounts so it can be called again if reopened
    return () => {
      startGameCalledRef.current = false;
      startGameInProgressRef.current = false;
    };
  }, [connected, wallet?.publicKey]);

  useEffect(() => {
    // Prevent body scrolling when game is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
      <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Header with Back Button */}
        <div className="absolute top-20 left-4 z-10">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-20 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-all duration-200 shadow-lg"
          aria-label="Close game"
        >
          <X size={24} />
        </button>

        {/* Game Container */}
        <div className="w-full max-w-[1200px] aspect-square max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl border border-cyan-500/30 relative">
          {canPlay && (
            <iframe
              ref={iframeRef}
              src="/pacman-master/game-wrapper.html"
              title="Pacman Game"
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>

        {/* Game Info */}
        <div className="mt-4 text-center text-white">
          <div className="flex items-center justify-center gap-6 text-sm">
            {connected && user ? (
              <>
                <div>
                  <span className="text-gray-400">Leaderboard Score: </span>
                  <span className="text-cyan-400 font-bold">
                    {parseFloat(user.amount || '0').toLocaleString()}
                  </span>
                  {user.leaderboard_access !== '1' && (
                    <span className="text-yellow-400 text-xs ml-2">(Not on leaderboard)</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400">Current: </span>
                  <span className="text-white font-bold">{currentScore}</span>
                </div>
                <div>
                  <span className="text-gray-400">High Score: </span>
                  <span className="text-yellow-400 font-bold">{gameHighScore}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-300">Connect wallet to save your score and join the leaderboard</p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">Use arrow keys to play</p>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      
      {/* Buy Games Modal */}
      <BuyGamesModal 
        isOpen={showBuyGames} 
        onClose={() => {
          setShowBuyGames(false);
          refreshUser(); // Refresh to check if games were added
        }}
        onPurchaseComplete={async () => {
          await refreshUser();
          setShowBuyGames(false);
          // Check again if can play (only if we haven't already started a game)
          if (wallet?.publicKey && !startGameCalledRef.current && !startGameInProgressRef.current) {
            try {
              startGameCalledRef.current = true;
              startGameInProgressRef.current = true;
              const result = await startGame(wallet.publicKey);
              if (result.can_play) {
                setCanPlay(true);
                setGameStarted(true);
                await refreshUser();
              } else {
                startGameCalledRef.current = false;
              }
            } catch (error) {
              console.error('Error checking game after purchase:', error);
              startGameCalledRef.current = false;
            } finally {
              startGameInProgressRef.current = false;
            }
          }
        }}
      />
    </div>
  );
};

export default PacmanGameWrapper;

