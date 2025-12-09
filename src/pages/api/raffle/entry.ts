import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SHEET_ID = '1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI';
const SHEET_NAME = 'Sheet1';
const CREDENTIALS_PATH = path.resolve(process.cwd(), 'google-credentials.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

        spreadsheetId: '1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI',
        range: 'Sheet1!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, walletId, txId, amount]],
        },
      });
    } catch (sheetErr) {
      console.error('Google Sheets append error:', sheetErr);
      // Do not fail the entry if sheet logging fails
    }
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Raffle entry error:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
