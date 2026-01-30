# CloakSeed Integration Plan

## Project Structure

```
src/
├── components/
│   ├── Generator.jsx (vanity - existing)
│   ├── CloakSeed/
│   │   ├── Landing.jsx          # Hero page
│   │   ├── CipherGenerator.jsx   # Create custom 2048-word cipher
│   │   ├── CloakGenerator.jsx    # Generate cloak phrase
│   │   ├── CloakDisplay.jsx      # Show cloak + real seed + QR codes
│   │   ├── CloakRestore.jsx      # Paste cloak → show real seed
│   │   ├── PanicPhrase.jsx       # Fake wallet generator
│   │   ├── ThemeSelector.jsx     # 5 preloaded themes
│   │   ├── Export.jsx            # Encrypted JSON export
│   │   └── Stripe.jsx            # Freemium paywall
│   └── ... (existing)
├── hooks/
│   ├── useAddressGenerator.js (existing)
│   └── useCloakSeed.js           # State management for CloakSeed
├── utils/
│   ├── crypto.js (existing)
│   ├── ciphers.js                # Cipher generation & encoding
│   ├── wordlists.js              # 5 preloaded themes
│   ├── bip39Helper.js            # BIP-39 wrapper
│   └── encryption.js             # Export encryption
├── workers/
│   ├── generatorWorker.js (existing)
│   └── cipherWorker.js           # Heavy cipher operations
├── App.jsx (main router)
├── index.css
└── main.jsx
```

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Add Stripe skeleton (payment hooks)
- [ ] Create useCloakSeed hook for state management
- [ ] Implement encryption utilities

### Phase 2: Cipher Engine
- [ ] 5 preloaded word themes (animals, colors, food, fantasy, nonsense)
- [ ] Cipher generation (2048 words)
- [ ] BIP-39 ↔ Cipher mapping

### Phase 3: UI Components
- [ ] Landing page with hero
- [ ] Cipher generator flow
- [ ] Cloak generator & display
- [ ] Restore/decode flow
- [ ] Panic phrase generator

### Phase 4: Freemium & Export
- [ ] Stripe paywall integration
- [ ] Encrypted JSON export
- [ ] PWA support

### Phase 5: Polish & Deploy
- [ ] Dark/light mode
- [ ] Mobile responsive
- [ ] Performance optimization
- [ ] README & deployment guide

## Security Checklist
- [ ] 100% client-side (no backend)
- [ ] crypto.getRandomValues() for entropy
- [ ] Zero telemetry
- [ ] Memory zeroization after copy
- [ ] Offline support
- [ ] No screenshots warning
