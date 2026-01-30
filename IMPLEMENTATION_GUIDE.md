# Vanity-ETH Pro - Complete Implementation Guide

## Quick Start (5 minutes)

```bash
# 1. Clone and enter directory
git clone https://github.com/yourusername/vanity-eth-pro
cd vanity-eth-pro

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# → http://localhost:3000 automatically opens
```

## Project Setup Details

### 1. Dependencies Installation

All dependencies are specified in `package.json`. Here's what gets installed:

**Production Dependencies:**
```json
{
  "react": "^18.2.0"              // UI framework
  "@noble/secp256k1": "^1.7.1"   // ECDSA crypto
  "@noble/hashes": "^1.3.2"      // Keccak256, SHA256
  "tailwindcss": "^3.3.0"        // CSS framework
  "lucide-react": "^0.263.1"     // Icons
  "qrcode.react": "^1.0.1"       // QR code generation
}
```

**Dev Dependencies:**
```json
{
  "vite": "^5.0.0"               // Build tool
  "@vitejs/plugin-react": "^4.2" // React plugin
  "typescript": "^5.3.3"         // Type checking
  "eslint": "^8.54.0"            // Linting
  "vitest": "^1.0.0"             // Testing
}
```

### 2. Build Process

**Development Build (Vite Dev Server):**
```bash
npm run dev
# - Hot Module Replacement (HMR) enabled
# - Source maps for debugging
# - Fast rebuild on file changes
# - Port: 3000
```

**Production Build:**
```bash
npm run build
# - Minified output
# - Code splitting (vendor + main)
# - Asset optimization
# - Source maps for error reporting
# Output: dist/ directory
```

## Core Implementation Files

### 1. Cryptographic Operations (`src/utils/crypto.js`)

**File Size:** ~400 lines
**Purpose:** Core crypto primitives

```javascript
// Key exports:

// 1. Key Generation
generatePrivateKey()              // CSPRNG → 64-char hex
  └─ Uses crypto.getRandomValues()

// 2. Key Derivation
getPublicKey(privateKey)           // Private → Public key
  └─ Uses @noble/secp256k1

// 3. Address Generation
getAddressFromPublicKey(publicKey)  // Public → Address
  └─ Uses keccak_256 hash

// 4. Full Address Generation
generateAddress(privateKey)         // Private → Full Address
  └─ Combines 1, 2, 3 + EIP-55 checksum

// 5. Pattern Matching
matchesPattern(address, prefix, suffix, caseSensitive)
  └─ Returns boolean

// 6. Checksum Validation
toChecksumAddress(address)         // Apply EIP-55 checksum
  └─ Returns checksummed address

// 7. Difficulty Calculation
calculateDifficulty(prefix, suffix)
  └─ Returns estimated attempts needed

// 8. Time Estimation
formatTimeEstimate(attempts, speed)
  └─ Returns human-readable time string
```

**Key Implementation - Address Derivation:**
```javascript
import { secp256k1 } from '@noble/secp256k1'
import { keccak_256 } from '@noble/hashes/sha3'

export function generateAddress(privateKey) {
  // Step 1: Generate public key
  const privateKeyBytes = new Uint8Array(Buffer.from(privateKey, 'hex'))
  const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, false)
  
  // Step 2: Hash public key
  const hash = keccak_256(publicKeyBytes)
  
  // Step 3: Extract last 20 bytes
  const address = '0x' + Buffer.from(hash).toString('hex').slice(-40)
  
  // Step 4: Apply EIP-55 checksum
  return toChecksumAddress(address)
}
```

### 2. CREATE2 Calculator (`src/utils/create2.js`)

**File Size:** ~300 lines
**Purpose:** Contract address prediction

