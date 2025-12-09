export interface RaffleState {
    entryPool: string[];
    winner: string | null;
    roundEndsAt: number;
}
export declare function loadState(): Promise<RaffleState>;
export declare function saveState(state: RaffleState): Promise<void>;
export declare function resetRaffle(durationSeconds?: number): Promise<void>;
