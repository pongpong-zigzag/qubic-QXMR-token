import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const StakeRaffleForm = () => {
    const [walletId, setWalletId] = useState('');
    const [txId, setTxId] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
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
            }
            else {
                setStatus('error');
                setError(data.error || 'Submission failed');
            }
        }
        catch (err) {
            setStatus('error');
            setError(err.message || 'Submission failed');
        }
    };
    return (_jsxs("div", { style: { maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fafbfc' }, children: [_jsx("h2", { children: "Stake Raffle Entry" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { style: { display: 'block', marginBottom: 8 }, children: ["Wallet ID", _jsx("input", { type: "text", value: walletId, onChange: e => setWalletId(e.target.value), required: true, style: { width: '100%', margin: '4px 0 12px', padding: 8 } })] }), _jsxs("label", { style: { display: 'block', marginBottom: 8 }, children: ["Transaction ID", _jsx("input", { type: "text", value: txId, onChange: e => setTxId(e.target.value), required: true, style: { width: '100%', margin: '4px 0 12px', padding: 8 } })] }), _jsxs("label", { style: { display: 'block', marginBottom: 8 }, children: ["Amount", _jsx("input", { type: "number", value: amount, onChange: e => setAmount(e.target.value), required: true, min: "0", step: "any", style: { width: '100%', margin: '4px 0 12px', padding: 8 } })] }), _jsx("button", { type: "submit", disabled: status === 'loading', style: { padding: '10px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 4 }, children: status === 'loading' ? 'Submitting...' : 'Enter Raffle' }), status === 'success' && _jsx("div", { style: { color: 'green', marginTop: 12 }, children: "Entry submitted!" }), status === 'error' && _jsx("div", { style: { color: 'red', marginTop: 12 }, children: error })] })] }));
};
export default function StakePage() {
    return (_jsxs("main", { children: [_jsxs("section", { style: { maxWidth: 600, margin: '2rem auto', padding: 24, background: '#222', borderRadius: 12, color: '#fff', boxShadow: '0 4px 24px #0002' }, children: [_jsx("h1", { style: { fontSize: '2rem', fontWeight: 700, marginBottom: 12, textAlign: 'center' }, children: "\uD83D\uDD25 Introducing QXMR Staking: Earn Qubic, Fuel the Mission! \uD83D\uDD25" }), _jsx("p", { style: { marginBottom: 16 }, children: "The QXMR token was born as a tribute to Qubic\u2019s legendary journey into Monero (XMR) mining\u2014and since day one, its growth has been nothing short of explosive. What started as a nod to the network's power has evolved into a full-blown movement!" }), _jsx("p", { style: { marginBottom: 16 }, children: _jsxs("b", { children: ["QXMR isn't just inspired by Qubic mining...", _jsx("br", {}), "It lives and breathes it."] }) }), _jsx("p", { style: { marginBottom: 16 }, children: "From its name to its burn mechanics, QXMR has always revolved around the heartbeat of Qubic miners. So now, it\u2019s time to take things to the next level..." }), _jsx("h2", { style: { fontSize: '1.3rem', margin: '1.5rem 0 0.5rem' }, children: "\uD83D\uDC8E Stake QXMR. Earn Qubic. It's That Simple." }), _jsx("strong", { children: "We\u2019re excited to introduce: QXMR STAKING!" }), _jsx("h3", { style: { fontSize: '1.1rem', margin: '1.2rem 0 0.5rem' }, children: "\uD83D\uDCA5 How it works:" }), _jsx("p", { style: { marginBottom: 16 }, children: "When you stake your QXMR, you're not just locking up tokens\u2014you\u2019re plugging into the power of our mining engine. We take a portion of our real Qubic mining rewards and distribute them directly to you, our loyal stakers." }), _jsx("p", { children: _jsxs("b", { children: ["No fluff. No gimmicks.", _jsx("br", {}), "Just raw Qubic, earned through mining, flowing to the QXMR community."] }) }), _jsxs("div", { style: { background: '#111', padding: 16, borderRadius: 8, margin: '1rem 0', textAlign: 'center', fontWeight: 600, fontSize: '1.1rem', letterSpacing: 1 }, children: ["\uD83D\uDEA8 LIMITED STARTUP SUPPLY: 5 BILLION QXMR \uD83D\uDEA8", _jsx("br", {}), _jsxs("span", { style: { fontWeight: 400 }, children: ["To kick things off, staking is limited to the first 5 billion QXMR!", _jsx("br", {}), "Once it\u2019s full, it\u2019s full \u2014 and those early stakers will be first in line to reap the rewards."] })] }), _jsxs("p", { style: { marginBottom: 16 }, children: ["\u23F3 ", _jsx("b", { children: "Don\u2019t wait. Don\u2019t miss out. Stake now before the cap is reached." })] }), _jsx("h3", { style: { fontSize: '1.1rem', margin: '1.2rem 0 0.5rem' }, children: "\uD83C\uDF0D Why It Matters:" }), _jsxs("ul", { style: { marginLeft: 24, marginBottom: 16 }, children: [_jsxs("li", { children: ["\uD83D\uDCA1 ", _jsx("b", { children: "Utility with Purpose" }), " \u2013 QXMR now actively fuels mining, not just symbolizes it."] }), _jsxs("li", { children: ["\uD83D\uDE80 ", _jsx("b", { children: "Passive Rewards" }), " \u2013 Stake and sit back as Qubic rolls in."] }), _jsxs("li", { children: ["\uD83D\uDD25 ", _jsx("b", { children: "Aligned Incentives" }), " \u2013 As mining thrives, so does QXMR\u2014and so do you."] })] }), _jsxs("p", { style: { marginBottom: 16 }, children: ["Join the next phase of the QXMR revolution.", _jsx("br", {}), _jsx("b", { children: "Stake. Earn. And own your place in the future of decentralized mining." })] }), _jsx("a", { href: "#stake-form", style: { display: 'inline-block', background: '#00e9ff', color: '#111', fontWeight: 700, fontSize: '1.1rem', padding: '12px 32px', borderRadius: 6, textDecoration: 'none', margin: '1rem auto', boxShadow: '0 2px 8px #00e9ff44', transition: 'background 0.2s' }, children: "\uD83D\uDE80 Start Staking Now \u2192" }), _jsx("div", { style: { textAlign: 'center', marginTop: 8, color: '#aaa', fontSize: '0.95rem' }, children: "Power the network. Fuel your wallet. Secure your spot." })] }), _jsx("div", { id: "stake-form", children: _jsx(StakeRaffleForm, {}) })] }));
}
