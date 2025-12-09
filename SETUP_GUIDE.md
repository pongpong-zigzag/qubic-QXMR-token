# Complete Qubic Wallet Integration Setup Guide

This guide will walk you through everything you need to get Qubic Wallet connection working on your QXMR site.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Register for Qubic Connect API Access](#step-1-register-for-qubic-connect-api-access)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Step 4: Update Code Implementation](#step-4-update-code-implementation)
6. [Step 5: Test Your Integration](#step-5-test-your-integration)
7. [Troubleshooting](#troubleshooting)
8. [Resources & Links](#resources--links)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 16 or higher installed
- ✅ npm or yarn package manager
- ✅ A Qubic Wallet app installed on your mobile device
  - [iOS App Store](https://apps.apple.com/us/app/qubic-wallet/id6502265811)
  - [Google Play Store](https://play.google.com/store/apps/details?id=org.qubic.wallet)
- ✅ Access to your domain/hosting where the site will be deployed

---

## Step 1: Register for Qubic Connect API Access

### 1.1 Access Qubic Connect Repository

Visit the official Qubic Connect repository to understand the integration process:
- **GitHub Repository**: https://github.com/getamis/qubic-connect
- Review the README and documentation for API registration details

### 1.2 Register Your Application

You need to register your application domain to get API credentials:

1. **Contact Qubic Support or Developer Team**:
   - Visit: https://docs.qubic.org/developers/integration/
   - Check for partner registration form or contact information
   - Alternative: Visit https://qubic.github.io/integration/Partners/

2. **Information You'll Need to Provide**:
   - Your application name (QXMR)
   - Your domain/URL (e.g., `https://yourdomain.com`)
   - Localhost for development (if applicable)
   - Description of your application
   - Contact information

3. **What You'll Receive**:
   - `API Key` (also called `key`)
   - `API Secret` (also called `secret`)
   - Instructions for redirect URLs configuration

### 1.3 Configure Redirect URLs

When registering, you may need to specify:
- **Development**: `http://localhost:5173` (or your dev port)
- **Production**: `https://yourdomain.com`
- **Callback URL**: Usually automatic, but confirm with Qubic team

---

## Step 2: Install Dependencies

The required packages are already in your `package.json`, but verify installation:

```bash
# Install/update dependencies
npm install

# Verify Qubic Connect SDK is installed
npm list @qubic-connect/core
```

**Expected output**: Should show `@qubic-connect/core@^1.2.5` or similar

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

In the **root directory** of your project (same level as `package.json`), create a `.env` file:

```bash
# Windows PowerShell
New-Item .env

# Windows CMD
type nul > .env

# Mac/Linux
touch .env
```

### 3.2 Add Environment Variables

Open the `.env` file and add your credentials:

```env
# Qubic Connect API Credentials
# Replace with your actual API key and secret from Qubic
VITE_QUBIC_API_KEY=your_actual_api_key_here
VITE_QUBIC_API_SECRET=your_actual_api_secret_here

# Optional: If you need RPC access
VITE_QUBIC_RPC_URL=https://rpc.qubic.org
```

**⚠️ Important Notes:**
- The `VITE_` prefix is required for Vite to expose these variables to your frontend code
- Never commit `.env` to Git (should already be in `.gitignore`)
- Keep your API secret secure and never share it publicly

### 3.3 Verify `.env` File

Your `.env` file should look like this (with real values):

```env
VITE_QUBIC_API_KEY=abc123def456ghi789
VITE_QUBIC_API_SECRET=xyz789uvw456rst123
```

---

## Step 4: Update Code Implementation

The code has already been updated to use the Qubic Connect SDK, but let's verify everything is correct.

### 4.1 Check `src/lib/qubic.ts`

This file should contain:

```typescript
import QubicConnect from '@qubic-connect/core';

export const qubic = new QubicConnect({
  name: 'QXMR',
  key: process.env.VITE_QUBIC_API_KEY || 'YOUR_API_KEY_HERE',
  secret: process.env.VITE_QUBIC_API_SECRET || 'YOUR_API_SECRET_HERE',
  autoLoginInWalletIabType: 'qubic-only',
});
```

### 4.2 Verify `src/components/ConnectWalletButton.tsx`

The ConnectWalletButton should now:
- Import the `qubic` instance from `../lib/qubic`
- Use real SDK methods instead of demo code
- Handle redirect-based connection flow
- Store connected address in localStorage

### 4.3 Restart Development Server

After creating/updating `.env`, **restart your dev server**:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

Vite needs to restart to load new environment variables.

---

## Step 5: Test Your Integration

### 5.1 Local Development Testing

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test on Mobile Device**:
   - Make sure your phone is on the same Wi-Fi network
   - Find your computer's IP address (e.g., `192.168.1.100`)
   - Access: `http://192.168.1.100:5173` on your phone's browser
   - Or use a tool like `ngrok` for public testing

3. **Test the Connection**:
   - Click "Connect Wallet" button
   - Should redirect to Qubic Wallet app (if installed)
   - Approve the connection
   - Should return with your wallet address displayed

### 5.2 Production Deployment

When deploying to production (Netlify, Vercel, etc.):

1. **Set Environment Variables in Hosting Platform**:
   
   **Netlify**:
   - Go to Site settings → Environment variables
   - Add `VITE_QUBIC_API_KEY` and `VITE_QUBIC_API_SECRET`
   
   **Vercel**:
   - Go to Project settings → Environment variables
   - Add variables for Production/Preview/Development

2. **Redeploy**:
   - Redeploy your site after adding environment variables
   - Environment variables are only loaded at build time

3. **Update Redirect URLs**:
   - Make sure your production URL is registered with Qubic Connect
   - Update callback URLs if necessary

---

## Troubleshooting

### Issue: "API key not found" or "Invalid credentials"

**Solutions:**
- ✅ Verify `.env` file exists in root directory
- ✅ Check that variable names start with `VITE_`
- ✅ Restart dev server after creating `.env`
- ✅ Verify actual API key/secret are correct (no extra spaces)
- ✅ For production: Verify env vars are set in hosting platform

### Issue: Redirect doesn't work / Wallet app doesn't open

**Solutions:**
- ✅ Ensure Qubic Wallet app is installed on device
- ✅ Test on actual mobile device (not desktop browser)
- ✅ Check that your domain is registered with Qubic Connect
- ✅ Verify redirect URLs match what you registered

### Issue: Address not showing after connection

**Solutions:**
- ✅ Check browser console for errors
- ✅ Verify the SDK callback is working
- ✅ Check localStorage in DevTools (should contain `qubic_address`)
- ✅ Ensure redirect URL parameters are being parsed correctly

### Issue: "Connection failed" or "SDK error"

**Solutions:**
- ✅ Verify `@qubic-connect/core` package is installed: `npm list @qubic-connect/core`
- ✅ Check that API key/secret are valid
- ✅ Ensure your domain is whitelisted with Qubic
- ✅ Review browser console for detailed error messages
- ✅ Check network tab for failed API requests

### Issue: Environment variables not loading

**Solutions:**
- ✅ Variable names must start with `VITE_` in Vite projects
- ✅ Restart dev server (`npm run dev`)
- ✅ Clear Vite cache: `rm -rf node_modules/.vite`
- ✅ Verify `.env` file is in project root (not in `src/` folder)

---

## Resources & Links

### Official Documentation

- **Qubic Connect GitHub**: https://github.com/getamis/qubic-connect
- **Qubic Documentation**: https://docs.qubic.org
- **Qubic Integration Guide**: https://docs.qubic.org/developers/integration/
- **Qubic Developer Intro**: https://docs.qubic.org/developers/intro/
- **Partner Integration**: https://qubic.github.io/integration/Partners/

### NPM Packages

- **@qubic-connect/core**: https://www.npmjs.com/package/@qubic-connect/core
- **@qubic-lib/qubic-ts-library**: https://www.npmjs.com/package/@qubic-lib/qubic-ts-library

### Wallet Apps

- **Qubic Wallet iOS**: https://apps.apple.com/us/app/qubic-wallet/id6502265811
- **Qubic Wallet Android**: https://play.google.com/store/apps/details?id=org.qubic.wallet
- **Qubic Wallet GitHub**: https://github.com/qubic/wallet-app

### Testing Tools

- **ngrok** (for local testing): https://ngrok.com/
- **LocalTunnel**: https://localtunnel.github.io/www/

### Community & Support

- **Qubic Community**: Check Discord/Telegram links on https://qubic.org
- **GitHub Issues**: Report issues at https://github.com/getamis/qubic-connect/issues

---

## Quick Reference: Environment Variables

```env
# Required for Qubic Connect
VITE_QUBIC_API_KEY=your_api_key_here
VITE_QUBIC_API_SECRET=your_api_secret_here

# Optional RPC URL (if needed)
VITE_QUBIC_RPC_URL=https://rpc.qubic.org
```

---

## Next Steps After Setup

Once your wallet connection is working:

1. ✅ Test connecting and disconnecting
2. ✅ Verify address persistence across page refreshes
3. ✅ Test on both iOS and Android devices
4. ✅ Deploy to production with environment variables
5. ✅ Monitor for any connection issues

---

## Need Help?

If you encounter issues not covered here:

1. Check the [Qubic Connect GitHub Issues](https://github.com/getamis/qubic-connect/issues)
2. Review the [Qubic Documentation](https://docs.qubic.org)
3. Contact Qubic support through their official channels
4. Check browser console for detailed error messages

---

**Last Updated**: Based on @qubic-connect/core v1.2.5
**Project**: QXMR - Qubic XMR Token

