import QubicConnect from '@qubic-connect/core';

// Read env via Vite. `process.env` is not available in the browser.
const key = (import.meta as any)?.env?.VITE_QUBIC_API_KEY;
const secret = (import.meta as any)?.env?.VITE_QUBIC_API_SECRET;

const hasCredentials = Boolean(
  key && secret && key !== 'YOUR_API_KEY_HERE' && secret !== 'YOUR_API_SECRET_HERE'
);

// Demo fallback when no credentials are configured
const demoQubic = {
  async login() {
    alert('Demo mode: No Qubic API keys configured. Returning a mock wallet address.');
    return 'DEMO_WALLET_ADDRESS_1234567890';
  },
  async connect() {
    return this.login();
  },
  async openWallet() {
    return this.login();
  },
  async open() {
    return this.login();
  },
  logout() {
    // no-op in demo
  },
};

export const qubic: any = hasCredentials
  ? new QubicConnect({
      name: 'QXMR',
      key,
      secret,
      autoLoginInWalletIabType: 'qubic-only',
    })
  : (demoQubic as any);

