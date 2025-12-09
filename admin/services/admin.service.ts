const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend.qxmr.quest';

export interface AdminUser {
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

export interface AdminTransaction {
  id: number;
  walletid: string;
  hash: string;
  paid: string;
  col1: string;
  col2: string;
}

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${BACKEND_URL}/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get users');
  }

  const result = await response.json();
  return result.users;
};

/**
 * Get all transactions
 */
export const getAllTransactions = async (): Promise<AdminTransaction[]> => {
  const response = await fetch(`${BACKEND_URL}/admin/transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get transactions');
  }

  const result = await response.json();
  return result.transactions;
};

/**
 * Reset all user balances to 0
 */
export const resetAllBalances = async (): Promise<{ success: boolean; message: string; affected_rows: number }> => {
  const response = await fetch(`${BACKEND_URL}/admin/reset-balances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset balances');
  }

  return response.json();
};

/**
 * Update user data
 */
export const updateUser = async (walletid: string, data: Partial<AdminUser>): Promise<AdminUser> => {
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

