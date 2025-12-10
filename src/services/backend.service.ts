const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend.qxmr.quest';

export interface User {
  walletid: string;
  amount: string;
  gameleft: string;
  lastplayed: string;
  paid: string;
  highest: string;
  col1: string;
  col2: string;
  col3: string;
  leaderboard_access?: string;
}

export interface LeaderboardResponse {
  top_users: User[];
  total_users: number;
  user_ranking: {
    rank: number;
    user: User;
  } | null;
}

export interface TransactionRequest {
  walletid: string;
  hash: string;
  paid: number | string;
  col1?: string;
  col2?: string;
}

export interface GameScoreRequest {
  walletid: string;
  score: number;
}

/**
 * Get user info or create new user if doesn't exist
 */
export const getUser = async (walletid: string): Promise<{ user: User; created: boolean }> => {
  const response = await fetch(`${BACKEND_URL}/get_user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletid }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user');
  }

  return response.json();
};

/**
 * Update user data
 */
export const updateUser = async (walletid: string, data: Partial<User>): Promise<User> => {
  const response = await fetch(`${BACKEND_URL}/update_user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletid, ...data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }

  const result = await response.json();
  return result.user;
};

/**
 * Get leaderboard with top 100 users, total users, and user ranking
 */
export const getLeaderboard = async (walletid?: string): Promise<LeaderboardResponse> => {
  const url = walletid
    ? `${BACKEND_URL}/leaderboard?walletid=${encodeURIComponent(walletid)}`
    : `${BACKEND_URL}/leaderboard`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get leaderboard');
  }

  return response.json();
};

/**
 * Save transaction and increment paid amount
 */
export const saveTransaction = async (data: TransactionRequest): Promise<{
  success: boolean;
  transaction_saved: boolean;
  user_paid_updated: string;
  games_added?: number;
  games_remaining?: number;
  leaderboard_access_granted?: boolean;
}> => {
  const response = await fetch(`${BACKEND_URL}/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save transaction');
  }

  return response.json();
};

/**
 * Update game score (amount and highest)
 */
export const updateGameScore = async (data: GameScoreRequest): Promise<{ success: boolean; user: User }> => {
  const response = await fetch(`${BACKEND_URL}/update_game_score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  console.log(response.json());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update game score');
  }

  return response.json();
};

// Module-level guard to prevent duplicate calls across component instances
let startGameInProgress = false;
let lastStartGameCall: { walletid: string; timestamp: number } | null = null;

/**
 * Start a game - checks if user can play and decrements gameleft
 */
export const startGame = async (walletid: string): Promise<{
  success: boolean;
  can_play: boolean;
  games_remaining?: number;
  message?: string;
  user: User;
}> => {
  // Prevent duplicate calls - check if same call is in progress or was just made
  const now = Date.now();
  if (startGameInProgress) {
    console.log('startGame already in progress, skipping duplicate call');
    throw new Error('Game start already in progress');
  }
  
  // Also prevent duplicate calls within 1 second for the same wallet
  if (lastStartGameCall && 
      lastStartGameCall.walletid === walletid && 
      (now - lastStartGameCall.timestamp) < 1000) {
    console.log('startGame called too soon after previous call, skipping');
    throw new Error('Game start called too soon');
  }

  // Set flags immediately
  startGameInProgress = true;
  lastStartGameCall = { walletid, timestamp: now };

  try {
    const response = await fetch(`${BACKEND_URL}/start_game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletid }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start game');
    }

    return response.json();
  } finally {
    // Always clear the in-progress flag
    startGameInProgress = false;
  }
};

/**
 * Buy games - increment gameleft and paid amount
 */
export const buyGames = async (walletid: string, games: number = 1, paid: number = 500000): Promise<{
  success: boolean;
  games_added: number;
  total_paid: number;
  games_remaining: number;
  user: User;
}> => {
  const response = await fetch(`${BACKEND_URL}/buy_games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletid, games, paid }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to buy games');
  }

  return response.json();
};

