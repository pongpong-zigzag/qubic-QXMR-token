import React, { useState, useEffect } from 'react';
import {
  Play,
  Gamepad2,
  Trophy,
  ShoppingCart,
  Award,
  Sparkles,
  Target,
  Shield,
  Clock3,
} from 'lucide-react';
import PacmanGameWrapper from './PacmanGameWrapper';
import LeaderboardModal from './LeaderboardModal';
import BuyGamesModal from './BuyGamesModal';
import PayLeaderboardModal from './PayLeaderboardModal';
import BuyGamesTransaction from './BuyGamesTransaction';
import { useUser } from '../contexts/UserContext';
import { useQubicConnect } from './connect/QubicConnectContext';
import { toast } from 'react-hot-toast';

const GameSection = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBuyGames, setShowBuyGames] = useState(false);
  const [showPayLeaderboard, setShowPayLeaderboard] = useState(false);
  const { user, refreshUser } = useUser();
  const { connected } = useQubicConnect();
  const hasLeaderboardAccess = user?.leaderboard_access === '1';
  const gamesRemaining = user ? Number(user.gameleft || '0') : 0;

  const formatNumber = (value?: string | number | null, digits = 0) => {
    if (value === undefined || value === null) {
      return '0';
    }
    const numeric = typeof value === 'number' ? value : parseFloat(value || '0');
    if (Number.isNaN(numeric)) {
      return '0';
    }
    return numeric.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const featureTiles: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      title: 'Modern Classic',
      description: 'CRT-inspired palette, crisp sound, and buttery animations.',
      icon: Sparkles,
    },
    {
      title: 'Wallet Optional',
      description: 'Drop in for free play, then connect to sync scores later.',
      icon: Shield,
    },
    {
      title: 'Leaderboard Ready',
      description: 'Opt-in runs stream straight to the global leaderboard.',
      icon: Trophy,
    },
    {
      title: 'Smooth Controls',
      description: 'Arrow keys and WASD supported with <12ms input lag.',
      icon: Clock3,
    },
  ];

  const journeySteps: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      title: 'Play instantly',
      description: 'Launch the Pacman overlay without leaving the page.',
      icon: Play,
    },
    {
      title: 'Link your wallet',
      description: 'Connect when you are ready to save scores and unlock perks.',
      icon: Shield,
    },
    {
      title: 'Climb the board',
      description: 'Submit high scores automatically and chase the top rank.',
      icon: Trophy,
    },
  ];

  const userStats = [
    {
      label: 'Leaderboard Score',
      value: formatNumber(user?.amount),
      icon: Trophy,
      accent: 'text-cyan-200',
    },
    {
      label: 'High Score',
      value: formatNumber(user?.highest),
      icon: Target,
      accent: 'text-purple-200',
    },
    {
      label: 'Games Remaining',
      value: gamesRemaining.toLocaleString('en-US'),
      icon: Clock3,
      accent: 'text-amber-200',
    },
  ];

  const previewFacts = [
    { label: 'Session Speed', value: 'Instant overlay' },
    { label: 'Ghost AI', value: 'Arcade-accurate' },
    { label: 'Score Sync', value: hasLeaderboardAccess ? 'Enabled' : 'Optional' },
  ];

  const handleBuyGames = () => {
    if (!connected) {
      toast.error('Connect your Qubic wallet to buy more plays.');
      return;
    }
    setShowBuyGames(true);
  };

  const handleJoinLeaderboard = () => {
    if (!connected) {
      toast.error('Connect your wallet to unlock leaderboard access.');
      return;
    }
    setShowPayLeaderboard(true);
  };

  const leaderboardStatus = !connected
    ? {
        badge: 'Offline',
        badgeClass: 'border border-white/20 bg-white/10 text-white/80',
        cardBorder: 'border-white/15',
        cardBg: 'bg-white/5',
        message: 'Connect your Qubic wallet to mirror every high-score run to the live leaderboard.',
        ctaLabel: null,
      }
    : hasLeaderboardAccess
    ? {
        badge: 'Live sync',
        badgeClass: 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
        cardBorder: 'border-emerald-400/30',
        cardBg: 'bg-emerald-500/5',
        message: 'Your connected sessions stream in real time. Keep stacking those points.',
        ctaLabel: null,
      }
    : {
        badge: 'Locked',
        badgeClass: 'border border-amber-300/40 bg-amber-300/20 text-amber-100',
        cardBorder: 'border-amber-300/40',
        cardBg: 'bg-amber-300/10',
        message: 'Activate leaderboard tracking so each connected run counts toward the hall-of-fame.',
        ctaLabel: 'Unlock leaderboard',
      };

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
      <section
        id="game"
        className="relative overflow-hidden py-24 bg-space text-white"
      >
        <div className="absolute inset-0 opacity-25 retro-grid" aria-hidden="true" />
        <div className="absolute inset-0 opacity-20 starfield" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" aria-hidden="true" />
        <div
          className="absolute -top-48 right-[-10%] h-[520px] w-[520px] rounded-full bg-electric/25 blur-[220px] animate-orbit"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-48 left-[-12%] h-[560px] w-[560px] rounded-full bg-purple-500/25 blur-[260px] animate-orbit"
          style={{ animationDirection: 'reverse' }}
          aria-hidden="true"
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[1.15fr,0.95fr]">
            <div className="relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_40px_120px_rgba(2,6,18,0.55)]">
              <div className="h-full p-8 md:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-500/10 p-3">
                      <Gamepad2 className="h-8 w-8 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-electricLight/80">Arcade Hub</p>
                      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-electric via-electricAccent to-cyan bg-clip-text text-transparent">
                        Play Pacman
                      </h2>
                    </div>
                  </div>
                  <span className="px-4 py-2 text-xs font-semibold tracking-[0.25em] uppercase rounded-full border border-white/15 text-electricLight">
                    Classic · Clean
                  </span>
                </div>
                <p className="mt-6 text-lg text-electricLight/80 max-w-2xl">
                  A modern, glassy take on the cabinet favorite. Practice instantly, connect when you are ready, and
                  push for leaderboard glory.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {featureTiles.map(({ title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur hover:border-cyan-300/60 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-xl bg-black/30 p-2">
                          <Icon className="h-5 w-5 text-cyan-300" />
                        </div>
                        <p className="font-semibold text-white">{title}</p>
                      </div>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm tracking-[0.35em] uppercase text-white/50">Live stats</p>
                    <span
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold ${
                        connected
                          ? 'border-emerald-300/60 bg-emerald-300/15 text-emerald-100'
                          : 'border-white/20 bg-white/10 text-white/70'
                      }`}
                    >
                      {connected ? 'Wallet linked' : 'Free mode active'}
                    </span>
                  </div>
                  {connected && user ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {userStats.map(({ label, value, icon: Icon, accent }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 ${accent}`} />
                            <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
                          </div>
                          <p className="text-2xl font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80">
                      Play for free anytime. Connect your Qubic wallet whenever you want to keep scores, buy extra plays,
                      and appear on the leaderboard.
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsGameOpen(true)}
                    className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-cyan-400/30 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-indigo-500/40"
                  >
                    <Play className="h-4 w-4 group-hover:animate-pulse" />
                    Play GAME
                  </button>
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-cyan-300/60 hover:text-white"
                  >
                    <Trophy className="h-4 w-4 text-yellow-300" />
                    View Leaderboard
                  </button>
                  <button
                    onClick={handleBuyGames}
                    className="flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-cyan-300/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!connected}
                  >
                    <ShoppingCart className="h-4 w-4 text-cyan-300" />
                    Buy Plays
                  </button>
                  {connected && !hasLeaderboardAccess && (
                    <button
                      onClick={handleJoinLeaderboard}
                    className="flex items-center gap-2 rounded-2xl border border-amber-300/40 bg-amber-300/15 px-6 py-3 text-sm font-semibold text-amber-100 transition-all duration-300 hover:border-amber-200 hover:bg-amber-300/25"
                    >
                      <Award className="h-4 w-4" />
                      Unlock Leaderboard
                    </button>
                  )}
                </div>

                <div className="mt-10 space-y-4">
                  {journeySteps.map(({ title, description, icon: Icon }, index) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 transition-all duration-300 hover:border-cyan-300/60 hover:bg-white/10"
                    >
                      <div className="rounded-2xl bg-black/70 p-3">
                        <Icon className="h-5 w-5 text-cyan-200" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-1">
                          Step {index + 1}
                        </p>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-sm text-white/70">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-[#101f46] via-[#0b1530] to-[#060912] p-6 md:p-8 shadow-[0_30px_80px_rgba(2,6,18,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">Live preview</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80">
                    Retro mode
                  </span>
                </div>
              </div>
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 bg-[#081330]">
                <div className="absolute inset-0 retro-grid opacity-40" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-500/25" />
                <div className="absolute inset-4 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full border-4 border-dashed border-yellow-300/40 animate-spin-slow" />
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-yellow-300/10">
                        <Gamepad2 className="h-10 w-10 text-yellow-300 animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-white/70">Overlay launches in a new glassy window.</p>
                  </div>
                </div>

                <div className="animate-float absolute left-6 top-6 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white/70 shadow-lg shadow-black/30">
                  <p className="text-white font-semibold">{formatNumber(user?.highest)}</p>
                  <p>Personal best</p>
                </div>
                <div className="animate-float-delay absolute bottom-6 right-6 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white/70 shadow-lg shadow-black/30">
                  <p className="text-white font-semibold">
                    {connected ? 'Synced' : 'Practice'}
                  </p>
                  <p>{connected ? 'Leaderboard ready' : 'Wallet optional'}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className={`rounded-2xl border ${leaderboardStatus.cardBorder} ${leaderboardStatus.cardBg} px-5 py-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">Leaderboard status</p>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${leaderboardStatus.badgeClass}`}>
                      {leaderboardStatus.badge}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{leaderboardStatus.message}</p>
                  {leaderboardStatus.ctaLabel && (
                    <button
                      onClick={handleJoinLeaderboard}
                      className="mt-3 text-sm font-semibold text-electric hover:text-electricAccent transition"
                    >
                      {leaderboardStatus.ctaLabel}
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {previewFacts.map(({ label, value }) => (
                    <div key={label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-white/90">{value}</p>
                    </div>
                  ))}
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
