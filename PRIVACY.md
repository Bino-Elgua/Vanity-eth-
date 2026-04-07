# Privacy Policy

## Overview

VanityCloakSeed is a 100% client-side application. All cryptographic operations (key generation, seed phrase encoding, address derivation) happen in your browser. No private keys, seed phrases, or wallet data ever leave your device.

## Analytics

We use [Plausible Analytics](https://plausible.io), a privacy-focused analytics tool:

- **No cookies** used
- **No personal data** collected
- **IP addresses** are never stored (anonymized at ingestion)
- **Data hosted** in EU (GDPR compliant)
- **Open source** and independently auditable
- Script is ~1KB and loads asynchronously

### What we track

- Page views (which pages are visited)
- Feature usage (generation started/completed, cloakseed created, etc.)
- Performance metrics (generation duration, attempt counts)
- Error rates (type and message only, no stack traces with user data)

### What we NEVER track

- Wallet addresses
- Private keys
- Seed phrases or cloak phrases
- Cipher maps
- IP addresses
- Browser fingerprints
- Personal information of any kind

## Network Requests

The only network requests made by VanityCloakSeed are:

1. **Plausible Analytics** (`plausible.io`) — anonymous usage metrics
2. **Poison Radar RPC calls** — public blockchain RPC endpoints, only when you explicitly scan an address
3. **Sentry error tracking** (`sentry.io`) — production error reports with all sensitive data stripped

All network endpoints are whitelisted in the Content Security Policy. No other domains can be contacted.

## Local Storage

VanityCloakSeed stores data in your browser's localStorage:

| Key | Contents | Encryption |
|-----|----------|-----------|
| `vanity-profiles-v2` | Saved generation profiles | AES-256-GCM |
| `vanity-batch-queue-v2` | Batch job queue | AES-256-GCM |
| `vanity-onboarding-complete` | Whether onboarding was shown | None (boolean flag) |
| `user-tier` | Feature tier (free/pro) | None |

All profile and batch data is encrypted with your password using AES-256-GCM with PBKDF2 key derivation (100,000 iterations). The encryption key is held in memory only and auto-wiped after 5 minutes of inactivity.

## Ad Blockers

If your ad blocker blocks the Plausible script, the app continues to work normally. Analytics calls silently no-op.

## Contact

Questions about privacy? Open an issue on GitHub.
