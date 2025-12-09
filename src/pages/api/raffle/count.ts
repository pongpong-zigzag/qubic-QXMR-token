import type { NextApiRequest, NextApiResponse } from 'next';

// Google Sheet published as CSV (get the CSV export URL from the sheet)
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI/export?format=csv&gid=0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch sheet' });
    }
    const csv = await response.text();
    const rows = csv.split('\n').filter(row => row.trim() !== '');
    // Subtract 1 for the header row
    const count = Math.max(0, rows.length - 1);
    res.status(200).json({ entries: count });
  } catch (e) {
    res.status(500).json({ error: (e instanceof Error ? e.message : String(e)) });
  }
}