```javascript
// Key exports:

// 1. CREATE2 Address Calculation
calculateCreate2Address(deployer, salt, bytecode)
  └─ Returns predicted contract address

// 2. CREATE Address Calculation (traditional)
calculateCreateAddress(deployer, nonce)
  └─ Returns address based on RLP encoding

// 3. Vanity Salt Finder
findVanitySalt(deployer, bytecode, pattern, maxAttempts)
  └─ Async function, returns { salt, address, attempts }

// 4. Sample Bytecode Generator
getSampleBytecode()
  └─ Returns simple contract bytecode for testing
```

**CREATE2 Formula Implementation:**
```javascript
export function calculateCreate2Address(deployer, salt, bytecode) {
  // 1. Get init code hash
  const initCodeHash = keccak_256(bytecodeBytes)
  
  // 2. Construct: 0xff ++ deployer ++ salt ++ initCodeHash
  const input = Buffer.concat([
    Buffer.from([0xff]),      // 1 byte marker
    deployerBytes,            // 20 bytes
    saltBytes,                // 32 bytes
    initCodeHash,             // 32 bytes
  ])
  
  // 3. Hash everything
  const address = keccak_256(input)
  
  // 4. Take last 20 bytes and checksum
  return toChecksumAddress('0x' + address.slice(-40))
}
```

### 3. Web Worker (`src/workers/generatorWorker.js`)

**File Size:** ~100 lines
**Purpose:** Background address generation

```javascript
// Main message handler
self.onmessage = async (event) => {
  const { action, payload } = event.data
  
  if (action === 'start') {
    // Start generation loop
    await startGeneration(payload)
  } else if (action === 'stop') {
    // Stop gracefully
    isRunning = false
  }
}

// Generation loop
async function startGeneration(payload) {
  const { workerId, prefix, suffix, caseSensitive, maxResults } = payload
  
  let found = 0
  let attempts = 0
  const startTime = Date.now()
  
  while (isRunning && found < maxResults) {
    // Generate address
    const privateKey = generatePrivateKey()
    const address = deriveAddress(privateKey)
    
    // Check pattern
    if (matchesPattern(address, prefix, suffix, caseSensitive)) {
      // Send result to main thread
      self.postMessage({
        type: 'result',
        payload: { workerId, address, privateKey }
      })
      found++
    }
    
    attempts++
    
    // Send stats every 1000 attempts
    if (attempts % 1000 === 0) {
      self.postMessage({
        type: 'stats',
        payload: { workerId, attempts, found, speed }
      })
      
      // Yield to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  // Final completion message
  self.postMessage({
    type: 'complete',
    payload: { workerId, attempts, found, elapsed, speed }
  })
}
```

### 4. React Components

#### Generator Component (`src/components/Generator.jsx`)

```javascript
export default function Generator({ onResult, onStatsUpdate }) {
  // State
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({...})
  
  // Handlers
  const handleStart = async () => {
    // Validate input
    // Initialize generation
    // Start loop with updates
    // Handle results
  }
  
  const handleStop = () => {
    // Cancel generation
    // Cleanup workers
  }
  
  // Render
  return (
    <div className="card">
      {/* Input fields */}
      {/* Options */}
      {/* Progress bar */}
      {/* Stats display */}
      {/* Control buttons */}
    </div>
  )
}
```

#### Results Component (`src/components/Results.jsx`)

```javascript
export default function Results({ results }) {
  const [visibleKeys, setVisibleKeys] = useState({})
  
  const toggleKeyVisibility = (index) => {
    // Toggle show/hide private key
  }
  
  const copyToClipboard = (text) => {
    // Copy with confirmation
  }
  
  const downloadKeystore = (address, privateKey) => {
    // Generate and download encrypted keystore
  }
  
  return (
    <div className="card">
      {/* Results list with actions */}
    </div>
  )
}
```

#### Create2Calculator Component (`src/components/Create2Calculator.jsx`)

