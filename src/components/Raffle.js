import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const RAFFLE_ADDRESS = 'TEST';
const MIN_ENTRY_AMOUNT = 1000; // QXMR
const Raffle = ({ raffleId = 'default', title }) => {
    const [walletId, setWalletId] = useState('');
    const WALLET_ID_REGEX = /^[A-Z]{60}$/;
    const walletIdValid = WALLET_ID_REGEX.test(walletId);
    const [walletIdTouched, setWalletIdTouched] = useState(false);
    const [txId, setTxId] = useState('');
    const [amount, setAmount] = useState('');
    const TXID_REGEX = /^[a-z]{60}$/;
    const txIdValid = TXID_REGEX.test(txId);
    const [txIdTouched, setTxIdTouched] = useState(false);
    // entries is now a percent (0-100) from H2
    // entries is now a percent (0-100) from H2
    const [entries, setEntries] = useState(0);
    // Debug: store last status response
    const [lastStatus, setLastStatus] = useState(null);
    const [countdown, setCountdown] = useState(3600);
    // Decrement countdown every second if > 0
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    // TEMP: If countdown is 0, reset to 3600 for testing
    useEffect(() => {
        if (countdown === 0)
            setCountdown(3600);
    }, [countdown]);
    const [winner, setWinner] = useState(null);
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
    // Poll raffle status every 3 seconds
    useEffect(() => {
        // Fetch entries count from Google Sheet via backend
        const fetchEntries = async () => {
            try {
                const res = await fetch(`/api/raffle/status?raffleId=${encodeURIComponent(raffleId)}`);
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data.entries);
                    setLastStatus(data);
                }
            }
            catch { }
        };
        fetchEntries();
        const interval = setInterval(fetchEntries, 5000);
        return () => clearInterval(interval);
    }, []);
    // Format countdown as HH:MM:SS
    const formatCountdown = (secs) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    // Handle form submission
    const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScZ6Cw3N5Qd2n2jKZ7CwF9rjvK6oKpZ4nQ/formResponse'; // <-- Replace with your actual Google Form action URL
    const FIELD_WALLET_ID = 'entry.1234567890'; // <-- Replace with your Wallet ID field entry ID
    const FIELD_TX_ID = 'entry.2345678901'; // <-- Replace with your Tx ID field entry ID
    const FIELD_AMOUNT = 'entry.3456789012'; // <-- Replace with your Amount field entry ID
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        try {
            // Submit to backend
            const res = await fetch(`/api/raffle/entry?raffleId=${encodeURIComponent(raffleId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletId, txId, amount }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.error || 'Submission failed. Try again.');
            }
            else {
                // Fetch updated entries count
                const statusRes = await fetch(`/api/raffle/status?raffleId=${encodeURIComponent(raffleId)}`);
                if (statusRes.ok) {
                    const { entries: newCount } = await statusRes.json();
                    setEntries(newCount);
                }
                setMessage('Entry submitted! Good luck!');
                setWalletId('');
                setTxId('');
                setAmount('');
                setWalletIdTouched(false);
                setTxIdTouched(false);
                // Reset touched states after successful submit to avoid showing errors
                // (extra redundancy)
                setTimeout(() => {
                    setWalletIdTouched(false);
                    setTxIdTouched(false);
                }, 0);
            }
        }
        catch (err) {
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
    const handleAdminLogin = (e) => {
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
            if (!res.ok)
                setAdminActionMsg(data.error || 'Failed to draw winner');
            else
                setAdminActionMsg('Winner drawn: ' + data.winner);
        }
        catch (e) {
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
            if (!res.ok)
                setAdminActionMsg(data.error || 'Failed to reset');
            else
                setAdminActionMsg('Raffle reset!');
        }
        catch (e) {
            setAdminActionMsg('Network error');
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center min-h-screen bg-space py-8", children: [showAdminModal && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50", children: _jsxs("div", { className: "max-w-4xl w-full mx-auto mt-8 bg-[#181d23] rounded-lg-2xl p-8 border-2 border-cyan-400 ", children: [_jsx("h2", { className: "font-bold mb-2 text-cyan-300", children: "Admin Login" }), _jsxs("form", { onSubmit: handleAdminLogin, className: "flex flex-col gap-3", children: [_jsx("input", { type: "password", placeholder: "Admin password", value: adminPwInput, onChange: e => setAdminPwInput(e.target.value), className: "border border-[#232a36] bg-[#232a36] text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-400", required: true }), adminError && _jsx("div", { className: "text-red-400 text-sm", children: adminError }), _jsx("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg p-2 font-semibold", children: "Login" })] })] }) })), _jsxs("div", { className: "p-8 w-[500px] max-w-full bg-[#181d23] rounded-3xl h-fit border-2 border-cyan-400 mt-24", children: [_jsx("div", { className: "flex justify-between items-center mb-2", children: _jsx("span", { className: "uppercase font-bold text-cyan-400 text-sm tracking-wide", children: title }) }), _jsx("h1", { className: "text-2xl font-extrabold mb-4 text-center text-cyan-300 tracking-tight", children: "QXMR Raffle Entry" }), _jsxs("div", { className: "flex justify-end mb-2", children: [!adminMode && (_jsx("button", { onClick: openAdminModal, className: "text-xs text-cyan-400 underline", children: "Admin" })), adminMode && (_jsx("button", { onClick: handleAdminLogout, className: "text-xs text-red-400 underline ml-2", children: "Logout" }))] }), _jsxs("p", { className: "mb-2 text-sm text-gray-300", children: ["Send ", _jsx("span", { className: "font-semibold text-cyan-200", children: "1,000 QXMR" }), " per entry to:"] }), _jsx("div", { className: "mb-4 text-xs bg-[#232a36] p-2 rounded-full border border-[#232a36] text-cyan-100 select-all", children: RAFFLE_ADDRESS }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsx("input", { type: "text", placeholder: "Wallet ID", value: walletId, onChange: e => setWalletId(e.target.value), onBlur: () => setWalletIdTouched(true), className: `w-full text-xs border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400 font-mono tracking-tight ${walletIdTouched && !walletIdValid ? 'border-red-500' : ''}`, required: true }), !walletIdValid && walletIdTouched && walletId !== '' && (_jsx("div", { className: "text-red-400 text-xs -mt-3 mb-1", children: "Wallet ID must be 60 uppercase letters (A-Z)." })), _jsx("input", { type: "text", placeholder: "Transaction ID (tx id)", value: txId, onChange: e => setTxId(e.target.value), onBlur: () => setTxIdTouched(true), className: `w-full border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400 ${txIdTouched && !txIdValid ? 'border-red-500' : ''}`, required: true }), !txIdValid && txIdTouched && txId !== '' && (_jsx("div", { className: "text-red-400 text-xs -mt-3 mb-1", children: "Transaction ID must be 60 lowercase letters (a-z)." })), _jsx("input", { type: "number", placeholder: "Amount of QXMR Sent", value: amount, min: MIN_ENTRY_AMOUNT, step: MIN_ENTRY_AMOUNT, onChange: e => setAmount(e.target.value), className: "w-full border border-[#232a36] bg-[#232a36] text-white rounded-full p-2 focus:ring-2 focus:ring-cyan-400", required: true }), _jsx("button", { type: "submit", disabled: submitting || countdown === 0 || !txIdValid || !walletIdValid, className: "bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full p-2 disabled:opacity-50 text-lg tracking-wide ", children: submitting ? 'Submitting…' : 'Enter Raffle' }), message && _jsx("div", { className: "text-green-400 text-sm", children: message })] }), _jsxs("div", { className: "mt-11 bg-[#232a36]/80 rounded-3xl p-6 flex flex-col items-center", children: [_jsx("div", { className: "text-lg font-semibold mb-2 text-cyan-100", children: "Entries Received" }), _jsxs("div", { className: "text-4xl font-extrabold text-cyan-300 tracking-tight drop-shadow-lg", children: [entries, _jsx("span", { className: "text-xl align-top", children: "%" })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-6 mt-6 mb-6", children: _jsx("div", { className: "h-6 rounded-full transition-all duration-500", style: {
                                        width: `${Math.min(Math.max(entries, 0), 100)}%`,
                                        background: 'linear-gradient(90deg, #19f3ff 0%, #38b6ff 100%)'
                                    } }) }), _jsxs("div", { className: "mt-4", children: [_jsx("span", { className: "font-semibold text-gray-300", children: "Countdown:" }), " ", _jsx("span", { className: "text-2xl text-cyan-200 font-bold", children: formatCountdown(countdown) })] })] }), adminMode && (_jsxs("div", { className: "mt-8 p-4 border-t border-[#232a36]", children: [_jsx("div", { className: "font-semibold mb-2 text-cyan-200", children: "Admin Controls" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { onClick: handleDrawWinner, className: "bg-yellow-400 hover:bg-yellow-300 text-[#232a36] font-bold rounded-lg p-2 shadow", children: "Draw Winner" }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("input", { type: "number", min: 60, step: 60, value: resetSeconds, onChange: e => setResetSeconds(Number(e.target.value)), className: "border border-[#232a36] bg-[#232a36] text-white rounded-lg p-2 w-24 focus:ring-2 focus:ring-cyan-400" }), _jsx("span", { className: "text-xs text-gray-400", children: "seconds for next round" }), _jsx("button", { onClick: handleReset, className: "bg-cyan-600 hover:bg-cyan-400 text-white rounded-lg p-2 ml-2 font-semibold shadow", children: "Reset Raffle" })] }), adminActionMsg && _jsx("div", { className: "text-cyan-300 text-sm mt-2", children: adminActionMsg })] })] }))] }), winner && (_jsxs("div", { className: "bg-[#232a36] border border-cyan-600 text-cyan-200 px-4 py-4 rounded-lg-2xl w-full max-w-4xl text-center  mt-2", children: [_jsx("div", { className: "text-2xl font-extrabold mb-2 text-cyan-300", children: "\uD83C\uDF89 Winner \uD83C\uDF89" }), _jsx("div", { className: "break-all text-lg font-mono", children: winner })] }))] }));
};
export default Raffle;
