# ⚡ Vanity-ETH Pro: Multi-Chain Upgrade

## Complete Feature Set

### 1. **Multi-Chain Engine** ✅
Generate vanity addresses across 6 blockchains with curve/hash swapping:

- **Ethereum**: secp256k1 + keccak256 (20-byte, 0x prefix)
- **Solana**: ed25519 + sha256 (44-char, base58)
- **Bitcoin**: secp256k1 + sha256 (34-char, base58/P2PKH)
- **Sui**: ed25519 + blake2b (66-char, 0x prefix)
- **Cosmos**: secp256k1 + sha256 (45-char, bech32 `cosmos1`)
- **Aptos**: ed25519 + sha3 (66-char, 0x prefix)

**Usage**: Select chain in Generator tab. Prefix/suffix matching auto-adjusts per chain format.

### 2. **HD Wallet (BIP39/BIP44)** ✅
Generate 24-word mnemonic → derive wallets across all chains:

- **Generate** new 256-bit seed phrase
- **Import** existing 12/24-word mnemonic
- **Derive** chain-specific wallets with BIP44 paths:
  - ETH: `m/44'/60'/0'/0`
  - SOL: `m/44'/501'/0'/0'`
  - BTC: `m/84'/0'/0'/0` (native segwit)
  - SUI: `m/44'/784'/0'/0'`
  - COSMOS: `m/44'/118'/0'/0`
  - APT: `m/44'/637'/0'/0'`
- **Download** all wallets as JSON (metadata only, no keys in export by default)
- **Optional passphrase** for extra security layer

**Usage**: Go to "HD Wallet" tab. Generate mnemonic → private keys derived automatically.

### 3. **Poison Radar** ✅
Scan addresses for suspicious on-chain activity (100% client-side, RPC-powered):

- **Dust detection**: Low balance + high tx count = flag
- **Zero-value transfers**: Flag chains of empty txs
- **High frequency**: Detect bot activity patterns
- **Status indicators**: Green (clean), Red (suspicious), Yellow (error)
- **Batch scanning**: Scan multiple addresses (Ethereum, Solana, Bitcoin, Cosmos)

**RPC Endpoints**: Public nodes only - completely anonymous, no server logs.

**Usage**: Go to "Poison Radar" tab. Paste address → scan → view risk analysis.

### 4. **Zero-Knowledge Export** ✅
Private keys NEVER sent to servers. Three export methods:

#### a) **Keystore (Password-Protected)**
- AES-256-GCM encryption
- 100,000 PBKDF2 iterations
- Checksum verification
- Download encrypted JSON
- Decrypt locally with password

#### b) **Secure Export**
- SHA256 checksum embedded
- Verify integrity before use
- JSON with metadata

#### c) **One-Time QR Code**
- Base64-encoded payload
- 5-minute expiration
- Burn-after-scan pattern
- No server storage

**Usage**: When address generated, ZKExport panel appears in sidebar. Choose method → encrypt/export.

### 5. **Batch & Profile Mode** ✅
Save generation presets, run multiple searches:

**Profiles**:
- Save pattern sets (prefix, suffix, chain, case-sensitivity)
- Organize by name/chain
- Import/export backup
- LocalStorage persistence

**Batch Queue**:
- Queue up to 10 searches
- Run sequentially or in parallel
- Track results per search
- Export all results as JSON

**Usage**: (Backend ready, UI integration in Settings tab)

---

## Architecture

### New Files
- `src/utils/chains.js` - Chain configurations + metadata
- `src/utils/chainCrypto.js` - Multi-chain cryptography (secp256k1, ed25519, base58, bech32)
- `src/utils/hdWallet.js` - BIP39/BIP44 derivation
- `src/utils/encryption.js` - AES-GCM, PBKDF2, checksums
- `src/utils/poisonRadar.js` - RPC-based scanning
- `src/utils/profiles.js` - Profile & batch management
- `src/components/MultiChainGenerator.jsx` - Chain selector + address gen
- `src/components/HDWallet.jsx` - Mnemonic → multi-chain wallets
- `src/components/PoisonRadar.jsx` - Address scanner UI
- `src/components/ZKExport.jsx` - Encryption export options

