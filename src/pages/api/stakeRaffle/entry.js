import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
// Use a different spreadsheet or sheet for stake raffle entries
const SHEET_ID = 'YOUR1UEhYgHcRUbEgTxULZqUEbBAzCBUpE99QIA6GAAzcGD0_STAKE_RAFFLE_SHEET_ID'; // TODO: Set a separate sheet ID for stake raffle
const SHEET_NAME = 'Stake'; // Use a distinct sheet/tab name
const CREDENTIALS_PATH = path.resolve(process.cwd(), 'google-credentials.json');
export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { walletId, txId, amount } = req.body;
    if (!walletId || !txId || !amount) {
        return res.status(400).json({ error: 'Missing walletId, txId, or amount' });
    }
    try {
        // Load service account credentials
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        // Prepare row: [Timestamp, Wallet ID, Tx ID, Amount]
        const row = [new Date().toISOString(), walletId, txId, amount];
        // Append the row
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:D`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });
        return res.status(200).json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
}
