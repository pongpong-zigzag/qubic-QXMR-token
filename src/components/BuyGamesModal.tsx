import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';

interface BuyGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const GAME_PRICE = 500000; // 500000 QXMR tokens per game

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
      onPurchaseComplete();
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('Failed to initiate game purchase');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <div className="relative w-full max-w-lg rounded-[32px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_40px_120px_rgba(2,6,18,0.65)] overflow-hidden">
        <div className="absolute inset-x-0 -top-24 h-48 bg-electric/20 blur-[140px] pointer-events-none z-0" aria-hidden />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 rounded-full border border-white/20 bg-black/30 p-2 text-white/70 hover:text-white hover:border-white/40 transition"
        >
          <X size={18} />
        </button>

        <div className="relative p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-electric/15 p-3">
              <ShoppingCart className="w-8 h-8 text-electric" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-electricLight/80">Arcade Credits</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Buy More Games</h2>
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">
            Each connected run costs <span className="text-electric font-semibold">500,000 QXMR</span>. Pick how many sessions you
            want to preload and we’ll route the purchase through your Qubic wallet.
          </p>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Number of games</p>
              <span className="text-xs text-white/60">Min 1</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGamesToBuy(Math.max(1, gamesToBuy - 1))}
                className="w-12 h-12 rounded-2xl border border-white/15 bg-black/40 text-white text-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-electric hover:text-electric transition"
                disabled={gamesToBuy <= 1}
              >
                –
              </button>
              <input
                type="number"
                min="1"
                value={gamesToBuy}
                onChange={(e) => setGamesToBuy(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-center text-2xl font-semibold text-white focus:border-electric focus:outline-none"
              />
              <button
                onClick={() => setGamesToBuy(gamesToBuy + 1)}
                className="w-12 h-12 rounded-2xl border border-white/15 bg-black/40 text-white text-xl font-semibold hover:border-electric hover:text-electric transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-1">Total cost</p>
              <p className="text-3xl font-semibold text-electric">{totalPrice.toLocaleString()} QXMR</p>
              <p className="text-xs text-white/60 mt-1">
                {gamesToBuy} game{gamesToBuy !== 1 ? 's' : ''} × 500,000 QXMR
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-2">Wallet status</p>
              {connected ? (
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100 break-all">
                  {wallet?.publicKey}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-xs text-amber-50">
                  Connect your Qubic wallet to continue.
                </div>
              )}
            </div>
          </div>

          {!connected ? (
            <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-50">
              Please connect your wallet to purchase games.
            </div>
          ) : (
            <button
              onClick={handleBuyGames}
              disabled={isProcessing}
              className="group w-full rounded-2xl border border-white/20 bg-gradient-to-r from-electric via-electricAccent to-cyan px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-electric/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 group-hover:animate-pulse" />
              {isProcessing ? 'Authorizing…' : `Buy ${gamesToBuy} Game${gamesToBuy !== 1 ? 's' : ''}`}
            </button>
          )}

          <p className="text-xs text-white/60 text-center">
            Purchases settle directly on chain. Games appear as soon as the transaction confirms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyGamesModal;