```javascript
export default function Create2Calculator() {
  const [tab, setTab] = useState('create2')
  const [form, setForm] = useState({...})
  const [result, setResult] = useState(null)
  
  const handleCreate2 = () => {
    // Calculate CREATE2 address
    const address = calculateCreate2Address(...)
    setResult({ address, type: 'CREATE2' })
  }
  
  const handleCreate = () => {
    // Calculate CREATE address
    const address = calculateCreateAddress(...)
    setResult({ address, type: 'CREATE' })
  }
  
  return (
    <div className="card">
      {/* Tabs for CREATE2 and CREATE */}
      {/* Input forms */}
      {/* Results display */}
    </div>
  )
}
```

### 5. Styling (Tailwind CSS)

**Configuration:** `tailwind.config.js`
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#667eea',
          600: '#5568d3',
          // ...
        },
        // ...
      },
    },
  },
}
```

**Global Styles:** `src/index.css`
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer components {
  .card { /* Card styling */ }
  .btn { /* Button styling */ }
  .alert { /* Alert styling */ }
  .input { /* Input styling */ }
}
```

## Step-by-Step Implementation

### 1. Basic Address Generator (Day 1)

```javascript
// Minimal version
async function generateAddress(privateKey) {
  const publicKey = getPublicKey(privateKey)
  const hash = keccak256(publicKey)
  return '0x' + hash.slice(-40)
}

// Test it
const pk = generatePrivateKey()
const addr = await generateAddress(pk)
console.log(addr) // → 0xabc123...
```

### 2. Add Pattern Matching (Day 1)

```javascript
function matchesPattern(address, prefix) {
  return address.toLowerCase().includes(prefix.toLowerCase())
}

// Test
const matches = matchesPattern('0xdeadbeef...', 'dead')
console.log(matches) // → true
```

### 3. Add Generation Loop (Day 2)

```javascript
async function findVanityAddress(prefix, maxAttempts = 10000) {
  for (let i = 0; i < maxAttempts; i++) {
    const pk = generatePrivateKey()
    const addr = await generateAddress(pk)
    
    if (matchesPattern(addr, prefix)) {
      return { address: addr, privateKey: pk, attempts: i }
    }
  }
  throw new Error('Not found')
}

// Use it
const result = await findVanityAddress('dead')
console.log(result.address)
```

### 4. Add Web Workers (Day 2-3)

```javascript
// Main thread
const worker = new Worker('generatorWorker.js')

worker.postMessage({
  action: 'start',
  payload: { prefix: 'dead', maxResults: 5 }
})

worker.onmessage = (event) => {
  if (event.data.type === 'result') {
    console.log('Found:', event.data.payload.address)
  }
}
```

### 5. Add React UI (Day 3-4)

```jsx
// Minimal component
function Generator() {
  const [prefix, setPrefix] = useState('')
  const [results, setResults] = useState([])
  
  const handleGenerate = async () => {
    const result = await findVanityAddress(prefix)
    setResults([...results, result])
  }
  
  return (
    <div>
      <input
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
        placeholder="Prefix"
      />
      <button onClick={handleGenerate}>Generate</button>
      <div>
        {results.map(r => (
          <div key={r.address}>{r.address}</div>
        ))}
      </div>
    </div>
  )
}
```

### 6. Add Statistics & UI Polish (Day 4-5)

```jsx
// Add stats tracking
const [stats, setStats] = useState({
  attempts: 0,
  speed: 0,
  elapsed: 0,
})

// Update periodically
useEffect(() => {
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    const speed = attempts / elapsed
    setStats({ attempts, speed, elapsed: Math.round(elapsed) })
  }, 500)
  
  return () => clearInterval(interval)
}, [attempts, startTime])
```

### 7. Add Advanced Features (Day 5+)

- CREATE2 calculator
- Security warnings
- Settings panel
- Dark mode
- Export functionality

## Testing Checklist

### Unit Tests

