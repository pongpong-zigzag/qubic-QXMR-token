// Express server for Raffle API (Vite-compatible)
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

const DB_PATH = path.join(__dirname, 'raffles.json');

const WALLET_ID_REGEX = /^[A-Z]{60}$/;

// --- Database Helpers ---
const readRaffles = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading raffles database:', error);
    return []; // Return empty array on error
  }
};

const writeRaffles = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to raffles database:', error);
  }
};

app.use(cors());
app.use(express.json());

const getGoogleSheetsClient = () => {
  const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.resolve(process.cwd(), 'google-credentials.json');
  const credsRaw = fs.readFileSync(credsPath, 'utf8');
  const credsObj = JSON.parse(credsRaw);
  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      credentials: credsObj,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch {
    auth = new google.auth.JWT(
      credsObj.client_email,
      null,
      credsObj.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
  }
  return google.sheets({ version: 'v4', auth });
};

app.get('/api/power-players', async (req, res) => {
  try {
    const SHEET_ID = process.env.POWER_PLAYERS_SHEET_ID;
    if (!SHEET_ID) return res.status(500).json({ error: 'POWER_PLAYERS_SHEET_ID is not configured' });
    const VERIFIED_TAB = process.env.POWER_PLAYERS_VERIFIED_TAB || 'Verified';

    const sheets = getGoogleSheetsClient();
    const sheetResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VERIFIED_TAB}!A:B`,
    });

    const values = sheetResp.data.values || [];
    const items = values
      .map((row) => ({
        walletId: typeof row?.[0] === 'string' ? row[0].trim().toUpperCase() : '',
        verifiedAt: typeof row?.[1] === 'string' ? row[1] : null,
      }))
      .filter((x) => WALLET_ID_REGEX.test(x.walletId));

    return res.status(200).json(items);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

app.post('/api/power-players/submit', async (req, res) => {
  try {
    const { walletId } = req.body || {};
    const normalized = typeof walletId === 'string' ? walletId.trim().toUpperCase() : '';
    if (!WALLET_ID_REGEX.test(normalized)) {
      return res.status(400).json({ error: 'Invalid wallet ID format. Must be 60 uppercase letters.' });
    }

    const SHEET_ID = process.env.POWER_PLAYERS_SHEET_ID;
    if (!SHEET_ID) return res.status(500).json({ error: 'POWER_PLAYERS_SHEET_ID is not configured' });
    const SUBMISSIONS_TAB = process.env.POWER_PLAYERS_SUBMISSIONS_TAB || 'Submissions';

    const sheets = getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SUBMISSIONS_TAB}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), normalized]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// --- API Endpoints ---

// Get all raffles
app.get('/api/raffles', (req, res) => {
  const raffles = readRaffles();
  res.json(raffles);
});

/*
// Start a raffle
app.post('/api/raffles/:id/start', (req, res) => {
  const { id } = req.params;
  const updatedConfig = req.body;

  try {
    const raffles = readRaffles();
    const raffleIndex = raffles.findIndex(r => r.id === id);

    if (raffleIndex === -1) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    // Update the raffle with the new configuration from the admin panel
    raffles[raffleIndex] = {
      ...raffles[raffleIndex],
      ...updatedConfig,
      status: 'active', // Set status to active
    };

    writeRaffles(raffles);
    res.json(raffles[raffleIndex]);
  } catch (error) {
    console.error('Error starting raffle:', error);
    res.status(500).json({ message: 'Failed to start raffle' });
  }
});

app.post('/api/raffles/:id/enter', async (req, res) => {
  const { id } = req.params;
  const { txid } = req.body;

  if (!txid) {
    return res.status(400).json({ message: 'Transaction ID is required' });
  }

  try {
    const raffles = readRaffles();
    const raffleIndex = raffles.findIndex(r => r.id === id);

    if (raffleIndex === -1) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    const raffle = raffles[raffleIndex];

    // Check if the transaction has already been used for this raffle
    if (raffle.entries.some(entry => entry.txid === txid)) {
      return res.status(409).json({ message: 'Transaction already used for this raffle' });
    }

    const verificationResult = await verifyTransaction(txid, raffle.raffleAddress);

    if (verificationResult.valid) {
      const newEntry = {
        txid,
        amount: verificationResult.amount, // Assuming verifyTransaction returns the amount
        sender: verificationResult.sender, // Assuming verifyTransaction returns the sender
        timestamp: new Date().toISOString(),
      };

      raffle.entries.push(newEntry);
      writeRaffles(raffles);

      res.json({ message: 'Entry successful', raffle });
    } else {
      res.status(400).json({ message: 'Transaction verification failed', details: verificationResult.msg });
    }
  } catch (error) {
    console.error('Error processing entry:', error);
    res.status(500).json({ message: 'Failed to process entry' });
  }
});

// Helper: verify transaction (simplified, no state file)
async function verifyTransaction(txId, amount, raffleAddress) {
  try {
    const resp = await fetch(`https://explorer.qubic.org/network/tx/${txId}?type=latest`);
    if (!resp.ok) throw new Error('Failed to fetch explorer');
    const html = await resp.text();
    const $ = cheerio.load(html);
    // Amount
    const amountText = $('.flex').eq(4).find('.font-space').eq(1).text().replace(/,/g, '');
    const txAmount = Number(amountText);
    if (isNaN(txAmount)) return { valid: false, msg: 'Could not parse transaction amount from explorer.' };
    if (txAmount !== Number(amount)) return { valid: false, msg: `Amount in transaction (${txAmount}) does not match your entry (${amount}).` };
    // Recipient
    const recipient = $('.flex').eq(7).find('.font-space').last().text().trim();
    if (recipient !== raffleAddress) return { valid: false, msg: 'Transaction was not sent to the raffle wallet.' };
    // Date
    const dateText = $('.flex').eq(10).find('.font-space').eq(1).text().trim();
    const txDate = new Date(dateText).getTime();
    if (isNaN(txDate)) return { valid: false, msg: 'Could not parse transaction date from explorer.' };
    return { valid: true, msg: 'Transaction verified.' };
  } catch (e) {
    return { valid: false, msg: e instanceof Error ? e.message : String(e) };
  }
}

app.post('/api/raffle/entry', async (req, res) => {
  const { walletId, txId, amount } = req.body;
  const TXID_REGEX = /^[a-z]{60}$/;
  const WALLET_ID_REGEX = /^[A-Z]{60}$/;
  if (!walletId || typeof walletId !== 'string' || !WALLET_ID_REGEX.test(walletId)) {
    return res.status(400).json({ error: 'Invalid wallet ID format. Must be 60 uppercase letters.' });
  }
  if (!txId || typeof txId !== 'string' || !TXID_REGEX.test(txId)) {
    return res.status(400).json({ error: 'Invalid transaction ID format. Must be 60 lowercase letters.' });
  }
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Invalid amount specified.' });
  }

  // Append to Google Sheet with logging and retry
  const logPath = path.resolve(process.cwd(), 'raffle.log');
  function logToFile(msg) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  }
  try {
    const credsPath = '/Users/phil/qxmr-2/google-credentials.json';
    // Debug: Read and log credentials file
    let credsRaw, credsObj;
    try {
      credsRaw = fs.readFileSync(credsPath, 'utf8');
      logToFile('Read google-credentials.json: ' + credsRaw.slice(0, 100) + '...');
      credsObj = JSON.parse(credsRaw);
    } catch (fileErr) {
      logToFile('Failed to read or parse google-credentials.json: ' + (fileErr instanceof Error ? fileErr.stack : fileErr));
      return res.status(500).json({ error: 'Could not read credentials file.' });
    }
    // Log credentials object type and keys
    logToFile('credsObj type: ' + typeof credsObj + ', keys: ' + Object.keys(credsObj).join(','));
    let auth, sheets, jwtAttempted = false;
    try {
      auth = new google.auth.GoogleAuth({
        credentials: credsObj,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
    } catch (authErr) {
      logToFile('GoogleAuth failed, trying JWT. Error: ' + (authErr instanceof Error ? authErr.stack : authErr));
      jwtAttempted = true;
      try {
        auth = new google.auth.JWT(
          credsObj.client_email,
          null,
          credsObj.private_key,
          ['https://www.googleapis.com/auth/spreadsheets']
        );
        sheets = google.sheets({ version: 'v4', auth });
        logToFile('JWT auth instantiated.');
      } catch (jwtErr) {
        logToFile('JWT auth failed: ' + (jwtErr instanceof Error ? jwtErr.stack : jwtErr));
        return res.status(500).json({ error: 'Failed to authenticate with Google Sheets.' });
      }
    }
    const SHEET_ID = '1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI';
    const SHEET_NAME = 'Sheet1';
    const timestamp = new Date().toISOString();
    let appendSuccess = false;
    let lastError = null;
    // Retry logic: up to 3 attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A:D`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[timestamp, walletId, txId, amount]],
          },
        });
        appendSuccess = true;
        break;
      } catch (sheetErr) {
        lastError = sheetErr;
        logToFile(`Google Sheets append error (attempt ${attempt}): ${sheetErr instanceof Error ? sheetErr.stack : sheetErr}`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    logToFile(`Entry attempt: walletId=${walletId}, txId=${txId}, amount=${amount}, appendSuccess=${appendSuccess}`);
    if (!appendSuccess) {
      return res.status(500).json({ error: 'Failed to log entry to Google Sheets.' });
    }
    res.status(200).json({ success: true });
  } catch (e) {
    logToFile(`Unexpected error: ${e instanceof Error ? e.stack : e}`);
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// GET /api/raffle/status
app.get('/api/raffle/status', async (req, res) => {
  try {
    // Google Sheets setup
    const credsPath = '/Users/phil/qxmr-2/google-credentials.json';
    let credsRaw = fs.readFileSync(credsPath, 'utf8');
    let credsObj = JSON.parse(credsRaw);
    let auth, sheets;
    try {
      auth = new google.auth.GoogleAuth({
        credentials: credsObj,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
    } catch {
      auth = new google.auth.JWT(
        credsObj.client_email,
        null,
        credsObj.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      sheets = google.sheets({ version: 'v4', auth });
    }
    const SHEET_ID = '1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI';
    const SHEET_NAME = 'Sheet1';

    // Fetch value of D500
    const sheetResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!D500`,
    });
    let entriesReceived = 0;
    if (sheetResp.data.values && sheetResp.data.values[0] && sheetResp.data.values[0][0]) {
      const rawD500 = sheetResp.data.values[0][0];
      console.log('DEBUG: Raw D500 value from Google Sheets:', rawD500);
      entriesReceived = Number(rawD500);
      console.log('DEBUG: Parsed entriesPercent:', entriesPercent);
      if (isNaN(entriesPercent)) entriesPercent = 0;
    }

    // Countdown and winner from JSON as before
    const raffle = getRaffle(raffleId);
    const now = Date.now();
    let countdown = 0;
    let winner = null;
    if (raffle.roundEndsAt && typeof raffle.roundEndsAt === 'number' && raffle.roundEndsAt > 0) {
      countdown = Math.max(0, Math.floor((raffle.roundEndsAt - now) / 1000));
      winner = raffle.winner || null;
    }
    res.status(200).json({
      entries: entriesPercent,
      countdown,
      winner,
    });
  } catch (e) {
    logToFile(`Error loading raffle status: ${e instanceof Error ? e.stack : e}`);
    res.status(500).json({ error: 'Failed to load raffle status.' });
  }
});
*/

app.listen(PORT, () => {
  console.log(`Raffle API server running on http://localhost:${PORT}`);
});
