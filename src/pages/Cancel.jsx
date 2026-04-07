import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Cancel() {
  const navigate = useNavigate()

  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">&#x2190;</div>
      <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
      <p className="text-gray-400 mb-8">No worries — you can upgrade anytime.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium"
      >
        Back to Generator
      </button>
    </div>
  )
}
