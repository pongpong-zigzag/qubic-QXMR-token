import React, { useState } from 'react';

const StakeRaffleForm: React.FC = () => {
  const [walletId, setWalletId] = useState('');
  const [txId, setTxId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/stakeRaffle/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, txId, amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setWalletId('');
        setTxId('');
        setAmount('');
      } else {
        setStatus('error');
        setError(data.error || 'Submission failed');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Submission failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fafbfc' }}>
      <h2>Stake Raffle Entry</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Wallet ID
          <input
            type="text"
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            required
            style={{ width: '100%', margin: '4px 0 12px', padding: 8 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Transaction ID
          <input
            type="text"
            value={txId}
            onChange={e => setTxId(e.target.value)}
            required
            style={{ width: '100%', margin: '4px 0 12px', padding: 8 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Amount
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min="0"
            step="any"
            style={{ width: '100%', margin: '4px 0 12px', padding: 8 }}
          />
        </label>
        <button type="submit" disabled={status === 'loading'} style={{ padding: '10px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 4 }}>
          {status === 'loading' ? 'Submitting...' : 'Enter Raffle'}
        </button>
        {status === 'success' && <div style={{ color: 'green', marginTop: 12 }}>Entry submitted!</div>}
        {status === 'error' && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
};

export default function StakePage() {
  return (
    <main>
      <section style={{maxWidth: 600, margin: '2rem auto', padding: 24, background: '#222', borderRadius: 12, color: '#fff', boxShadow: '0 4px 24px #0002'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 700, marginBottom: 12, textAlign: 'center'}}>🔥 Introducing QXMR Staking: Earn Qubic, Fuel the Mission! 🔥</h1>
        <p style={{marginBottom: 16}}>
          The QXMR token was born as a tribute to Qubic’s legendary journey into Monero (XMR) mining—and since day one, its growth has been nothing short of explosive. What started as a nod to the network's power has evolved into a full-blown movement!
        </p>
        <p style={{marginBottom: 16}}><b>QXMR isn't just inspired by Qubic mining...<br/>It lives and breathes it.</b></p>
        <p style={{marginBottom: 16}}>
          From its name to its burn mechanics, QXMR has always revolved around the heartbeat of Qubic miners. So now, it’s time to take things to the next level...
        </p>
        <h2 style={{fontSize: '1.3rem', margin: '1.5rem 0 0.5rem'}}>💎 Stake QXMR. Earn Qubic. It's That Simple.</h2>
        <strong>We’re excited to introduce: QXMR STAKING!</strong>
        <h3 style={{fontSize: '1.1rem', margin: '1.2rem 0 0.5rem'}}>💥 How it works:</h3>
        <p style={{marginBottom: 16}}>
          When you stake your QXMR, you're not just locking up tokens—you’re plugging into the power of our mining engine. We take a portion of our real Qubic mining rewards and distribute them directly to you, our loyal stakers.
        </p>
        <p><b>No fluff. No gimmicks.<br/>Just raw Qubic, earned through mining, flowing to the QXMR community.</b></p>
        <div style={{background:'#111', padding:16, borderRadius:8, margin:'1rem 0', textAlign:'center', fontWeight:600, fontSize:'1.1rem', letterSpacing:1}}>
          🚨 LIMITED STARTUP SUPPLY: 5 BILLION QXMR 🚨<br/>
          <span style={{fontWeight:400}}>To kick things off, staking is limited to the first 5 billion QXMR!<br/>Once it’s full, it’s full — and those early stakers will be first in line to reap the rewards.</span>
        </div>
        <p style={{marginBottom: 16}}>
          ⏳ <b>Don’t wait. Don’t miss out. Stake now before the cap is reached.</b>
        </p>
        <h3 style={{fontSize: '1.1rem', margin: '1.2rem 0 0.5rem'}}>🌍 Why It Matters:</h3>
        <ul style={{marginLeft: 24, marginBottom: 16}}>
          <li>💡 <b>Utility with Purpose</b> – QXMR now actively fuels mining, not just symbolizes it.</li>
          <li>🚀 <b>Passive Rewards</b> – Stake and sit back as Qubic rolls in.</li>
          <li>🔥 <b>Aligned Incentives</b> – As mining thrives, so does QXMR—and so do you.</li>
        </ul>
        <p style={{marginBottom: 16}}>
          Join the next phase of the QXMR revolution.<br/>
          <b>Stake. Earn. And own your place in the future of decentralized mining.</b>
        </p>
        <a href="#stake-form" style={{display:'inline-block', background:'#00e9ff', color:'#111', fontWeight:700, fontSize:'1.1rem', padding:'12px 32px', borderRadius:6, textDecoration:'none', margin:'1rem auto', boxShadow:'0 2px 8px #00e9ff44', transition:'background 0.2s'}}>
          🚀 Start Staking Now →
        </a>
        <div style={{textAlign:'center', marginTop:8, color:'#aaa', fontSize:'0.95rem'}}>Power the network. Fuel your wallet. Secure your spot.</div>
      </section>
      <div id="stake-form">
        <StakeRaffleForm />
      </div>
    </main>
  );
}
