export const API_RATE_LIMITS: Record<string, number> = { free: 0, pro: 1000, enterprise: 100000 }
export const API_ENDPOINTS = { GENERATE: '/api/v1/vanity/generate', RISK: '/api/v1/risk', CLOAKSEED_ENCODE: '/api/v1/cloakseed/encode', CLOAKSEED_DECODE: '/api/v1/cloakseed/decode' } as const
