# CloakSeed - Stealth Seed Phrase Generator

**The ultimate client-side app to hide your cryptocurrency seed phrase in plain sight.**

Turn your real BIP-39 seed phrase into a personal cipher. Write down only meaningless-looking words. Anyone finding it sees gibberish. Only you can recover your wallet.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node: 18+](https://img.shields.io/badge/Node-18+-green.svg)
![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)

## 🎯 Core Concept

**Problem:** If someone finds your written seed phrase, they steal your wallet instantly.

**Solution:** Create a 2048-word personal cipher overlay on top of the standard BIP-39 word list.

```
Real BIP-39 seed:    "abandon able zone arrow..."
Your cipher overlay: "fluff spark moon rabbit..."

You write down:      "fluff spark moon rabbit..."  ← Looks like random words!
But it secretly maps: "abandon able zone arrow..." → Your real ETH/BTC/SOL wallets
```

Only you know the cipher. Only you can decode. Completely secure, 100% client-side.

---

## ✨ Features

### Core Functionality
- ✅ **5 Preloaded Themes**: Animals, Colors, Food, Fantasy, Nonsense
- ✅ **Custom Cipher Creation**: Import or create your own 2048-word wordlist
- ✅ **Generate Cloak Phrases**: BIP-39 → Personal cipher overlay
- ✅ **Restore Wallets**: Cloak phrase → Real seed → Any standard wallet (MetaMask, Phantom, Ledger, etc.)
- ✅ **Panic Phrase Generator**: Fake cloak → worthless wallet (for coerced fund transfers)
- ✅ **Multi-Chain Support**: Ethereum, Bitcoin, Solana addresses derived from single seed

### Security & Privacy
- ✅ **100% Client-Side**: No backend, no API, no telemetry
- ✅ **Cryptographic Entropy**: Uses `crypto.getRandomValues()` for true randomness
- ✅ **Zero Telemetry**: No tracking, no analytics, no logs
- ✅ **Offline Capable**: Works completely offline after load
- ✅ **Private Key Zeroization**: Memory cleared after 30 seconds
- ✅ **Encrypted Export**: Download cipher as password-protected JSON

### UI/UX
- ✅ **Dark/Light Mode**: Beautiful modern interface
- ✅ **QR Code Generation**: Visual wallet backup
- ✅ **Copy with Auto-Zeroize**: Clipboard cleared after 30s
- ✅ **Responsive Design**: Mobile, tablet, desktop
- ✅ **Progressive Web App (PWA)**: Installable, offline-first

### Monetization Ready
- ✅ **Freemium Structure**:
  - **Free**: 1 cipher, basic themes, 5 generations/month
  - **Pro** ($9.99/month): Unlimited ciphers, custom themes, panic phrases, export, offline PWA
- ✅ **Stripe Integration Skeleton**: Ready for payment processing
- ✅ **License Management**: Backend hooks (optional server)

---

## 🚀 Quick Start

### Installation

```bash
cd vanity-eth-pro-custom
npm install
```

### Development

```bash
npm run dev
# Opens http://localhost:5173
```

Press `o` to open in browser. The app auto-reloads on file changes.

### Production Build

```bash
npm run build
npm run preview
```

Builds optimized static files to `dist/`. Ready for Vercel, Netlify, GitHub Pages.

---

## 📋 Usage Guide

### 1. Choose a Theme

Navigate to **"Create Cipher"** and select one:
- **Animals** 🦁: lion, zebra, dolphin, penguin, etc.
- **Colors** 🎨: crimson, azure, emerald, gold, etc.
- **Food** 🍕: pizza, taco, sushi, cake, etc.
- **Fantasy** ⚔️: dragon, wizard, sword, castle, etc.
- **Nonsense** 🎪: blorb, flurp, snizzle, glork, etc.

Or upload custom 2048 words (one per line).

### 2. Generate Your Cloak

Click **"Generate Cloak Phrase"**:
- App generates random entropy
- Converts to standard BIP-39 phrase
- Encodes with your cipher
- Shows both versions (real + cloak)

### 3. Write It Down

**Save your cloak phrase:**
- Notebook (looks like random poem)
- Password manager
- Encrypted text file
- Laminated card
- Safe deposit box

### 4. Restore Anytime

1. Paste cloak phrase → Click "Restore Wallet"
2. See real seed phrase (hidden by default)
3. See Ethereum, Bitcoin, Solana addresses
4. Import into MetaMask, Phantom, Ledger, etc.

### 5. Security Best Practices

- 🔒 **Generate on airgapped computer** (internet disconnected)
- 🔒 **Use offline mode**: Disconnect after page loads
- 🔒 **Never screenshot** your cloak or seed
- 🔒 **Never paste online** (no pastebin, Discord, etc.)
- 🔒 **Store securely**: Safe, vault, hardware wallet, safe deposit box
- 🔒 **Multiple copies**: Write down in separate locations
- 🔒 **Encrypted backup**: Download backup JSON (needs password to open)

---

## 🏗️ Architecture

### Tech Stack
- **React 18**: UI components
- **Vite 5**: Lightning-fast build tool
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety (optional)
- **Lucide Icons**: Beautiful SVG icons

### Cryptography
- **BIP-39**: Standard English wordlist (2048 words)
- **BIP-32/BIP-44**: Hierarchical wallet derivation
- **@noble/secp256k1**: ECDSA signing (Ethereum)
- **bitcoinjs-lib**: Bitcoin address generation
- **tweetnacl**: Solana keypair generation
- **@noble/hashes**: SHA-256, Keccak-256

### Storage
- **LocalStorage**: Cipher persistence (encrypted)
- **IndexedDB** (optional): Backup history
- **Browser SessionStorage**: Temporary wallets (cleared on close)

### Security Features
- **CSPRNG**: Entropy from `crypto.getRandomValues()`
- **Memory Zeroization**: Sensitive data cleared from memory
- **No Telemetry**: Zero tracking, zero logs
- **Offline First**: Works without internet
- **Encrypted Export**: Password-protected cipher backups

---

## 📦 Project Structure

```
vanity-eth-pro-custom/
├── src/
│   ├── components/
│   │   ├── Generator.jsx              # Vanity-ETH (existing)
│   │   ├── CloakSeed/
│   │   │   ├── Landing.jsx            # Hero page
│   │   │   ├── CloakGenerator.jsx     # Generate cloak phrase
│   │   │   ├── CloakRestore.jsx       # Decode cloak → seed
│   │   │   ├── CloakDisplay.jsx       # Show cloak + seed + QR
│   │   │   ├── PanicPhrase.jsx        # Fake wallet generator
│   │   │   ├── ThemeSelector.jsx      # Choose/upload themes
│   │   │   └── Export.jsx             # Export encrypted cipher
│   │   └── ...
│   ├── hooks/
│   │   ├── useAddressGenerator.js     # Vanity-ETH hook
│   │   └── useCloakSeed.js            # CloakSeed state management
│   ├── utils/
│   │   ├── crypto.js                  # Vanity-ETH crypto
│   │   ├── ciphers.js                 # Cipher encoding/decoding
│   │   ├── wordlists.js               # 5 preloaded themes
│   │   ├── bip39Helper.js             # BIP-39 wrapper + wallet derivation
│   │   └── encryption.js              # Export encryption
│   ├── workers/
│   │   ├── generatorWorker.js         # Vanity-ETH worker
│   │   └── cipherWorker.js            # Heavy cipher ops
│   ├── App.jsx                        # Main router
│   ├── index.css                      # Tailwind + custom styles
│   └── main.jsx                       # React entry
├── public/
│   ├── manifest.json                  # PWA manifest
│   └── service-worker.js              # Service worker
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── README.md                          # This file
├── CLOAKSEED_README.md                # Detailed feature docs
└── CLOAKSEED_INTEGRATION.md           # Integration checklist
```

---

## 🔐 Security Architecture

### Data Flow
```
Entropy (browser crypto.getRandomValues)
    ↓
BIP-39 Phrase (standard wordlist)
    ↓
User's Cipher Overlay (2048 custom words)
    ↓
Cloak Phrase (encoded, looks random)
    ↓
Written down (appears meaningless)
    ↓
Recovery: Cloak → Decode → Real Seed → Import Wallet
```

### No Server Dependency
- ✅ No backend API calls
- ✅ No database
- ✅ No telemetry
- ✅ No third-party JavaScript (except libraries)
- ✅ Can run entirely offline
- ✅ Can be deployed as static files (Vercel, Netlify, GitHub Pages)

### Threat Model
| Threat | Protection |
|--------|-----------|
| Server compromise | ✅ No server |
| MITM attacks | ✅ HTTPS + static files |
| ISP snooping | ✅ Works offline |
| Device malware | ⚠️ Use airgapped device |
| Physical theft of notes | ✅ Looks like random words |
| Shoulder surfing | ✅ Real seed hidden by default |
| Key logging | ⚠️ Use hardware wallet |

---

## 💰 Monetization Model

### Free Tier
- 1 custom cipher (or use preloaded themes)
- 5 phrase generations per month
- Basic themes (animals, colors, food)
- No export/backup
- Limited to one device

### Pro Tier ($9.99/month)
- Unlimited ciphers
- Unlimited phrase generations
- All themes + custom wordlists
- Password-protected export
- Panic phrase generator
- PWA offline support
- Cross-device sync (optional backend)
- Priority support

### Payment Integration
- **Stripe Checkout**: One-time or subscription
- **Client-side verification**: Temporary token-based access
- **LocalStorage tracking**: Pro status persisted (note: not cryptographically secure)
- **Server webhook** (optional): Validate subscription server-side

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, connects to GitHub
```

Auto-deploys on push. Free tier includes unlimited bandwidth & edge caching.

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify drop zone
# Or: ntl deploy
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

### Self-Hosted (Docker)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables
Create `.env.local`:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_BASE_URL=https://api.cloakseed.com
```

---

## 📚 API Reference

### useCloakSeed Hook

```javascript
const {
  cipher,              // Currently loaded cipher
  selectedTheme,       // Selected word theme
  entropy,             // Random entropy (hex)
  realSeed,            // Real BIP-39 phrase
  cloakPhrase,         // Encoded cloak phrase
  wallets,             // { ethereum, bitcoin, solana }
  error,               // Error message
  isPremium,           // User subscription status
  loading,             // API loading state
  
  generateNewCloak,    // () → Generate cloak
  restoreFromCloak,    // (cloakPhrase) → Decode
  createPanicPhrase,   // () → Fake wallet
  setCipherFromTheme,  // (theme) → Set cipher
  exportCipher,        // (password) → Encrypted JSON
  importCipher,        // (json, password) → Load
  zeroize              // () → Clear memory
} = useCloakSeed();
```

### Cipher Functions

```javascript
// Generate cipher from theme
const cipher = generateCipherFromTheme(themeWords, { old: 'new' });

// Encode real seed with cipher
const cloak = encodePhrase('abandon able zone...', cipherWords);

// Decode cloak back to real seed
const seed = decodePhrase('fluff spark moon...', cipherWords);

// Validate cipher
const { isValid, error } = validateCipher(cipherWords);

// Hash cipher for fingerprinting
const fingerprint = hashCipher(cipherWords);

// Generate panic phrase
const { cloakPhrase, seedPhrase } = generatePanicPhrase(cipherWords);

// Validate cloak phrase
const { isValid, confidence } = validateCloak(userInput, cipherWords);

// Export/import encrypted
const encrypted = await exportCipherEncrypted(cipher, password);
const decrypted = await importCipherEncrypted(encrypted, password);
```

### Wallet Functions

```javascript
// Generate random seed
const { entropy, seedPhrase } = generateRandomSeed(12);

// Validate BIP-39 phrase
const isValid = validateSeedPhrase(seedPhrase);

// Derive Ethereum wallet
const { address, publicKey } = deriveEthereumWallet(seedPhrase);

// Derive Bitcoin wallet
const { address } = deriveBitcoinWallet(seedPhrase);

// Derive Solana wallet
const { address } = deriveSolanaWallet(seedPhrase);

// Get all addresses
const { ethereum, bitcoin, solana } = getAllAddresses(seedPhrase);
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Generate cloak with each theme
- [ ] Restore cloak → see correct seed
- [ ] Generate panic phrase → fake wallet
- [ ] Export cipher (encrypted)
- [ ] Import cipher from backup
- [ ] Copy buttons zeroize after 30s
- [ ] QR codes scan correctly
- [ ] Dark/light mode toggle works
- [ ] Offline mode (disconnect internet)
- [ ] Mobile responsive
- [ ] PWA install works
- [ ] No console errors

### Unit Tests (with Vitest)
```bash
npm run test
```

```javascript
// Example: ciphers.test.js
import { describe, it, expect } from 'vitest';
import { encodePhrase, decodePhrase } from '@/utils/ciphers';

describe('CloakSeed Ciphers', () => {
  it('should encode and decode phrases correctly', () => {
    const cipher = ['alpha', 'beta', 'gamma']; // 2048 words
    const seed = 'abandon able zone'; // BIP-39 words
    
    const encoded = encodePhrase(seed, cipher);
    const decoded = decodePhrase(encoded, cipher);
    
    expect(decoded).toBe(seed);
  });
});
```

---

## 📄 License

**MIT License**. See [LICENSE](./LICENSE) file for details.

Free for personal and commercial use. See LICENSE for full terms.

---

## 🔒 Security Disclosure

For security vulnerabilities, please email: **security@cloakseed.dev**

Do **not** open public issues for security bugs. We take security seriously and will:
1. Acknowledge receipt within 24 hours
2. Investigate and assess severity
3. Develop and test a fix
4. Release patch and credit reporter (optional)

---

## 💡 Contributing

Contributions welcome. Please:
1. Fork the repo
2. Create a feature branch
3. Test thoroughly
4. Submit PR with description

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📞 Support

- **Documentation**: See [CLOAKSEED_README.md](./CLOAKSEED_README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cloakseed/issues)
- **Email**: support@cloakseed.dev
- **Twitter**: [@cloakseed](https://twitter.com/cloakseed)

---

## 🎉 Roadmap

### v1.0 (Current)
- ✅ Core cipher generation + restoration
- ✅ Multi-chain support (ETH, BTC, SOL)
- ✅ 5 preloaded themes
- ✅ Panic phrase generator
- ✅ Encrypted export
- ✅ PWA support

### v1.1 (Soon)
- [ ] Stripe payment integration
- [ ] Advanced analytics (client-side only)
- [ ] Browser extension version
- [ ] Hardware wallet integration (Ledger, Trezor)

### v2.0 (Future)
- [ ] Hardware security key support
- [ ] Multi-sig support
- [ ] Mobile native apps (React Native)
- [ ] Advanced backup/recovery flows
- [ ] Custom branding for organizations

---

**Built with ❤️ for the crypto community**

---

## 📝 Changelog

### v1.0.0 (2025-01-XX)
- Initial release
- Core CloakSeed functionality
- 5 preloaded themes
- Multi-chain support
- Panic phrase generator
- Encrypted export
- PWA support
- Freemium model

---

*Last updated: 2025-01-XX*
