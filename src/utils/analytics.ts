/**
 * Privacy-respecting analytics via Plausible.
 * No cookies, no personal data, IP anonymized.
 *
 * Plausible is loaded as a lightweight JS tracker (~1KB).
 * Falls back to no-ops when unavailable or in dev mode.
 */

import type { ChainId } from './types'

// ── Event names ──

export const AnalyticsEvents = {
  GENERATION_STARTED: 'generation_started',
  GENERATION_COMPLETED: 'generation_completed',
  CLOAKSEED_CREATED: 'cloakseed_created',
  CLOAKSEED_ENCODED: 'cloakseed_encoded',
  CLOAKSEED_DECODED: 'cloakseed_decoded',
  POISON_RADAR_SCAN: 'poison_radar_scan',
  PROFILE_EXPORTED: 'profile_exported',
  PROFILE_IMPORTED: 'profile_imported',
  UPGRADE_CLICKED: 'upgrade_clicked',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ERROR_OCCURRED: 'error_occurred',
} as const

type EventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents]

// ── Plausible tracker ──

let plausible: ReturnType<typeof initPlausible> | null = null

interface PlausibleTracker {
  trackEvent: (name: string, props?: Record<string, string | number>) => void
  trackPageview: (url?: string) => void
}

function initPlausible(): PlausibleTracker {
  // In development or SSR, return no-op tracker
  if (typeof window === 'undefined' || import.meta.env.DEV) {
    return {
      trackEvent: () => {},
      trackPageview: () => {},
    }
  }

  // Use the global plausible() function injected by the <script> tag in index.html.
  // If the script is blocked by an ad-blocker, the polyfill queues calls silently.
  const p = (window as any).plausible
  if (typeof p === 'function') {
    return {
      trackEvent: (name, props) => p(name, { props }),
      trackPageview: (url) => p('pageview', url ? { u: url } : undefined),
    }
  }

  return {
    trackEvent: () => {},
    trackPageview: () => {},
  }
}

function getTracker(): PlausibleTracker {
  if (!plausible) plausible = initPlausible()
  return plausible
}

// ── Public API ──

export function trackEvent(eventName: EventName, props?: Record<string, string | number>): void {
  getTracker().trackEvent(eventName, props)
}

export function trackPageView(path?: string): void {
  getTracker().trackPageview(path || window.location.pathname)
}

// ── Typed event helpers ──

export function trackGenerationStarted(chain: ChainId, prefixLen: number, suffixLen: number, workerCount: number): void {
  trackEvent(AnalyticsEvents.GENERATION_STARTED, {
    chain,
    prefix_length: prefixLen,
    suffix_length: suffixLen,
    worker_count: workerCount,
  })
}

export function trackGenerationCompleted(chain: ChainId, durationSeconds: number, attempts: number): void {
  trackEvent(AnalyticsEvents.GENERATION_COMPLETED, {
    chain,
    duration_seconds: Math.round(durationSeconds),
    attempts,
  })
}

export function trackError(errorType: string, message: string): void {
  trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
    error_type: errorType,
    message: message.slice(0, 200),
  })
}
