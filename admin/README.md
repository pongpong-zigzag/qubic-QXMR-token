# Admin Panel

This is a **completely separate standalone website** for the admin panel. It runs independently from the main application.

## Development

To run the admin panel in development mode:

```bash
npm run dev:admin
```

The admin panel will be available at `http://localhost:5173/`

**Note:** This is a completely separate website. When you run `npm run dev:admin`, it will start the admin panel on port 5173. The main application should be run separately if needed.

## Building

To build the admin panel for production:

```bash
npm run build:admin
```

The built files will be in `dist/admin/` directory.

## Production Setup

For production:

1. Build the admin panel: `npm run build:admin`
2. Deploy the `dist/admin/` directory as a separate website
3. The admin panel is completely independent and can be hosted on any domain or subdomain

## Features

- **Users Management**: View, search, sort, and edit users
- **Transactions Management**: View, search, and sort all transactions
- **Reset Balances**: Reset all user balances to 0
- **Leaderboard**: View top 100 users sorted by amount
- **Copy Wallet ID**: Quick copy functionality for wallet addresses

## Environment Variables

Make sure to set `VITE_BACKEND_URL` in your `.env` file (defaults to `http://localhost:5000`):

```
VITE_BACKEND_URL=http://localhost:5000
```