```javascript
// test/crypto.test.js
describe('Crypto Utils', () => {
  test('generatePrivateKey returns 64 hex chars', () => {
    const pk = generatePrivateKey()
    expect(pk).toMatch(/^[0-9a-f]{64}$/)
  })
  
  test('getPublicKey derives correct key', () => {
    const pk = '0x1234...'
    const pubk = getPublicKey(pk)
    expect(pubk).toMatch(/^04[0-9a-f]{128}$/)
  })
  
  test('matchesPattern works correctly', () => {
    const addr = '0xdeadbeefcafe...'
    expect(matchesPattern(addr, 'dead')).toBe(true)
    expect(matchesPattern(addr, 'cafe')).toBe(true)
    expect(matchesPattern(addr, 'xxxx')).toBe(false)
  })
})
```

### Integration Tests

```javascript
// test/integration.test.js
describe('Address Generation', () => {
  test('Complete generation pipeline', async () => {
    const pk = generatePrivateKey()
    const addr = generateAddress(pk)
    
    expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(isValidAddress(addr)).toBe(true)
    expect(toChecksumAddress(addr)).toBe(addr)
  })
  
  test('Worker message handling', (done) => {
    const worker = new Worker('generatorWorker.js')
    
    worker.onmessage = (e) => {
      expect(e.data.type).toBe('result')
      expect(e.data.payload.address).toMatch(/^0x/)
      worker.terminate()
      done()
    }
    
    worker.postMessage({
      action: 'start',
      payload: { prefix: 'dead', maxResults: 1 }
    })
  })
})
```

### Manual Testing

- [ ] Generate address with no prefix/suffix
- [ ] Generate with prefix only
- [ ] Generate with suffix only
- [ ] Generate with both prefix and suffix
- [ ] Try case-sensitive matching
- [ ] Calculate CREATE2 address
- [ ] Calculate CREATE address
- [ ] Toggle dark mode
- [ ] Test on mobile device
- [ ] Test offline functionality
- [ ] Copy address to clipboard
- [ ] Download keystore file
- [ ] Verify address checksums

## Deployment Procedures

### Vercel (Recommended)

```bash
# 1. Create Vercel account
# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel

# 4. Configure
# → Select framework: Vite
# → Build command: npm run build
# → Output directory: dist
```

### GitHub Pages

```bash
# 1. Update vite.config.js
export default defineConfig({
  base: '/vanity-eth-pro/',
  // ...
})

# 2. Build
npm run build

# 3. Deploy
npm run deploy  # requires gh-pages package
```

### Docker

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build
docker build -t vanity-eth-pro .

# Run
docker run -p 3000:80 vanity-eth-pro
```

### Self-Hosted (nginx)

```bash
# 1. Build
npm run build

# 2. Copy dist/ to server
scp -r dist/* user@server:/var/www/vanity-eth-pro/

# 3. Configure nginx
# /etc/nginx/sites-available/vanity-eth-pro:
server {
  listen 80;
  server_name vanity-eth.example.com;
  
  root /var/www/vanity-eth-pro;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # Cache assets
  location ~* \.(js|css|png|gif|ico)$ {
    expires 7d;
  }
}
```

## Performance Optimization Tips

### 1. Reduce Bundle Size

```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer
# Then: npm run build -- --analyze
```

### 2. Lazy Load Components

```javascript
const Create2Calculator = lazy(() => import('./Create2Calculator'))
const SecurityWarnings = lazy(() => import('./SecurityWarnings'))

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <Create2Calculator />
</Suspense>
```

### 3. Optimize Worker Usage

```javascript
// Reuse workers instead of creating new ones
const workerPool = new Array(numWorkers)
  .fill(null)
  .map(() => new Worker('generatorWorker.js'))

// Distribute work: worker[i % numWorkers].postMessage(task)
```

### 4. Enable Service Worker

```javascript
// Register SW for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Try clean build
npm run build -- --force
```

### Runtime Errors

```javascript
// Add error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
  }
  
  render() {
    return this.props.children
  }
}
```

### Worker Issues

```javascript
// Check browser support
if (!('Worker' in window)) {
  console.warn('Web Workers not supported')
  // Fall back to main thread generation
}
```

---

**Happy building! For questions, open an issue on GitHub.**
