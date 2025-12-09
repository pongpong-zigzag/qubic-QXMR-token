const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: ''
    };
  }

  const targetUrl = 'https://xmr-stats.qubic.org/stats';
  
  console.log('Attempting to fetch from:', targetUrl);
  
  try {
    // Add timeout to the fetch request (5 seconds)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(targetUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched data:', JSON.stringify(data).substring(0, 200) + '...');

    // PEAK HASHRATE LOGIC
    const peakFilePath = path.join('/tmp', 'peak-hashrate.json');
    let peakHashrate = null;
    let peakTimestamp = null;

    // Seed default peak if file does not exist
    if (fs.existsSync(peakFilePath)) {
      try {
        const peakData = JSON.parse(fs.readFileSync(peakFilePath, 'utf-8'));
        peakHashrate = peakData.peakHashrate;
        peakTimestamp = peakData.peakTimestamp;
      } catch (e) {
        console.warn('Could not read peak hashrate file:', e);
      }
    } else {
      // Set default peak: 632.17 MH/s at 11:20 pm
      peakHashrate = 632170000; // 632.17 MH/s
      peakTimestamp = '2025-06-13T23:20:00-04:00';
      try {
        fs.writeFileSync(peakFilePath, JSON.stringify({ peakHashrate, peakTimestamp }), 'utf-8');
      } catch (e) {
        console.warn('Could not seed peak hashrate file:', e);
      }
    }

    // Get current hashrate
    const currentHashrate = data.pool_hashrate;
    const now = new Date();

    // If current is higher than peak, update
    if (!peakHashrate || currentHashrate > peakHashrate) {
      peakHashrate = currentHashrate;
      peakTimestamp = now.toISOString();
      try {
        fs.writeFileSync(peakFilePath, JSON.stringify({ peakHashrate, peakTimestamp }), 'utf-8');
      } catch (e) {
        console.warn('Could not write peak hashrate file:', e);
      }
    }

    // Attach peak info to response and override total blocks found
    const responseData = {
      ...data,
      peak_hashrate: peakHashrate,
      peak_timestamp: peakTimestamp
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };

  } catch (error) {
    console.error('Error in proxy-xmr-stats:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch XMR stats',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }
};
