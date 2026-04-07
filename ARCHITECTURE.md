# VanityCloakSeed — Architecture

## Overview

VanityCloakSeed is a dual-purpose client-side crypto tool:
1. **Vanity Address Generator** — Generate Ethereum (+ 5 other chains) vanity addresses with custom prefix/suffix patterns
2. **CloakSeed** — Hide BIP-39 seed phrases behind a personal 2048-word cipher overlay

Everything runs 100% in the browser. No server, no telemetry, no network calls except the optional Poison Radar on-chain scanner.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18, React Router 6, Tailwind CSS 3 |
| Crypto | @noble/secp256k1, @noble/ed25519, @noble/hashes, bip39, bip32, tweetnacl, ethers.js |
| Build | Vite 5, Terser, SRI hashes |
| Tests | Vitest |
| PWA | Service worker (cache-first), Web App Manifest |
| Workers | Web Workers + SharedArrayBuffer bridge |

## Directory Structure

```
src/
├── components/
│   ├── Generator.jsx      # Vanity address generation UI
│   ├── Results.jsx         # Found addresses display
│   ├── Statistics.jsx      # Real-time generation stats
│   └── ErrorBoundary.jsx   # React error boundary with crypto error detection
├── hooks/
│   └── useCloak.js         # CloakSeed React hook
├── utils/
│   ├── crypto.js           # Core ETH key generation + pattern matching
│   ├── chainCrypto.js      # Multi-chain address derivation (6 chains)
│   ├── chains.js           # Chain configs with RPC failover arrays
│   ├── ciphers.js          # CloakSeed cipher engine (AES-256-GCM)
│   ├── bip39Helper.js      # BIP-39 mnemonic generation/validation
│   ├── poisonRadar.js      # On-chain dust/poison scanner
│   ├── profiles.js         # Encrypted profile storage (AES-256-GCM + PBKDF2)
│   ├── encryption.js       # Low-level AES-256-GCM primitives
│   ├── hdWallet.js         # BIP-32/44 HD wallet derivation
│   ├── create2.js          # CREATE2 address calculation
│   ├── wordlists.js        # Theme-based wordlists for CloakSeed
│   ├── types.ts            # Shared TypeScript interfaces
│   └── __tests__/          # Vitest unit tests
│       ├── crypto.test.ts
│       ├── chainCrypto.test.ts
│       ├── ciphers.test.ts
│       ├── encryption.test.ts
│       └── bip39Helper.test.ts
├── workers/
│   ├── generatorWorker.js      # Web Worker for vanity generation
│   └── sharedWorkerBridge.js   # SharedArrayBuffer inter-worker comm
├── App.jsx                 # Router + lazy loading + error boundaries
└── main.jsx                # Entry point + service worker registration
```

## Supported Chains

| Chain | Curve | Address Format | Derivation |
|-------|-------|---------------|------------|
| Ethereum | secp256k1 | EIP-55 checksum hex | keccak256(uncompressed pubkey)[12:] |
| Bitcoin | secp256k1 | P2PKH base58check | RIPEMD160(SHA256(compressed pubkey)) |
| Solana | ed25519 | Base58 | Raw ed25519 pubkey |
| Cosmos | secp256k1 | Bech32 (cosmos1...) | RIPEMD160(SHA256(compressed pubkey)) + bech32 |
| Sui | ed25519 | 0x hex (66 chars) | blake2b(0x00 \|\| pubkey) |
| Aptos | ed25519 | 0x hex (66 chars) | sha3_256(pubkey \|\| 0x00) |

## Data Flow

### Vanity Generation Pipeline

```
User Input (prefix, suffix, chain)
  → validatePatternInputs() — hex-only, max 10 chars
  → Spawn N Web Workers
  → Each worker loop:
      generatePrivateKey() [CSPRNG]
      → getPublicKey() [secp256k1/ed25519]
      → getAddressFromPublicKey() [chain-specific hash]
      → matchesPattern() [direct string.slice(), no regex]
      → If match: postMessage(result) to main thread
  → Main thread: update stats every 1000 attempts via SharedArrayBuffer
  → Stop when maxResults reached
```

### CloakSeed Flow

```
Real Seed Phrase (12-24 BIP-39 words)
  → bip39.validateMnemonic() check
  → ciphers.encodePhrase(realPhrase, cipherMap)
  → For each word: Map lookup in 2048-word cipher
  → Output: Cloak phrase (looks like valid BIP-39 but derives different wallets)

Decloaking:
  → ciphers.decodePhrase(cloakPhrase, cipherMap)
  → Reverse map lookup
  → bip39.validateMnemonic() on output (checksum verify)
  → Original seed restored
```

### Cipher Export/Import (AES-256-GCM)

```
Export:
  password → PBKDF2(100k iterations, random salt) → AES key
  → AES-256-GCM encrypt(cipherMap JSON, random IV)
  → Output: { version: 2, salt, iv, ciphertext, tag }

Import:
  → Detect version field
  → v2: PBKDF2 derive key → AES-GCM decrypt
  → v1 (legacy): XOR migration path → re-encrypt as v2
```

## Network Layer (Poison Radar)

Poison Radar is the only component that touches the network. All safeguards:

- **RPC failover**: Each chain has 2-3 RPC endpoints, tried in order
- **Exponential backoff**: 500ms * 2^attempt + random jitter, max 2 retries per RPC
- **Rate limiting**: Sliding window, 10 requests/minute per chain
- **Timeout**: 5-second AbortController on every fetch
- **Cache**: 2-minute TTL Map-based cache
- **Validation**: Address format checked before any network call
- **CSP**: `connect-src` whitelist restricts to known RPC domains only

## Security Model

### Encryption

| Purpose | Algorithm | Key Derivation |
|---------|-----------|---------------|
| Cipher export/import | AES-256-GCM | PBKDF2 (100k iterations, SHA-256) |
| Profile storage | AES-256-GCM | PBKDF2 (100k iterations, SHA-256) |
| Session management | In-memory key | Password-derived, auto-lock 5 min |

### Input Hardening

- Hex-only pattern filter: `[^0-9a-fA-F]` stripped on input
- Max pattern length: 10 characters (prefix + suffix combined)
- No regex in pattern matching (prevents ReDoS)
- Address format validation per chain before any operation

### Content Security Policy

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
connect-src 'self' [RPC domains];
worker-src 'self' blob:;
object-src 'none';
frame-ancestors 'none';
```

### Headers

- `Cross-Origin-Opener-Policy: same-origin` — required for SharedArrayBuffer
- `Cross-Origin-Embedder-Policy: require-corp` — required for SharedArrayBuffer
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`

## Performance

### Code Splitting

Vite chunks (via `manualChunks`):
- `react-vendor` — React, ReactDOM, React Router
- `crypto-core` — @noble/hashes, @noble/secp256k1, @noble/ed25519, tweetnacl
- `crypto-bip` — bip32, bip39, bs58
- `crypto-ethers` — ethers.js (largest, loaded only when needed)
- `ui-vendor` — lucide-react, qrcode.react

Lazy-loaded via `React.lazy()`: Generator, Results, Statistics

### Worker Communication

When `SharedArrayBuffer` is available (requires COOP/COEP headers):
- 4-slot `Int32Array`: control flag, attempts, found, speed
- Atomic operations for lock-free stats aggregation
- Falls back to standard `postMessage` when unavailable

### Build Optimizations

- Terser minification with `drop_console` and `drop_debugger`
- Subresource Integrity (SRI) hashes on all script/link tags
- Service worker: cache-first for app shell, network-only for RPC calls
- PWA installable with offline support for all crypto operations
