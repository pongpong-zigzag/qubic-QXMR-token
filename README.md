# QXMR - Qubic XMR Token

A commemorative token celebrating Qubic's breakthrough in Epoch 161.

## Features

- **Pacman Game**: Interactive game experience with classic Pacman gameplay
- **Wallet Connect**: Connect your Qubic wallet to interact with the token
- **Responsive Design**: Modern, mobile-friendly interface
- **Qubic Integration**: Built with Qubic Connect SDK for seamless wallet interactions

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Qubic Wallet installed on your mobile device ([iOS](https://apps.apple.com/us/app/qubic-wallet/id6502265811) | Android)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Qxmr-2-main
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory:

**Windows (PowerShell)**:
```bash
New-Item .env
```

**Mac/Linux**:
```bash
touch .env
```

Register your domain at [Qubic Connect](https://github.com/getamis/qubic-connect) to get your API credentials, then update the `.env` file:

```env
VITE_QUBIC_API_KEY=your_api_key_here
VITE_QUBIC_API_SECRET=your_api_secret_here
```

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Build for production:
```bash
npm run build
```

## Qubic Wallet Connect Setup

### Getting API Credentials

1. **Visit the Qubic Connect Repository**: https://github.com/getamis/qubic-connect
2. **Review Documentation**: Check the README and documentation for registration process
3. **Contact Qubic Team**: Reach out through:
   - [Qubic Integration Docs](https://docs.qubic.org/developers/integration/)
   - [Partner Integration Page](https://qubic.github.io/integration/Partners/)
4. **Provide Your Details**:
   - Application name: QXMR
   - Your domain/URL
   - Localhost URL for development
5. **Receive Credentials**: You'll get an API key and secret

**👉 Complete step-by-step guide: [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### How It Works

When users click "Connect Wallet":
1. The app redirects to the Qubic Wallet app (via deep link)
2. User approves the connection in their wallet
3. The wallet returns the user's address
4. The address is displayed in the header

### Wallet Compatibility

- ✅ **Qubic Wallet**: Full support (iOS & Android)
- ⚠️ **MetaMask with Qubic Snap**: Supported but requires Snap setup
- ❌ **Trust Wallet**: Not supported
- ❌ **Standard MetaMask**: Not supported (Qubic is non-EVM)

## Project Structure

```
src/
├── components/
│   ├── ConnectWalletButton.tsx  # Wallet connection button
│   ├── Header.tsx                # Header with wallet button
│   ├── GameSection.tsx           # Pacman game section
│   └── PacmanGameIframe.tsx      # Game iframe overlay
├── lib/
│   └── qubic.ts                  # Qubic Connect configuration
└── pages/
    └── index.tsx                 # Home page
```

## Technologies Used

- **React** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@qubic-connect/core** - Qubic wallet integration
- **@qubic-lib/qubic-ts-library** - Qubic blockchain library

## Future Enhancements

- [ ] On-chain transactions
- [ ] Token balance display
- [ ] Transaction history
- [ ] Smart contract interactions

## Resources

### Documentation & Setup
- **[Complete Setup Guide](./SETUP_GUIDE.md)** - Step-by-step integration instructions
- [Qubic Connect SDK](https://github.com/getamis/qubic-connect) - Official SDK repository
- [Qubic Integration Docs](https://docs.qubic.org/developers/integration/) - Developer integration guide
- [Qubic Documentation](https://docs.qubic.org) - Main Qubic documentation

### Wallet & Apps
- [Qubic Wallet iOS](https://apps.apple.com/us/app/qubic-wallet/id6502265811)
- [Qubic Wallet Android](https://play.google.com/store/apps/details?id=org.qubic.wallet)
- [Qubic Wallet GitHub](https://github.com/qubic/wallet-app)

### Integration
- [Partner Integration](https://qubic.github.io/integration/Partners/) - Partner registration and info

## License

See LICENSE file for details.
