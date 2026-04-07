# Contributing to VanityCloakSeed

## Getting Started

```bash
git clone https://github.com/Bino-Elgua/Vanity-eth-.git
cd Vanity-eth-
npm install
npm run dev      # dev server at localhost:5173
npm run test     # run Vitest suite
npm run build    # production build with SRI
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details. Key directories:

- `src/utils/` — All crypto and business logic (pure functions, no React)
- `src/components/` — React UI components
- `src/workers/` — Web Worker code
- `src/utils/__tests__/` — Vitest unit tests

## Code Guidelines

### Crypto Code Review Requirements

Any PR that touches files in `src/utils/` involving cryptographic operations **must**:

1. **Include test vectors** — Use known test vectors from specs (e.g., Hardhat account #0 for ETH, BIP-39 test vectors for mnemonics)
2. **No custom crypto** — Use audited libraries (`@noble/*`, Web Crypto API). Never implement your own cipher, hash, or PRNG.
3. **No regex in hot paths** — Pattern matching uses `string.slice()` only. No `RegExp` in generation loops (ReDoS risk).
4. **Validate inputs at boundaries** — Every function that takes user input must validate before processing.
5. **Wipe sensitive data** — Use `secureWipe()` for any `Uint8Array` holding keys or seeds after use.

### General Rules

- TypeScript types live in `src/utils/types.ts`. Add new interfaces there, not inline.
- Each `.js` util file has a corresponding `.ts` file with full type annotations. Keep both in sync.
- No `console.log` in production code (Terser strips it, but don't rely on that).
- Error boundaries wrap every page-level component. Don't catch crypto errors silently.

## Testing

```bash
npm run test              # run all tests
npx vitest run crypto     # run specific test file
```

Tests use Vitest. Test files live in `src/utils/__tests__/`. Every crypto utility needs:

- Known test vector (from the relevant spec or a reference implementation)
- Roundtrip test (encode → decode → same input)
- Edge cases (empty input, max length, invalid chars)
- Wrong-password / invalid-key rejection tests for encryption

## Pull Request Process

1. Fork and create a feature branch
2. Write tests for any new crypto code
3. Run `npm run test` — all tests must pass
4. Run `npm run build` — must build without errors
5. Open PR with description of what changed and why
6. Crypto PRs require review from a maintainer

## Security

See [SECURITY.md](./SECURITY.md) for the threat model and crypto details. If you find a vulnerability, see the reporting section there.
