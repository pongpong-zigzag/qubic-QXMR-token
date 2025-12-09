import React, { useState } from 'react';

const RaffleTemp: React.FC = () => {
  const [walletId, setWalletId] = useState('');
  const [walletIdTouched, setWalletIdTouched] = useState(false);
  const [entryCode, setEntryCode] = useState('');
  const [entryCodeTouched, setEntryCodeTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Validation
  const WALLET_ID_REGEX = /^[A-Z]{60}$/;
  const walletIdValid = WALLET_ID_REGEX.test(walletId);
  const entryCodeValid = entryCode === 'MILLY';
  const [entries, setEntries] = useState(0); // percent
  const [countdown, setCountdown] = useState(3600); // seconds

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Demo: fake entries progress
  React.useEffect(() => {
    if (entries >= 100) return;
    const interval = setInterval(() => setEntries(e => (e < 100 ? e + 1 : 100)), 3000);
    return () => clearInterval(interval);
  }, [entries]);

  function formatCountdown(secs: number) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function generateDummyTxId() {
  return Array.from({length: 60}, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
}

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/raffle/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, txId: generateDummyTxId(), amount: 1, entryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Submission failed. Try again.');
      } else {
        setMessage('Entry submitted! Good luck!');
        setWalletId('');
        setWalletIdTouched(false);
        setEntryCode('');
        setEntryCodeTouched(false);
      }
    } catch (err) {
      setMessage('Submission failed. Try again.');
    }
    setSubmitting(false);
  };


  return (
    <div className="flex flex-col items-center min-h-screen bg-space py-8">
      <div className="text-center text-2xl font-bold text-cyan-400 mb-8">TEMPORARY RAFFLE FORM</div>
      <div className="p-8 w-[500px] max-w-full bg-[#181d23] rounded-3xl h-fit border-2 border-cyan-400 mt-24">
        <h1 className="text-2xl font-extrabold mb-6 text-center text-cyan-300 tracking-tight">QXMR Raffle Entry</h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Wallet ID"
            className={`w-full text-xs border ${walletIdTouched && !walletIdValid ? 'border-red-500' : 'border-[#232a36]'} bg-[#232a36] text-white rounded-full p-3 focus:ring-2 focus:ring-cyan-400 font-mono tracking-tight`}
            required
            value={walletId}
            maxLength={60}
            onBlur={() => setWalletIdTouched(true)}
            onChange={e => setWalletId(e.target.value.toUpperCase())}
          />
          {walletIdTouched && !walletIdValid && (
            <div className="text-red-400 text-xs mt-1">Wallet ID must be exactly 60 uppercase letters (A-Z).</div>
          )}
          <input
            type="text"
            placeholder="Entry Code"
            className={`w-full text-xs border ${entryCodeTouched && !entryCodeValid ? 'border-red-500' : 'border-[#232a36]'} bg-[#232a36] text-white rounded-full p-3 focus:ring-2 focus:ring-cyan-400 font-mono tracking-tight`}
            required
            value={entryCode}
            onBlur={() => setEntryCodeTouched(true)}
            onChange={e => setEntryCode(e.target.value)}
          />
          {entryCodeTouched && !entryCodeValid && (
            <div className="text-red-400 text-xs mt-1">Please enter the raffle entry code</div>
          )}
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full p-3 text-lg tracking-wide disabled:opacity-50"
            disabled={submitting || !walletIdValid || !entryCodeValid}
          >
            {submitting ? 'Submitting…' : 'Enter Raffle'}
          </button>
        </form>
        {message && <div className="mt-6 text-center text-cyan-400 font-semibold">{message}</div>}
        {/* Entries Received & Countdown */}
        <div className="mt-11 bg-[#232a36]/80 rounded-3xl p-6 flex flex-col items-center">
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
      </div>
    </div>
  );
};

export default RaffleTemp;
