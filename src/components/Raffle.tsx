import React, { useState, useEffect } from 'react';


// Define the type for a single raffle, matching the backend structure
interface RaffleData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raffleAddress: string;
  prizeType: string;
  prizeValue: number;
  selectedToken: string;
  entryAmount: number;
  status: string;
  entries: any[];
  selectedQubicAsset?: string;
  actualItemDescription?: string;
}

type RaffleProps = { raffle: RaffleData };
const Raffle: React.FC<RaffleProps> = ({ raffle }) => {
  const [walletId, setWalletId] = useState('');
const WALLET_ID_REGEX = /^[A-Z]{60}$/;
const walletIdValid = WALLET_ID_REGEX.test(walletId);
const [walletIdTouched, setWalletIdTouched] = useState(false);
const [txId, setTxId] = useState('');
  const [amount, setAmount] = useState(raffle.entryAmount.toString());
  const TXID_REGEX = /^[a-z]{60}$/;
  const txIdValid = TXID_REGEX.test(txId);
  const [txIdTouched, setTxIdTouched] = useState(false);
  // entries is now a percent (0-100) from H2
  // entries is now a percent (0-100) from H2
  const [entries, setEntries] = useState<number>(0);
  // Debug: store last status response
  const [, setLastStatus] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(3600);

  // Decrement countdown every second if > 0
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // TEMP: If countdown is 0, reset to 3600 for testing
  useEffect(() => {
    if (countdown === 0) setCountdown(3600);
  }, [countdown]);
  const [winner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Admin UI state
  const [adminMode, setAdminMode] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const [adminPwInput, setAdminPwInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [resetSeconds, setResetSeconds] = useState(3600);
  const [adminActionMsg, setAdminActionMsg] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Poll raffle status every 5 seconds
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // Pass the correct raffleId from the props
        const res = await fetch(`/api/raffle/status?raffleId=${encodeURIComponent(raffle.id)}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries); 
          setLastStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch raffle status:', error);
      }
    };

    fetchEntries();
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, [raffle.id]); // Re-run if the raffleId changes

  // Format countdown as HH:MM:SS
  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      // Submit to backend, ensuring you use the correct raffleId from props
      const res = await fetch(`/api/raffle/entry?raffleId=${encodeURIComponent(raffle.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, txId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Submission failed. Try again.');
      } else {
        // Fetch updated entries count
        const statusRes = await fetch(`/api/raffle/status?raffleId=${encodeURIComponent(raffle.id)}`);
        if (statusRes.ok) {
          const { entries: newCount } = await statusRes.json();
          setEntries(newCount);
        }
        setMessage('Entry submitted! Good luck!');
        setWalletId('');
        setTxId('');
        setAmount(raffle.entryAmount.toString()); // Reset to the default for this raffle
        setWalletIdTouched(false);
        setTxIdTouched(false);
      }
    } catch (err) {
      setMessage('Submission failed. Try again.');
    }
    setSubmitting(false);
  };

  // Admin login modal logic
  const openAdminModal = () => {
    setAdminPwInput('');
    setAdminError('');
    setShowAdminModal(true);
  };
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPwInput.trim().length === 0) {
      setAdminError('Password required');
      return;
    }
    setAdminPw(adminPwInput);
    setAdminMode(true);
    setShowAdminModal(false);
  };
  const handleAdminLogout = () => {
    setAdminPw('');
    setAdminMode(false);
    setAdminActionMsg('');
  };

  // Admin draw winner
  const handleDrawWinner = async () => {
    setAdminActionMsg('');
    try {
      const res = await fetch('/api/raffle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPw }),
      });
      const data = await res.json();
      if (!res.ok) setAdminActionMsg(data.error || 'Failed to draw winner');
      else setAdminActionMsg('Winner drawn: ' + data.winner);
    } catch (e) {
      setAdminActionMsg('Network error');
    }
  };

  // Admin reset round
  const handleReset = async () => {
    setAdminActionMsg('');
    try {
      const res = await fetch('/api/raffle/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPw, durationSeconds: resetSeconds }),
      });
      const data = await res.json();
      if (!res.ok) setAdminActionMsg(data.error || 'Failed to reset');
      else setAdminActionMsg('Raffle reset!');
    } catch (e) {
      setAdminActionMsg('Network error');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-space py-8">
      {/* Admin modal */}
      {showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="max-w-4xl w-full mx-auto mt-8 bg-[#181d23] rounded-lg-2xl p-8 border-2 border-cyan-400 ">
            <h2 className="font-bold mb-2 text-cyan-300">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Admin password"
                value={adminPwInput}
                onChange={e => setAdminPwInput(e.target.value)}
                className="border border-[#232a36] bg-[#232a36] text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-400"
                required
              />
              {adminError && <div className="text-red-400 text-sm">{adminError}</div>}
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg p-2 font-semibold">Login</button>
            </form>
          </div>
        </div>
      )}
      <div className="p-8 w-[500px] max-w-full bg-[#181d23] rounded-3xl h-fit border-2 border-cyan-400 mt-24">
        <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-48 object-cover rounded-t-3xl mb-4" />
        <div className="flex justify-between items-center mb-2">
          <span className="uppercase font-bold text-cyan-400 text-sm tracking-wide">{raffle.title}</span>
        </div>
        <h1 className="text-2xl font-extrabold mb-4 text-center text-cyan-300 tracking-tight">{raffle.description}</h1>
        <div className="flex justify-end mb-2">
          {!adminMode && (
            <button onClick={openAdminModal} className="text-xs text-cyan-400 underline">Admin</button>
          )}
          {adminMode && (
            <button onClick={handleAdminLogout} className="text-xs text-red-400 underline ml-2">Logout</button>
          )}
        </div>
        <div className="mb-6 bg-[#232a36]/80 rounded-3xl p-6 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2 text-cyan-100">Entries Received</div>
          <div className="text-4xl font-extrabold text-cyan-300 tracking-tight drop-shadow-lg">{entries}<span className="text-xl align-top">%</span></div>
          <div className="w-full bg-gray-700 rounded-full h-6 mt-6 mb-6">
            <div
              className="h-6 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(Math.max(entries, 0), 100)}%`,
                background: 'linear-gradient(90deg, #19f3ff 0%, #38b6ff 100%)'
              }}
            ></div>
          </div>
          <div className="mt-4">
            <span className="font-semibold text-gray-300">Countdown:</span> <span className="text-2xl text-cyan-200 font-bold">{formatCountdown(countdown)}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Wallet ID"
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            onBlur={() => setWalletIdTouched(true)}
            className={`w-full text-xs border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400 font-mono tracking-tight ${walletIdTouched && !walletIdValid ? 'border-red-500' : ''}`}
            required
          />
          {!walletIdValid && walletIdTouched && walletId !== '' && (
            <div className="text-red-400 text-xs -mt-3 mb-1">Wallet ID must be 60 uppercase letters (A-Z).</div>
          )}
          <input
            type="text"
            placeholder="Transaction ID (tx id)"
            value={txId}
            onChange={e => setTxId(e.target.value)}
            onBlur={() => setTxIdTouched(true)}
            className={`w-full border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400 ${txIdTouched && !txIdValid ? 'border-red-500' : ''}`}
            required
          />
          {!txIdValid && txIdTouched && txId !== '' && (
            <div className="text-red-400 text-xs -mt-3 mb-1">Transaction ID must be 60 lowercase letters (a-z).</div>
          )}
          <input
            type="number"
            placeholder={`Amount of ${raffle.selectedToken} Sent`}
            value={amount}
            min={raffle.entryAmount}
            step={raffle.entryAmount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400"
            required
          />
          <button
            type="submit"
            disabled={submitting || countdown === 0 || !txIdValid || !walletIdValid}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full p-2 disabled:opacity-50 text-lg tracking-wide "
          >
            {submitting ? 'Submitting…' : 'Enter Raffle'}
          </button>
          {message && <div className="text-green-400 text-sm">{message}</div>}
        </form>

        {/* Admin controls */}
        {adminMode && (
          <div className="mt-8 p-4 border-t border-[#232a36]">
            <div className="font-semibold mb-2 text-cyan-200">Admin Controls</div>
            <div className="flex flex-col gap-2">
              <button onClick={handleDrawWinner} className="bg-yellow-400 hover:bg-yellow-300 text-[#232a36] font-bold rounded-lg p-2 shadow">Draw Winner</button>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={60}
                  step={60}
                  value={resetSeconds}
                  onChange={e => setResetSeconds(Number(e.target.value))}
                  className="border border-[#232a36] bg-[#232a36] text-white rounded-lg p-2 w-24 focus:ring-2 focus:ring-cyan-400"
                />
                <span className="text-xs text-gray-400">seconds for next round</span>
                <button onClick={handleReset} className="bg-cyan-600 hover:bg-cyan-400 text-white rounded-lg p-2 ml-2 font-semibold shadow">Reset Raffle</button>
              </div>
              {adminActionMsg && <div className="text-cyan-300 text-sm mt-2">{adminActionMsg}</div>}
            </div>
          </div>
        )}
      </div>
      {winner && (
        <div className="bg-[#232a36] border border-cyan-600 text-cyan-200 px-4 py-4 rounded-lg-2xl w-full max-w-4xl text-center  mt-2">
          <div className="text-2xl font-extrabold mb-2 text-cyan-300">🎉 Winner 🎉</div>
          <div className="break-all text-lg font-mono">{winner}</div>
        </div>
      )}
    </div>
  );
};

export default Raffle;
