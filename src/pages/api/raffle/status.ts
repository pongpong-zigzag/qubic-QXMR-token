import type { NextApiRequest, NextApiResponse } from 'next';
import { loadState } from './entry_state';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const state = await loadState();
  const now = Date.now();
  const countdown = Math.max(0, Math.floor((state.roundEndsAt - now) / 1000));
  res.status(200).json({
    entries: state.entryPool.length,
    countdown,
    winner: state.winner,
  });
}
