#!/usr/bin/env ts-node

/**
 * XMR Stats CLI
 * Simple CLI entry point to fetch and display mining stats from the same API as the web UI.
 */

import axios from 'axios';

const API_URL = 'https://xmr-stats.qubic.org/stats';

async function fetchStats() {
  try {
    const response = await axios.get(API_URL);
    const stats = response.data;
    // Load previous peak hashrate from file
    const fs = require('fs');
    const PEAK_FILE = '.peak_hashrate.json';
    const INITIAL_PEAK = 1773394189;
    let peakHashrate = Math.max(stats.pool_hashrate, INITIAL_PEAK);
    if (fs.existsSync(PEAK_FILE)) {
      try {
        const prev = JSON.parse(fs.readFileSync(PEAK_FILE, 'utf8'));
        if (typeof prev.peak === 'number' && prev.peak > peakHashrate) {
          peakHashrate = prev.peak;
        }
      } catch {}
    }
    // If new peak, update file
    if (stats.pool_hashrate > peakHashrate) {
      peakHashrate = stats.pool_hashrate;
      fs.writeFileSync(PEAK_FILE, JSON.stringify({ peak: peakHashrate }));
    }
    console.log('--- XMR Mining Stats ---');
    console.log(`Pool Hashrate:    ${stats.pool_hashrate}`);
    console.log(`Network Hashrate: ${stats.network_hashrate}`);
    console.log(`Peak Hashrate:    ${peakHashrate}`);
    console.log('------------------------');
  } catch (err) {
    console.error('Failed to fetch XMR stats:', err);
    process.exit(1);
  }
}

function formatTimestamp(ts: number): string {
  if (!ts) return 'N/A';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

fetchStats();
