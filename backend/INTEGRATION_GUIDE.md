# Backend Integration Guide

## Overview

The backend has been successfully created and integrated with the frontend. Here's what was implemented:

## Backend Structure

### Files Created:
- `backend/app.py` - Main Flask application with all endpoints
- `backend/requirements.txt` - Python dependencies
- `backend/README.md` - Backend documentation

### Databases:
- `users.db` - Stores user game data (walletid, amount, gameleft, lastplayed, paid, highest, col1, col2, col3)
- `transactions.db` - Stores transaction records (walletid, hash, paid, col1, col2)

## Frontend Integration

### Files Created/Modified:
- `src/services/backend.service.ts` - Backend API service
- `src/contexts/UserContext.tsx` - User state management context
- `src/components/GameWrapper.tsx` - Game component with backend integration
- `src/components/LeaderboardModal.tsx` - Leaderboard popup component
- `src/components/GameSection.tsx` - Updated to use GameWrapper
- `src/components/TransactionButton.tsx` - Updated to save transactions
- `src/App.tsx` - Added UserProvider

## How It Works

### 1. Wallet Connection
When a user connects their wallet:
- `UserContext` automatically calls `/get_user` endpoint
- If user doesn't exist, a new user is created with default values
- User data is stored in context and available throughout the app

### 2. Game Play
When a user plays the game:
- Game score is tracked in real-time
- When game ends, `/update_game_score` is called automatically
- User's `amount` is incremented by the score
- User's `highest` is updated if score is greater than current highest
- `lastplayed` timestamp is updated

### 3. Leaderboard
- Click "Leaderboard" button on game page
- Shows top 100 users sorted by amount
- Displays total users count
- Shows user's current ranking (if wallet is connected)
- Beautiful UI matching the site design

### 4. Transactions
When a transaction is successful:
- Transaction details are saved to `transactions.db`
- User's `paid` amount is incremented in `users.db`
- Transaction hash, walletid, and paid amount are stored

## Running the Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Frontend Configuration

Add to your `.env` file (create if it doesn't exist):
```
VITE_BACKEND_URL=http://localhost:5000
```

For production, update this to your backend URL.

## API Endpoints

### GET/POST `/get_user`
- Gets user info or creates new user
- Called automatically when wallet connects

### POST `/update_user`
- Updates any user field
- Used internally by other endpoints

### GET/POST `/leaderboard`
- Returns top 100 users, total users, and user ranking
- Called when leaderboard modal opens

### POST `/transaction`
- Saves transaction and increments paid amount
- Called after successful transaction broadcast

### POST `/update_game_score`
- Updates amount and highest score
- Called automatically when game ends

### GET `/health`
- Health check endpoint

## Testing

1. Start the backend server
2. Start the frontend dev server
3. Connect a wallet
4. Play the game
5. Check leaderboard
6. Make a transaction

All data is persisted in SQLite databases in the `backend` directory.

## Notes

- All columns are stored as TEXT format as requested
- The `paid` amount increments cumulatively (e.g., 100 + 20 = 120)
- Game scores are added to the total `amount`
- Leaderboard shows top 100 users sorted by amount
- User ranking is calculated dynamically

