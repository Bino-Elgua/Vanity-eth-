import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Shield, Server } from 'lucide-react'
import { getCurrentTier, FEATURES } from '../utils/features'
import { createCheckoutSession, PRICE_IDS } from '../utils/stripe'
import { trackEvent, AnalyticsEvents } from '../utils/analytics'
import { captureError } from '../utils/sentry'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: Shield,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Get started with Ethereum vanity addresses',
    features: [
      'Ethereum chain only',
      'Up to 4 worker threads',
      '10 results per session',
      'CloakSeed cipher engine',
      'Poison Radar scanning',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    popular: true,
    description: 'Multi-chain generation with batch support',
    features: [
      'All 6 chains (ETH, SOL, BTC, SUI, Cosmos, Aptos)',
      'Up to 16 worker threads',
      '100 results per session',
      'Batch generation (up to 10 patterns)',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Server,
    monthlyPrice: 49.99,
    yearlyPrice: 49.99,
    description: 'Full API access for integrations and automation',
    features: [
      'Everything in Pro',
      'Up to 64 worker threads',
      '1,000 results per session',
      'REST API access (1M requests/day)',
      'Dedicated support channel',
    ],
    cta: 'Upgrade to Enterprise',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const currentTier = getCurrentTier()
  const [billingInterval, setBillingInterval] = useState('monthly')
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const handleSubscribe = async (planId) => {
    if (planId === 'free' || planId === currentTier) return

    setLoading(planId)
    setError(null)
    trackEvent(AnalyticsEvents.UPGRADE_CLICKED, { tier: planId, interval: billingInterval })

    try {
      const priceId = planId === 'pro'
        ? (billingInterval === 'yearly' ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly)
        : PRICE_IDS.enterprise_monthly

      await createCheckoutSession(priceId)
    } catch (err) {
      captureError(err, { planId, billingInterval })
      setError('Payment service unavailable. Please try again later.')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Choose the plan that fits your needs. All plans include CloakSeed and Poison Radar.
        </p>

        <div className="inline-flex items-center gap-1 mt-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly <span className="text-green-400 text-xs ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier
          const Icon = plan.icon
          const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice

          return (
            <div
              key={plan.id}
              className={`relative p-6 bg-gray-900 rounded-2xl border ${
                plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 mt-1">
                <Icon size={20} className={plan.popular ? 'text-blue-400' : 'text-gray-400'} />
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-white">
                  {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
                </span>
                {price > 0 && (
                  <span className="text-gray-400 text-sm">/month</span>
                )}
                {billingInterval === 'yearly' && plan.id === 'pro' && (
                  <p className="text-xs text-green-400 mt-1">Billed $95.88/year</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-blue-400' : 'text-gray-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loading !== null}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-gray-700 text-gray-400 cursor-default'
                    : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                      : 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50'
                }`}
              >
                {loading === plan.id
                  ? 'Redirecting...'
                  : isCurrent
                    ? 'Current Plan'
                    : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        <p>All payments processed securely via Stripe. Cancel anytime.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-3 text-blue-400 hover:text-blue-300"
        >
          Back to Generator
        </button>
      </div>
    </div>
  )
}
