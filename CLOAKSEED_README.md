# CloakSeed - Stealth Seed Phrase Generator

**The ultimate client-side app to hide your cryptocurrency seed phrase in plain sight.**

Turn your real BIP-39 seed phrase into a personal cipher. Write down only meaningless-looking words. Anyone finding it sees gibberish. Only you can recover your wallet.

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

### Production Build

```bash
npm run build
npm run preview
```

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

## 🏗️ Architecture

### Frontend Stack
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
│   │   │   ├── PanicPhrase.jsx        # Fake wallet generator
│   │   │   ├── ThemeSelector.jsx      # Choose/upload themes
│   │   │   ├── Stripe.jsx             # Payment paywall
│   │   │   └── Export.jsx             # Export encrypted cipher
│   │   └── ...
│   ├── hooks/
│   │   ├── useAddressGenerator.js     # Vanity-ETH hook
│   │   └── useCloakSeed.js            # CloakSeed state management
│   ├── utils/
│   │   ├── crypto.js                  # Vanity-ETH crypto
│   │   ├── ciphers.js                 # Cipher encoding/decoding
│   │   ├── wordlists.js               # 5 preloaded themes
│   │   ├── bip39Helper.js             # BIP-39 wrapper
│   │   └── encryption.js              # Export encryption
│   ├── workers/
│   │   ├── generatorWorker.js         # Vanity-ETH worker
│   │   └── cipherWorker.js            # Heavy cipher ops
│   ├── App.jsx                        # Main router
│   ├── index.css                      # Tailwind styles
│   └── main.jsx                       # React entry
├── public/
│   ├── manifest.json                  # PWA manifest
│   └── service-worker.js              # Service worker
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── CLOAKSEED_README.md                # This file
├── CLOAKSEED_INTEGRATION.md           # Integration plan
└── README.md                          # Vanity-ETH docs
```

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

## 💰 Freemium Model

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

## 🛠️ Development

### Adding Custom Wordlist
```javascript
import { generateCipherFromTheme } from '@/utils/ciphers';
import { THEMES } from '@/utils/wordlists';

const customWords = ['word1', 'word2', ...]; // 2048 words
const cipher = generateCipherFromTheme(customWords);
```

### Generating a Cloak
```javascript
import { encodePhrase } from '@/utils/ciphers';
import * as bip39 from 'bip39';

const entropy = crypto.getRandomValues(new Uint8Array(16));
const seed = bip39.entropyToMnemonic(entropy);
const cloak = encodePhrase(seed, cipherWords);
```

### Restoring a Wallet
```javascript
import { decodePhrase } from '@/utils/ciphers';
import { Wallet } from 'ethers';

const realSeed = decodePhrase(cloakPhrase, cipherWords);
const wallet = Wallet.fromMnemonic(realSeed);
console.log('ETH Address:', wallet.address);
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, connects to GitHub
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify drop zone
# Or: ntl deploy
```

### Self-Hosted (Docker)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

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
  setCipherFromTheme,  // (words, customizations) → Set cipher
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

## 📄 License

MIT License. See LICENSE file for details.

---

**Built with ❤️ for the crypto community**

For security vulnerabilities, please email: security@cloakseed.dev (contact details in repo)
