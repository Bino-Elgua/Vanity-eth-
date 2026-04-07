/**
 * API type definitions for future server-side API.
 *
 * These types define the contract for the planned REST API.
 * Currently the app is 100% client-side; these types will be
 * used when the API server is built (Express/Hono/Cloudflare Workers).
 */

export interface APIRoutes {
  /** Generate a vanity address matching prefix/suffix pattern */
  'POST /api/v1/vanity/generate': {
    body: {
      chain: string
      prefix?: string
      suffix?: string
      caseSensitive?: boolean
      maxAttempts?: number
    }
    response: {
      address: string
      privateKey: string
      publicKey: string
      chain: string
      attempts: number
      duration: number
    }
  }

  /** Check address risk score via Poison Radar */
  'GET /api/v1/risk/:address': {
    params: { address: string }
    query: { chain: string }
    response: {
      address: string
      chain: string
      riskScore: number
      riskLevel: 'none' | 'low' | 'medium' | 'high'
      threats: string[]
      suspiciousPatterns: {
        dust: number
        zeroValue: number
        unknownContracts: number
        rapidFire: number
      }
      recommendedAction: string
    }
  }

  /** Encode a seed phrase with a cipher */
  'POST /api/v1/cloakseed/encode': {
    body: {
      seedPhrase: string
      cipherMap: Record<string, string>
    }
    response: {
      encodedPhrase: string
      wordCount: number
    }
  }

  /** Decode a cloak phrase back to real seed */
  'POST /api/v1/cloakseed/decode': {
    body: {
      cloakPhrase: string
      cipherMap: Record<string, string>
    }
    response: {
      decodedPhrase: string
      wordCount: number
      valid: boolean
    }
  }

  /** Validate an address for a given chain */
  'GET /api/v1/validate/:chain/:address': {
    params: { chain: string; address: string }
    response: {
      valid: boolean
      chain: string
      address: string
      error?: string
    }
  }
}

/** Rate limits per tier (requests per day) */
export const API_RATE_LIMITS = {
  free: 100,
  pro: 10_000,
  enterprise: 1_000_000,
} as const

/** API error response format */
export interface APIError {
  error: {
    code: string
    message: string
    status: number
  }
}
