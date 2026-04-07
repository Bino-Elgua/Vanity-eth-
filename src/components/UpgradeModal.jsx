import React from 'react'
import { X, Check, Zap } from 'lucide-react'
import { FEATURES, TIER_PRICES } from '../utils/features'
import { trackEvent, AnalyticsEvents } from '../utils/analytics'

const PRO_FEATURES = [
  'All 6 chains (ETH, SOL, BTC, SUI, Cosmos, Aptos)',
  'Up to 16 worker threads',
  '100 results per session',
  'Batch generation',
  'Priority support',
]

const ENTERPRISE_FEATURES = [
  'Everything in Pro',
  'Up to 64 worker threads',
  '1,000 results per session',
  'API access',
  'Dedicated support',
]

export default function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const handleUpgradeClick = (tier) => {
    trackEvent(AnalyticsEvents.UPGRADE_CLICKED, { tier })
    // Stripe integration placeholder
    alert(`Stripe checkout for ${tier} tier coming soon!`)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6 border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={24} className="text-yellow-400" />
            Upgrade Your Plan
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pro */}
          <div className="p-5 bg-gray-800 rounded-xl border border-blue-500/50 relative">
            <div className="absolute -top-3 left-4 px-3 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              POPULAR
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Pro</h3>
            <p className="text-2xl font-bold text-blue-400 mt-1">{TIER_PRICES.pro}</p>
            <ul className="mt-4 space-y-2">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgradeClick('pro')}
              className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="p-5 bg-gray-800 rounded-xl border border-gray-600">
            <h3 className="text-lg font-bold text-white">Enterprise</h3>
            <p className="text-2xl font-bold text-gray-300 mt-1">{TIER_PRICES.enterprise}</p>
            <ul className="mt-4 space-y-2">
              {ENTERPRISE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgradeClick('enterprise')}
              className="w-full mt-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 text-gray-500 text-sm">
          Maybe later
        </button>
      </div>
    </div>
  )
}
