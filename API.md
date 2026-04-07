# VanityCloakSeed API

> **Status**: Planned. The API is not yet live. These docs describe the future REST API for programmatic access.

## Authentication

API keys are passed via header:

```
X-API-Key: your_api_key_here
```

API keys are available on the Enterprise tier. Generate one from your dashboard settings.

## Rate Limits

| Tier | Requests/Day |
|------|-------------|
| Free | 100 |
| Pro | 10,000 |
| Enterprise | 1,000,000 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1680000000
```

## Endpoints

### POST /api/v1/vanity/generate

Generate a vanity address matching a prefix/suffix pattern.

**Request:**

```json
{
  "chain": "ethereum",
  "prefix": "dead",
  "suffix": "cafe",
  "caseSensitive": false,
  "maxAttempts": 1000000
}
```

**Response:**

```json
{
  "address": "0xDeaDbEEf1234567890abcdef12345678CAfe0000",
  "privateKey": "0x...",
  "publicKey": "0x...",
  "chain": "ethereum",
  "attempts": 54231,
  "duration": 1.23
}
```

**Supported chains:** `ethereum`, `solana`, `bitcoin`, `sui`, `cosmos`, `aptos`

---

### GET /api/v1/risk/:address

Check an address for dust attacks, address poisoning, and suspicious activity.

**Request:**

```
GET /api/v1/risk/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chain=ethereum
```

**Response:**

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "chain": "ethereum",
  "riskScore": 3,
  "riskLevel": "low",
  "threats": [],
  "suspiciousPatterns": {
    "dust": 1,
    "zeroValue": 0,
    "unknownContracts": 2,
    "rapidFire": 0
  },
  "recommendedAction": "Address appears safe to use"
}
```

---

### POST /api/v1/cloakseed/encode

Encode a BIP-39 seed phrase using a cipher map.

**Request:**

```json
{
  "seedPhrase": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  "cipherMap": { "abandon": "zoo", "about": "zebra", "..." : "..." }
}
```

**Response:**

```json
{
  "encodedPhrase": "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zebra",
  "wordCount": 12
}
```

---

### POST /api/v1/cloakseed/decode

Decode a cloak phrase back to the original seed.

**Request:**

```json
{
  "cloakPhrase": "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zebra",
  "cipherMap": { "abandon": "zoo", "about": "zebra", "..." : "..." }
}
```

**Response:**

```json
{
  "decodedPhrase": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  "wordCount": 12,
  "valid": true
}
```

---

### GET /api/v1/validate/:chain/:address

Validate an address format for a given chain.

**Request:**

```
GET /api/v1/validate/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

**Response:**

```json
{
  "valid": true,
  "chain": "ethereum",
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

## Error Responses

All errors return a standard format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "status": 429
  }
}
```

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_API_KEY` | 401 | Missing or invalid API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Daily rate limit reached |
| `INVALID_CHAIN` | 400 | Unsupported chain ID |
| `INVALID_ADDRESS` | 400 | Address format invalid for chain |
| `GENERATION_TIMEOUT` | 408 | Max attempts reached without match |
| `INTERNAL_ERROR` | 500 | Server error |

## SDKs

Coming soon:
- JavaScript/TypeScript (`@vanitycloakseed/sdk`)
- Python (`vanitycloakseed`)
- CLI (`npx vanitycloakseed generate --prefix dead`)
