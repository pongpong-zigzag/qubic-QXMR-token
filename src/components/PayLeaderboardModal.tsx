import React, { useState } from 'react';
import { X, Trophy, Wallet } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';

interface PayLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const LEADERBOARD_PRICE = 10000; // 10,000 QXMR

const PayLeaderboardModal: React.FC<PayLeaderboardModalProps> = ({ isOpen, onClose, onPaymentComplete }) => {
  const { wallet, connected } = useQubicConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayLeaderboard = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      // Trigger the transaction component to handle the payment
      const payEvent = new CustomEvent('payLeaderboard', { detail: {} });
      window.dispatchEvent(payEvent);
      
      onClose();
      toast.loading('Processing transaction...', { id: 'pay-leaderboard' });
    } catch (error) {
      console.error('Error initiating leaderboard payment:', error);
      toast.error('Failed to initiate payment');
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
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">
              Join the Leaderboard
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Pay <span className="text-cyan-400 font-bold">1,000 QXMR</span> to join the leaderboard and compete for daily prizes!
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Benefits:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Your scores will appear on the leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Compete for daily prizes (1,000,000 Qubic to highest score each day)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Track your ranking among other players</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span>Play unlimited games for free</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Payment Amount:</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {LEADERBOARD_PRICE.toLocaleString()} QXMR
                </span>
              </div>
              <div className="text-sm text-gray-400">
                One-time payment for lifetime leaderboard access
              </div>
            </div>
          </div>

          {!connected ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-200 text-sm">
              Please connect your wallet to pay for leaderboard access
            </div>
          ) : (
            <button
              onClick={handlePayLeaderboard}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              {isProcessing ? 'Processing...' : `Pay ${LEADERBOARD_PRICE.toLocaleString()} QXMR`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayLeaderboardModal;

