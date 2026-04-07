import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifySession } from '../utils/stripe'
import { setTier } from '../utils/features'
import { trackEvent } from '../utils/analytics'

export default function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [tier, setTierState] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setStatus('error')
      return
    }

    verifySession(sessionId)
      .then(({ tier }) => {
        setTier(tier)
        setTierState(tier)
        setStatus('success')
        trackEvent('subscription_completed', { tier })
      })
      .catch(() => {
        setStatus('error')
      })
  }, [searchParams])

  if (status === 'verifying') {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-400">Verifying your subscription...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-white mb-2">Verification Issue</h1>
        <p className="text-gray-400 mb-6">
          We couldn't verify your payment. If you were charged, your subscription will activate shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">&#127881;</div>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome to {tier === 'enterprise' ? 'Enterprise' : 'Pro'}!</h1>
      <p className="text-gray-400 mb-8">Your subscription is now active. All features are unlocked.</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium"
        >
          Start Generating
        </button>
        {tier === 'enterprise' && (
          <button
            onClick={() => navigate('/api')}
            className="px-6 py-3 bg-gray-700 rounded-lg text-white font-medium"
          >
            API Dashboard
          </button>
        )}
      </div>
    </div>
  )
}