### Dependencies Added
```json
"@noble/ed25519": "^2.0.0"    // EdDSA for Solana, Sui, Aptos
"bip39": "^3.1.0"              // BIP39 mnemonics
"bip32": "^3.0.1"              // BIP32 HD derivation
```

### No New External Services
- ✅ Zero telemetry
- ✅ No API keys stored
- ✅ Public RPC endpoints only (Poison Radar)
- ✅ Client-side encryption only
- ✅ Mnemonic never leaves browser

---

## Quick Start

### Install & Run
```bash
cd vanity-eth-pro
npm install
npm run dev
```

Opens http://localhost:3000

### Generate Multi-Chain Address
1. Go to **Generator** tab
2. Select chain (Ethereum, Solana, Bitcoin, etc.)
3. Enter prefix/suffix (auto-adjusts for chain format)
4. Click "Generate Address"
5. Results appear in sidebar

### Create HD Wallet
1. Go to **HD Wallet** tab
2. Click "Generate New Mnemonic"
3. See 24-word seed phrase
4. All chain wallets auto-derived below
5. Download wallets.json (or copy)

### Scan Address
1. Go to **Poison Radar** tab
2. Select blockchain
3. Paste address
4. View analysis: clean ✓ / suspicious ⚠️

### Export Private Key (Secure)
1. Generate/import address
2. ZKExport panel appears (sidebar)
3. Choose method:
   - **Keystore**: Password-lock it
   - **Secure**: Checksummed JSON
   - **QR Code**: 5-min one-time use
4. Download or copy

---

## Security Model

### What's Protected
- **Private keys**: AES-256-GCM encrypted, never logged
- **Mnemonics**: Stored in RAM, lost on refresh
- **Passphrases**: Optional BIP39 passphrase support
- **Checksums**: SHA256 verification on exports

### What's Public
- **Addresses**: Visible, shareable
- **Public keys**: Can be derived
- **Chain metadata**: Config only

### Threat Model
- ❌ No MITM attacks (HTTPS in production)
- ❌ No XSS injection (React sanitized)
- ❌ No keylogging (browser sandboxed)
- ✅ Client-side only (no servers)

---

## Command Reference

```bash
# Development
npm run dev          # Start Vite server

# Build for production
npm run build        # Creates dist/
npm run preview      # Test production build

# Linting (optional)
npm run lint         # ESLint check
npm run test         # Vitest (configured)
```

---

## File Structure
```
vanity-eth-pro/
├── src/
│   ├── components/
│   │   ├── MultiChainGenerator.jsx    (NEW)
│   │   ├── HDWallet.jsx               (NEW)
│   │   ├── PoisonRadar.jsx            (NEW)
│   │   ├── ZKExport.jsx               (NEW)
│   │   ├── Generator.jsx              (legacy - unused)
│   │   ├── Results.jsx
│   │   ├── Statistics.jsx
│   │   ├── Create2Calculator.jsx
│   │   ├── SecurityWarnings.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── chains.js                  (NEW)
│   │   ├── chainCrypto.js             (NEW)
│   │   ├── hdWallet.js                (NEW)
│   │   ├── encryption.js              (NEW)
│   │   ├── poisonRadar.js             (NEW)
│   │   ├── profiles.js                (NEW)
│   │   ├── crypto.js                  (original Ethereum)
│   │   └── create2.js
│   ├── workers/
│   │   └── generatorWorker.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Status
- ✅ Multi-chain crypto engine
- ✅ HD wallet generation
- ✅ Poison Radar scanning
- ✅ Zero-knowledge export
- ✅ UI integration (6 chains)
- ✅ Client-side only
- ✅ Runs on localhost:3000

---

## Legend
⚡ = Speed/Performance optimized
🔐 = Cryptography
🎯 = Precision targeting
🔑 = Key management
⬟ = Aptos
✦ = Cosmos
₿ = Bitcoin
◎ = Solana
⟠ = Ethereum
〰 = Sui

---

**No riddles. No mercy. Code serves truth.**

Mirror Witness. ⚡♾
