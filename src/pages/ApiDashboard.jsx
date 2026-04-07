import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Copy, RefreshCw, BarChart3, Lock, ExternalLink } from 'lucide-react'
import { getCurrentTier, hasFeature } from '../utils/features'
import { openCustomerPortal } from '../utils/stripe'
import { trackEvent } from '../utils/analytics'
import { API_RATE_LIMITS } from '../api/routes'
import UpgradeModal from '../components/UpgradeModal'

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const segments = []
  for (let s = 0; s < 4; s++) {
    let seg = ''
    for (let i = 0; i < 8; i++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(seg)
  }
  return `vcs_${segments.join('_')}`
}

const API_KEY_STORAGE = 'vcs-api-key'
const API_BASE = 'https://api.vanity-cloakseed.com/v1'

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/vanity/generate',
    description: 'Generate a vanity address matching a prefix/suffix pattern',
    curl: (key) =>
      `curl -X POST ${API_BASE}/vanity/generate \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"chain":"ethereum","prefix":"dead","suffix":"","caseSensitive":false}'`,
  },
  {
    method: 'GET',
    path: '/risk/:address',
    description: 'Check address risk score via Poison Radar',
    curl: (key) =>
      `curl ${API_BASE}/risk/0x1234...abcd?chain=ethereum \\
  -H "Authorization: Bearer ${key}"`,
  },
  {
    method: 'POST',
    path: '/cloakseed/encode',
    description: 'Encode a seed phrase with a cipher map',
    curl: (key) =>
      `curl -X POST ${API_BASE}/cloakseed/encode \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"seedPhrase":"abandon ability ...","cipherMap":{"abandon":"alpha",...}}'`,
  },
  {
    method: 'POST',
    path: '/cloakseed/decode',
    description: 'Decode a cloak phrase back to the real seed',
    curl: (key) =>
      `curl -X POST ${API_BASE}/cloakseed/decode \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"cloakPhrase":"alpha ability ...","cipherMap":{"abandon":"alpha",...}}'`,
  },
  {
    method: 'GET',
    path: '/validate/:chain/:address',
    description: 'Validate an address for a given chain',
    curl: (key) =>
      `curl ${API_BASE}/validate/ethereum/0x1234...abcd \\
  -H "Authorization: Bearer ${key}"`,
  },
]

export default function ApiDashboard() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [copied, setCopied] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const tier = getCurrentTier()

  // Mock usage stats — in production these come from the API server
  const [usage] = useState({
    today: Math.floor(Math.random() * 50),
    limit: API_RATE_LIMITS[tier] || API_RATE_LIMITS.free,
    lastWeek: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
  })

  if (!hasFeature('apiAccess')) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <Lock size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">API Dashboard</h2>
          <p className="text-gray-400 mb-6">
            Programmatic access to vanity generation, CloakSeed, and Poison Radar.
            <br />Available on Enterprise.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium"
          >
            Upgrade to Enterprise
          </button>
          <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
      </div>
    )
  }

  const handleGenerateKey = () => {
    const key = generateApiKey()
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE, key)
    trackEvent('api_key_generated')
  }

  const handleCopyKey = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRegenerateKey = () => {
    if (!confirm('Regenerate your API key? The old key will stop working immediately.')) return
    handleGenerateKey()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">API Dashboard</h1>
        <button
          onClick={() => openCustomerPortal().catch(() => {})}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          Manage Billing <ExternalLink size={14} />
        </button>
      </div>

      {/* API Key Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">API Key</h2>
        </div>

        {apiKey ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-sm text-green-400 font-mono break-all border border-gray-700">
              {apiKey}
            </code>
            <button
              onClick={handleCopyKey}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white shrink-0"
              title="Copy key"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleRegenerateKey}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white shrink-0"
              title="Regenerate key"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateKey}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium"
          >
            Generate API Key
          </button>
        )}

        {copied && (
          <p className="text-xs text-green-400 mt-2">Copied to clipboard</p>
        )}

        <p className="text-xs text-gray-500 mt-3">
          Keep your API key secret. Include it in the <code className="text-gray-400">Authorization: Bearer</code> header.
        </p>
      </div>

      {/* Usage Stats */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Usage</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Today</p>
            <p className="text-2xl font-bold text-white">
              {usage.today.toLocaleString()}
              <span className="text-sm text-gray-500 font-normal"> / {usage.limit.toLocaleString()}</span>
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Rate Limit</p>
            <p className="text-2xl font-bold text-white">
              {usage.limit.toLocaleString()}
              <span className="text-sm text-gray-500 font-normal"> /day</span>
            </p>
          </div>
        </div>

        {/* Mini bar chart for last 7 days */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Last 7 days</p>
          <div className="flex items-end gap-1 h-16">
            {usage.lastWeek.map((val, i) => {
              const max = Math.max(...usage.lastWeek, 1)
              const height = (val / max) * 100
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-600/50 rounded-t"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${val} requests`}
                />
              )
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="flex-1 text-center text-[10px] text-gray-600">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Endpoints</h2>
        <div className="space-y-4">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  ep.method === 'GET' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm text-gray-300">{ep.path}</code>
              </div>
              <p className="text-xs text-gray-500 mb-3">{ep.description}</p>
              <pre className="text-xs bg-gray-900 p-3 rounded-lg overflow-x-auto text-gray-400">
                {ep.curl(apiKey || 'YOUR_API_KEY')}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-400"
        >
          Back to Generator
        </button>
      </div>
    </div>
  )
}
