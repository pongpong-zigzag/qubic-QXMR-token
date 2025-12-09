import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';

interface BuyGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const GAME_PRICE = 500000; // 500000 tokens per game

const BuyGamesModal: React.FC<BuyGamesModalProps> = ({ isOpen, onClose, onPurchaseComplete }) => {
  const { wallet, connected } = useQubicConnect();
  const [gamesToBuy, setGamesToBuy] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const totalPrice = gamesToBuy * GAME_PRICE;

  const handleBuyGames = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (gamesToBuy < 1) {
      toast.error('Please select at least 1 game');
      return;
    }

    setIsProcessing(true);
    try {
      // Trigger the transaction component to handle the purchase
      const buyEvent = new CustomEvent('buyGames', { detail: { games: gamesToBuy } });
      window.dispatchEvent(buyEvent);
      
      onClose();
      toast.loading('Processing transaction...', { id: 'buy-games' });
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('Failed to initiate game purchase');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-lg border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 p-6 border-b border-cyan-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">
              Buy More Games
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Each game costs <span className="text-cyan-400 font-bold">500,000 Qubic</span> tokens.
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20 mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Games
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setGamesToBuy(Math.max(1, gamesToBuy - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                  disabled={gamesToBuy <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={gamesToBuy}
                  onChange={(e) => setGamesToBuy(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center font-bold"
                />
                <button
                  onClick={() => setGamesToBuy(gamesToBuy + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Total Cost:</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {totalPrice.toLocaleString()} Qubic
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {gamesToBuy} game{gamesToBuy !== 1 ? 's' : ''} × 500,000 Qubic
              </div>
            </div>
          </div>

          {!connected ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-200 text-sm">
              Please connect your wallet to purchase games
            </div>
          ) : (
            <button
              onClick={handleBuyGames}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {isProcessing ? 'Processing...' : `Buy ${gamesToBuy} Game${gamesToBuy !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyGamesModal;

