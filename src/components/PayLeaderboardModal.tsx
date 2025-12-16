import React, { useState } from 'react';
import { X, Trophy, Wallet, Sparkles, ShieldCheck } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';

interface PayLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const LEADERBOARD_PRICE = 25000; // 25,000 QXMR
const BENEFITS = [
  'Scores stream straight to the live leaderboard',
  'Eligible for weekly 10,000,000 Qubic prize pools',
  'Tracking of high scores & streaks',
  'Unlimited practice + premium stats overlays',
];

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
      toast.loading('Processing leaderboard access…', {
        id: 'pay-leaderboard',
        style: {
          background: 'rgba(4,7,18,0.92)',
          color: '#ecfeff',
          border: '1px solid rgba(78,224,252,0.35)',
          backdropFilter: 'blur(10px)',
        },
      });
      onPaymentComplete();
    } catch (error) {
      console.error('Error initiating leaderboard payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <div className="relative w-full max-w-xl rounded-[32px] border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_40px_140px_rgba(2,6,23,0.7)] overflow-hidden">
        <div className="absolute inset-x-0 -top-20 h-48 bg-electric/20 blur-[120px] pointer-events-none z-0" aria-hidden />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 rounded-full border border-white/20 bg-black/30 p-2 text-white/70 hover:text-white hover:border-white/40 transition"
        >
          <X size={18} />
        </button>

        <div className="relative p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-electric/15 p-3">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-electricLight/80">Leaderboard Access</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Unlock Hall-of-Fame Mode</h2>
              </div>
            </div>
            <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-white/80">
              25,000 QXMR
            </span>
          </div>

          <p className="text-sm text-white/80 font-light leading-relaxed">
            One on-chain contribution unlocks lifetime score syncing, prize eligibility, and access to the elite leaderboard layer.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-1">One-time fee</p>
              <p className="text-3xl font-semibold text-electric">{LEADERBOARD_PRICE.toLocaleString()} QXMR</p>
              <p className="text-xs text-white/60 mt-1">Secure direct transfer • No renewals</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Connection</p>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  connected
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/20 bg-white/10 text-white/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {connected ? 'Wallet linked' : 'Wallet required'}
              </span>
              {connected ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-black/40 px-4 py-3 text-xs font-mono text-white/80 break-all leading-relaxed">
                  {wallet?.publicKey}
                </div>
              ) : (
                <p className="text-xs text-white/60">Connect Qubic Wallet to continue</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/40 p-5 space-y-4">
            <div className="flex items-center gap-2 text-white/70 text-sm font-semibold uppercase tracking-[0.35em]">
              <Sparkles className="w-4 h-4 text-electric" />
              Perks
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="text-electric">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {!connected ? (
            <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-50">
              Connect your Qubic wallet to initiate the secure transaction.
            </div>
          ) : (
            <button
              onClick={handlePayLeaderboard}
              disabled={isProcessing}
              className="group w-full rounded-2xl border border-white/20 bg-gradient-to-r from-electric via-electricAccent to-cyan px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-electric/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5 group-hover:animate-pulse" />
              {isProcessing ? 'Authorizing…' : `Pay ${LEADERBOARD_PRICE.toLocaleString()} QXMR`}
            </button>
          )}

          <p className="text-xs text-white/60 text-center">
            Transactions settle directly on the Qubic network. A receipt will appear in your wallet history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayLeaderboardModal;

