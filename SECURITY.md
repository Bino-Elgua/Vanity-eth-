# Security Model

## Threat Model

VanityCloakSeed handles private keys and seed phrases — the highest-sensitivity crypto material. The security model assumes:

- **Trusted**: The user's browser and device
- **Untrusted**: The network, any server, browser extensions, other origins

### What we protect against

| Threat | Mitigation |
|--------|-----------|
| Key exfiltration via network | Zero network calls from crypto code. CSP `connect-src` whitelist. Only Poison Radar touches the network. |
| XSS / script injection | CSP `script-src 'self'`; no `eval()` or inline scripts; SRI hashes on all bundles |
| Clickjacking | `frame-ancestors 'none'`; `X-Frame-Options: DENY` |
| Weak encryption | AES-256-GCM with PBKDF2 (100k iterations); no XOR, no custom crypto |
| Brute-force on stored data | PBKDF2 key stretching; 16-byte random salt per encryption |
| Memory exposure | `secureWipe()` zeroes typed arrays after use; auto-lock after 5 min idle |
| ReDoS | No regex in pattern matching; direct `string.slice()` comparison only |
| RPC abuse | Rate limiting (10/min/chain); 5s timeout; exponential backoff |
| Supply chain | Minimal dependency surface; `@noble/*` libs are audited, zero-dependency |

### What we do NOT protect against

- Compromised browser or OS (keyloggers, malicious extensions)
- Physical access to an unlocked device
- Side-channel attacks on JavaScript crypto (timing attacks on BigInt operations)
- Quantum computing attacks on secp256k1/ed25519

## Cryptographic Primitives

| Operation | Algorithm | Library | Notes |
|-----------|-----------|---------|-------|
| ETH key generation | secp256k1 | @noble/secp256k1 | Audited, zero-dep |
| SOL/SUI/APT key generation | ed25519 | @noble/ed25519 | Audited, zero-dep |
| ETH address | keccak-256 | @noble/hashes | |
| BTC address | SHA-256 + RIPEMD-160 | @noble/hashes | P2PKH, base58check |
| Cosmos address | SHA-256 + RIPEMD-160 + bech32 | @noble/hashes | Custom bech32 encoder |
| SUI address | BLAKE2b | @noble/hashes | With ed25519 scheme flag |
| APT address | SHA3-256 | @noble/hashes | With scheme suffix byte |
| Cipher encryption | AES-256-GCM | Web Crypto API | Browser-native |
| Key derivation | PBKDF2-SHA256 | Web Crypto API | 100,000 iterations |
| Random generation | CSPRNG | `crypto.getRandomValues()` | OS entropy pool |

## Encryption Details

### Cipher Export (v2 format)

```
Input: cipher map (JSON) + user password
  1. salt = crypto.getRandomValues(16 bytes)
  2. iv = crypto.getRandomValues(12 bytes)
  3. key = PBKDF2(password, salt, 100000, SHA-256) → 256-bit AES key
  4. ciphertext = AES-256-GCM.encrypt(key, iv, JSON.stringify(cipherMap))
  5. Output: { version: 2, salt: base64, iv: base64, data: base64 }
```

### Profile Storage

```
Session model:
  1. User enters password → PBKDF2 derives key → stored in memory only
  2. All profile reads/writes use this in-memory key
  3. After 5 minutes idle → key is wiped from memory (auto-lock)
  4. Storage key: "vanity-profiles-v2" in localStorage (encrypted blob)
```

### Legacy Migration (v1 → v2)

The original cipher export used XOR "encryption" with no key derivation. The `importCipherV1()` function detects the old format (no `version` field), decrypts via XOR, and the caller should re-encrypt with v2 AES-256-GCM.

## Input Validation

| Input | Validation |
|-------|-----------|
| Vanity prefix/suffix | Hex-only regex filter on keystroke; max 10 chars combined |
| BIP-39 mnemonic | `bip39.validateMnemonic()` — checksum verification |
| Cipher words | Every word checked against BIP-39 2048-word list |
| Chain addresses | Per-chain format validators (regex, base58check, bech32 decode) |
| RPC responses | JSON parse + error field check; no `eval()` |

## Content Security Policy

The CSP in `index.html` restricts:

- `script-src 'self' 'wasm-unsafe-eval'` — only same-origin scripts; WASM allowed for future crypto acceleration
- `connect-src` — whitelist of known RPC endpoints only
- `worker-src 'self' blob:` — Web Workers from same origin or blob URLs (Vite worker bundling)
- `object-src 'none'` — no plugins/embeds
- `frame-ancestors 'none'` — cannot be embedded in iframes

## Reporting Vulnerabilities

If you discover a security vulnerability, please open a GitHub issue or contact the maintainers directly. Do not include exploit details in public issues — provide a summary and we will coordinate disclosure.
