import type { NextApiRequest, NextApiResponse } from 'next';
import { resetRaffle } from './entry_state';

const ADMIN_PASSWORD = process.env.RAFFLE_ADMIN_PASSWORD || 'changeme';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, durationSeconds } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Forbidden' });
  await resetRaffle(Number(durationSeconds) || 3600);
  res.status(200).json({ success: true });
}
