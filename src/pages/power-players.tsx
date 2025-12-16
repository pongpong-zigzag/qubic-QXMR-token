import React, { useEffect, useState } from 'react';

type WalletEntry = {
  walletId: string;
  verifiedAt?: string | null;
};

const WALLET_ID_REGEX = /^[A-Z]{60}$/;

const PowerPlayersPage: React.FC = () => {
  const [walletId, setWalletId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const [verified, setVerified] = useState<WalletEntry[]>([]);
  const [loadingVerified, setLoadingVerified] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const toUpper = (s: string) => s.toUpperCase();

  const fetchVerified = async () => {
    try {
      setLoadingVerified(true);
      setLoadErr(null);
      const resp = await fetch('/api/power-players');
      if (!resp.ok) throw new Error('Failed to load verified power players');
      const data: WalletEntry[] = await resp.json();
      setVerified(data);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingVerified(false);
    }
  };

  useEffect(() => {
    fetchVerified();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    setSubmitErr(null);
    const normalized = toUpper(walletId.trim());
    if (!WALLET_ID_REGEX.test(normalized)) {
      setSubmitErr('Wallet ID must be 60 uppercase letters.');
      return;
    }
    try {
      setSubmitting(true);
      const resp = await fetch('/api/power-players/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: normalized }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Submission failed');
      }
      setSubmitMsg('Submitted! Awaiting verification.');
      setWalletId('');
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative py-16"
      style={{
        backgroundImage: "url('/assets/power-players-bg.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="relative container mx-auto px-4 max-w-3xl mt-16">

        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold text-[#23FFFF] mb-4 text-center w-fit mx-auto">If you bought 50m+ $QXMR</h2>
          <h2 className="text-xl font-semibold text-[#23FFFF] mb-4 text-center w-fit mx-auto">On QX, Qxboard, or Qubictrade</h2>
          <h2 className="text-xl font-semibold text-[#23FFFF] mb-4 text-center w-fit mx-auto">Submit your wallet for verification</h2>
          <p className="text-sm font-italic text-cyan-300 mb-4 text-center w-fit mx-auto">Airdrops and QSwap transactions are excluded.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Wallet ID</label>
              <input
                type="text"
                value={walletId}
                onChange={(e) => setWalletId(toUpper(e.target.value))}
                placeholder="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white tracking-wide"
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-400">Must be exactly 60 uppercase letters.</p>
            </div>
            {submitErr && <p className="text-sm text-red-400">{submitErr}</p>}
            {submitMsg && <p className="text-sm text-green-400">{submitMsg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-60 border-2 border-[#23FFFF]"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold text-cyan-300 mb-4 text-center w-fit mx-auto">Verified Power Players</h2>
          {loadingVerified ? (
            <p className="text-gray-400">Loading...</p>
          ) : loadErr ? (
            <p className="text-red-400">{loadErr}</p>
          ) : verified.length === 0 ? (
            <p className="text-gray-400">No verified wallets yet.</p>
          ) : (
            <ul className="space-y-2">
              {verified.map((w) => (
                <li key={w.walletId} className="flex items-center justify-between bg-gray-900/70 border border-gray-800 rounded-md px-3 py-2">
                  <span className="font-mono text-sm break-all text-[#23FFFF]">{w.walletId}</span>
                  {w.verifiedAt && (
                    <span className="text-xs text-gray-400">{new Date(w.verifiedAt).toLocaleString()}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default PowerPlayersPage;
