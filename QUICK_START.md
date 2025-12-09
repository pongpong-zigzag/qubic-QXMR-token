# Quick Start Guide - Qubic Wallet Integration

## 🚀 Quick Setup (5 Minutes)

### 1. Get API Credentials

Visit these links to register and get your API keys:
- **Qubic Connect GitHub**: https://github.com/getamis/qubic-connect
- **Partner Registration**: https://qubic.github.io/integration/Partners/
- **Integration Docs**: https://docs.qubic.org/developers/integration/

Contact Qubic team with:
- App name: **QXMR**
- Your domain URL
- Development localhost URL

### 2. Create `.env` File

In the project root, create `.env`:

```env
VITE_QUBIC_API_KEY=your_key_here
VITE_QUBIC_API_SECRET=your_secret_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

### 4. Test on Mobile Device

1. Install Qubic Wallet app (iOS/Android)
2. Open your site on mobile browser
3. Click "Connect Wallet"
4. Approve in wallet app
5. See your address displayed!

---

## ✅ What's Already Done

- ✅ ConnectWalletButton component updated with real SDK integration
- ✅ Connect Wallet section added to homepage
- ✅ Wallet navigation link in header
- ✅ Environment variable configuration ready
- ✅ Redirect flow handling implemented
- ✅ Address persistence in localStorage

---

## 📚 Full Documentation

For complete instructions, troubleshooting, and details:
👉 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **Setup Guide** | [SETUP_GUIDE.md](./SETUP_GUIDE.md) |
| **Qubic Connect SDK** | https://github.com/getamis/qubic-connect |
| **Qubic Docs** | https://docs.qubic.org |
| **Integration Guide** | https://docs.qubic.org/developers/integration/ |
| **Qubic Wallet iOS** | https://apps.apple.com/us/app/qubic-wallet/id6502265811 |
| **Qubic Wallet Android** | https://play.google.com/store/apps/details?id=org.qubic.wallet |

---

## ⚠️ Common Issues

**"API key not found"** → Create `.env` file and restart dev server  
**"Wallet doesn't open"** → Test on mobile device with Qubic Wallet installed  
**"Connection failed"** → Verify API credentials are correct  
**"Methods not found"** → Check that API key/secret are properly set  

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting section for more help.






