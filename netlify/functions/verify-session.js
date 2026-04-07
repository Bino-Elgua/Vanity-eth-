/**
 * Netlify serverless function: Verify Stripe Checkout Session
 *
 * GET /.netlify/functions/verify-session?session_id=cs_xxx
 * Returns: { tier: string, email: string }
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const PRICE_TO_TIER = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID]: 'pro',
  [process.env.STRIPE_ENTERPRISE_PRICE_ID]: 'enterprise',
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const sessionId = event.queryStringParameters?.session_id
    if (!sessionId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'session_id required' }) }
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items.data.price'],
    })

    if (session.payment_status !== 'paid') {
      return { statusCode: 402, body: JSON.stringify({ error: 'Payment not completed' }) }
    }

    const priceId = session.subscription?.items?.data?.[0]?.price?.id
    const tier = PRICE_TO_TIER[priceId] || 'pro'

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        email: session.customer_email || session.customer_details?.email,
        subscriptionId: session.subscription?.id,
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
