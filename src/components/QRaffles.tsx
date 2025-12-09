import React, { useState, useEffect, useCallback } from 'react';

interface RaffleProps {
  raffleId?: string;
  title?: string;
}

const QRaffles: React.FC<RaffleProps> = ({ raffleId = 'default', title }) => {
  const [walletId, setWalletId] = useState('');
  const WALLET_ID_REGEX = /^[A-Z]{60}$/;
  const walletIdValid = WALLET_ID_REGEX.test(walletId);
  const [walletIdTouched, setWalletIdTouched] = useState(false);

  const [txId, setTxId] = useState('');
  const TXID_REGEX = /^[a-z]{60}$/;
  const txIdValid = TXID_REGEX.test(txId);
  const [txIdTouched, setTxIdTouched] = useState(false);

  const [amount, setAmount] = useState('');
  const amountValid = parseFloat(amount) >= 1000;

  const [entries, setEntries] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(3600);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/raffle/status?raffleId=${raffleId}`);
      const data = await response.json();
      if (response.ok) {
        setEntries(data.entries);
        setCountdown(data.countdown);
      }
    } catch (error) {
      console.error('Failed to fetch raffle status:', error);
    }
  }, [raffleId]);

  useEffect(() => {
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 5000);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(countdownInterval);
    };
  }, [fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletIdValid || !txIdValid || !amountValid) {
      setMessage('Please correct the errors before submitting.');
      setIsSuccess(false);
      return;
    }

    try {
      const response = await fetch(`/api/raffle/entry?raffleId=${raffleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId, txId, amount: parseFloat(amount) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Entry submitted successfully!');
        setIsSuccess(true);
        setWalletId('');
        setTxId('');
        setAmount('');
        setWalletIdTouched(false);
        setTxIdTouched(false);
        fetchStatus();
      } else {
        setMessage(data.message || 'Failed to submit entry.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'YOUR_ADMIN_PASSWORD') { // Replace with a secure check
      setIsAdmin(true);
      setShowAdminModal(false);
    }
  };

  const handleDraw = async () => {
    // Implement draw logic
  };

  const handleReset = async () => {
    // Implement reset logic
  };

  const formatCountdown = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-space py-8">
      {showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#181d23] p-8 rounded-lg">
            <h2 className="text-xl text-white mb-4">Admin Login</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded w-full mb-4"
            />
            <button onClick={handleAdminLogin} className="bg-cyan-500 text-white px-4 py-2 rounded">Login</button>
            <button onClick={() => setShowAdminModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded ml-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="p-8 w-[500px] max-w-full bg-[#181d23] rounded-3xl h-fit border-2 border-cyan-400 mt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">{title || 'QXMR Raffle'}</h1>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="walletId" className="block text-sm font-medium text-gray-300">Wallet ID</label>
            <input
              id="walletId"
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              onBlur={() => setWalletIdTouched(true)}
              className={`mt-1 block w-full px-3 py-2 bg-gray-800 border ${walletIdTouched && !walletIdValid ? 'border-red-500' : 'border-gray-600'} rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
            />
            {walletIdTouched && !walletIdValid && <p className="text-red-500 text-xs mt-1">Wallet ID must be 60 uppercase letters.</p>}
          </div>

          <div>
            <label htmlFor="txId" className="block text-sm font-medium text-gray-300">Transaction ID</label>
            <input
              id="txId"
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              onBlur={() => setTxIdTouched(true)}
              className={`mt-1 block w-full px-3 py-2 bg-gray-800 border ${txIdTouched && !txIdValid ? 'border-red-500' : 'border-gray-600'} rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
            />
            {txIdTouched && !txIdValid && <p className="text-red-500 text-xs mt-1">Transaction ID must be 60 lowercase letters.</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 bg-gray-800 border ${amount && !amountValid ? 'border-red-500' : 'border-gray-600'} rounded-md text-white shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm`}
            />
            {amount && !amountValid && <p className="text-red-500 text-xs mt-1">Minimum entry is 1000 QXMR.</p>}
          </div>

          {message && (
            <div className={`p-4 rounded-md ${isSuccess ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!walletIdValid || !txIdValid || !amountValid}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Enter Raffle
          </button>
        </form>

        {isAdmin && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg text-white mb-4">Admin Controls</h3>
            <button onClick={handleDraw} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Draw Winner</button>
            <button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded">Reset Raffle</button>
          </div>
        )}

        <div className="text-center mt-4">
          <button onClick={() => setShowAdminModal(true)} className="text-xs text-gray-500 hover:text-gray-300">Admin</button>
        </div>
      </div>
    </div>
  );
};

export default QRaffles;
