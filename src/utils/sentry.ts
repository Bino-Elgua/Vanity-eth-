/**
 * Sentry error tracking with sensitive data sanitization.
 *
 * Only active in production builds. Strips private keys,
 * seed phrases, and mnemonics from all error reports.
 */

// Sensitive field names to scrub from error context
const SENSITIVE_FIELDS = new Set([
  'privateKey', 'privatekey', 'private_key',
  'seedPhrase', 'seedphrase', 'seed_phrase',
  'mnemonic', 'seed', 'secret', 'secretKey',
  'password', 'cipher', 'cipherMap',
])

// Sensitive patterns in error messages (hex private keys, 12+ word phrases)
const SENSITIVE_PATTERNS = [
  /0x[a-fA-F0-9]{64}/g,                        // Private key hex
  /\b([a-z]+ ){11,23}[a-z]+\b/g,              // Seed phrase (12-24 words)
]

function sanitizeString(str: string): string {
  let sanitized = str
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  }
  return sanitized
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// ── Sentry wrapper ──

let sentryLoaded = false

interface SentryLike {
  captureException: (error: Error, context?: any) => void
  captureMessage: (message: string, level?: string) => void
}

let sentry: SentryLike = {
  captureException: () => {},
  captureMessage: () => {},
}

export async function initSentry(): Promise<void> {
  // Only load in production
  if (import.meta.env.DEV || sentryLoaded) return
  sentryLoaded = true

  try {
    const Sentry = await import('@sentry/react')

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Sanitize exception messages
        if (event.exception?.values) {
          for (const value of event.exception.values) {
            if (value.value) {
              value.value = sanitizeString(value.value)
            }
            // Scrub local variables from stack frames
            if (value.stacktrace?.frames) {
              for (const frame of value.stacktrace.frames) {
                if (frame.vars) {
                  frame.vars = sanitizeObject(frame.vars)
                }
              }
            }
          }
        }
        // Sanitize breadcrumbs
        if (event.breadcrumbs) {
          for (const crumb of event.breadcrumbs) {
            if (crumb.message) {
              crumb.message = sanitizeString(crumb.message)
            }
            if (crumb.data) {
              crumb.data = sanitizeObject(crumb.data as Record<string, any>)
            }
          }
        }
        return event
      },
    })

    sentry = Sentry
  } catch {
    // Sentry not installed or blocked — continue without it
  }
}

export function captureError(error: Error, context?: Record<string, any>): void {
  const sanitizedContext = context ? sanitizeObject(context) : undefined
  sentry.captureException(error, sanitizedContext ? { extra: sanitizedContext } : undefined)
}

export function captureMessage(message: string, level: string = 'info'): void {
  sentry.captureMessage(sanitizeString(message), level)
}
