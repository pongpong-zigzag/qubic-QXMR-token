# QXMR Backend API

Flask backend with SQLite databases for user management, game scores, and transactions.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Database Structure

### users.db
- `walletid` (TEXT, PRIMARY KEY)
- `amount` (TEXT) - Total game score
- `gameleft` (TEXT) - Games remaining
- `lastplayed` (TEXT) - Last played timestamp
- `paid` (TEXT) - Total paid amount
- `highest` (TEXT) - Highest score achieved
- `col1`, `col2`, `col3` (TEXT) - Additional columns

### transactions.db
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `walletid` (TEXT) - User wallet ID
- `hash` (TEXT) - Transaction hash
- `paid` (TEXT) - Paid amount
- `col1`, `col2` (TEXT) - Additional columns

## API Endpoints

### GET/POST `/get_user`
Get user info or create new user if doesn't exist.

**Request:**
```json
{
  "walletid": "USER_WALLET_ID"
}
```

**Response:**
```json
{
  "user": {
    "walletid": "...",
    "amount": "0",
    "gameleft": "0",
    "lastplayed": "",
    "paid": "0",
    "highest": "0",
    "col1": "",
    "col2": "",
    "col3": ""
  },
  "created": true
}
```

### POST `/update_user`
Update user data.

**Request:**
```json
{
  "walletid": "USER_WALLET_ID",
  "amount": "1000",
  "highest": "500",
  ...
}
```

### GET/POST `/leaderboard`
Get leaderboard with top 100 users, total users, and user ranking.

**Request (optional):**
```
GET /leaderboard?walletid=USER_WALLET_ID
```

**Response:**
```json
{
  "top_users": [...],
  "total_users": 150,
  "user_ranking": {
    "rank": 5,
    "user": {...}
  }
}
```

### POST `/transaction`
Save transaction and increment paid amount.

**Request:**
```json
{
  "walletid": "USER_WALLET_ID",
  "hash": "TRANSACTION_HASH",
  "paid": "100",
  "col1": "",
  "col2": ""
}
```

### POST `/update_game_score`
Update user's amount and highest score after game ends.

**Request:**
```json
{
  "walletid": "USER_WALLET_ID",
  "score": 500
}
```

### GET `/health`
Health check endpoint.

## Environment Variables

Set `VITE_BACKEND_URL` in your frontend `.env` file:
```
VITE_BACKEND_URL=http://localhost:5000
```

