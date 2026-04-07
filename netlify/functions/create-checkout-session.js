/**
 * Netlify serverless function: Create Stripe Checkout Session
 *
 * POST /.netlify/functions/create-checkout-session
 * Body: { priceId: string, customerEmail?: string }
 * Returns: { sessionId: string }
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY — sk_live_... or sk_test_...
 *   URL              — Site URL (set automatically by Netlify)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { priceId, customerEmail } = JSON.parse(event.body || '{}')

    if (!priceId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'priceId is required' }) }
    }

    const sessionParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/cancel`,
      allow_promotion_codes: true,
    }

    if (customerEmail) {
      sessionParams.customer_email = customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
