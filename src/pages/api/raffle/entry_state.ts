// Shared in-memory state for raffle API routes
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/pages/api/raffle/raffle_data.json');

export interface RaffleState {
  entryPool: string[];
  winner: string | null;
  roundEndsAt: number;
}

export async function loadState(): Promise<RaffleState> {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Default state if file missing/corrupt
    return { entryPool: [], winner: null, roundEndsAt: Date.now() + 3600 * 1000 };
  }
}

export async function saveState(state: RaffleState): Promise<void> {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

export async function resetRaffle(durationSeconds: number = 3600) {
  const state: RaffleState = {
    entryPool: [],
    winner: null,
    roundEndsAt: Date.now() + durationSeconds * 1000,
  };
  await saveState(state);
}
