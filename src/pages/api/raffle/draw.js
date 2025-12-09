import { loadState, saveState, resetRaffle } from './entry_state';
const ADMIN_PASSWORD = process.env.RAFFLE_ADMIN_PASSWORD || 'changeme';
export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD)
        return res.status(403).json({ error: 'Forbidden' });
    const state = await loadState();
    if (state.winner)
        return res.status(400).json({ error: 'Winner already picked', winner: state.winner });
    if (state.entryPool.length === 0)
        return res.status(400).json({ error: 'No entries' });
    if (Date.now() < state.roundEndsAt)
        return res.status(400).json({ error: 'Raffle round not finished' });
    // Pick a winner
    const picked = state.entryPool[Math.floor(Math.random() * state.entryPool.length)];
    state.winner = picked;
    await saveState(state);
    res.status(200).json({ winner: picked });
}
// Admin reset endpoint
export async function resetHandler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { password, durationSeconds } = req.body;
    if (password !== ADMIN_PASSWORD)
        return res.status(403).json({ error: 'Forbidden' });
    await resetRaffle(Number(durationSeconds) || 3600);
    res.status(200).json({ success: true });
}
