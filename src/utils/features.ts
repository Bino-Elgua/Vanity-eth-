/**
 * Feature tier system for free/pro/enterprise gating.
 *
 * Tier is stored in localStorage. In the future this will
 * be validated against a Stripe subscription server-side.
 */

export type FeatureTier = 'free' | 'pro' | 'enterprise'

export interface FeatureConfig {
  maxWorkers: number
  maxResults: number
  chains: string[]
  batchGeneration: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

export const FEATURES: Record<FeatureTier, FeatureConfig> = {
  free: {
    maxWorkers: 4,
    maxResults: 10,
    chains: ['ethereum'],
    batchGeneration: false,
    prioritySupport: false,
    apiAccess: false,
  },
  pro: {
    maxWorkers: 16,
    maxResults: 100,
    chains: ['ethereum', 'solana', 'bitcoin', 'sui', 'cosmos', 'aptos'],
    batchGeneration: true,
    prioritySupport: true,
    apiAccess: false,
  },
  enterprise: {
    maxWorkers: 64,
    maxResults: 1000,
    chains: ['ethereum', 'solana', 'bitcoin', 'sui', 'cosmos', 'aptos'],
    batchGeneration: true,
    prioritySupport: true,
    apiAccess: true,
  },
}

const TIER_KEY = 'user-tier'

export function getCurrentTier(): FeatureTier {
  const stored = localStorage.getItem(TIER_KEY)
  if (stored === 'pro' || stored === 'enterprise') return stored
  return 'free'
}

export function setTier(tier: FeatureTier): void {
  localStorage.setItem(TIER_KEY, tier)
}

export function getFeatures(): FeatureConfig {
  return FEATURES[getCurrentTier()]
}

export function hasFeature(feature: keyof FeatureConfig): boolean {
  const value = getFeatures()[feature]
  return value === true
}

export function getLimit(limit: 'maxWorkers' | 'maxResults'): number {
  return getFeatures()[limit]
}

export function isChainAvailable(chainId: string): boolean {
  return getFeatures().chains.includes(chainId)
}

export const TIER_LABELS: Record<FeatureTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export const TIER_PRICES: Record<FeatureTier, string> = {
  free: '$0',
  pro: '$9.99/mo',
  enterprise: '$49.99/mo',
}
