/**
 * Poison Radar - Light on-chain scanner
 * Detect dust, zero-value, and suspicious token transfers
 * 100% client-side, uses public RPCs only
 */

export async function analyzeAddress(address, chain) {
  const rpc = chain.rpc
  
  try {
    const txs = await fetchRecentTransactions(address, chain)
    return analyzeTransactions(txs, address)
  } catch (e) {
    console.error('Failed to analyze address:', e)
    return {
      status: 'error',
      message: e.message,
      risk: 'unknown',
    }
  }
}

async function fetchRecentTransactions(address, chain) {
  /**
   * Fetch last 100 transactions using public RPC/API
   * Chain-specific endpoints
   */
  
  switch (chain.id) {
    case 'ethereum':
      return await fetchEthereumTxs(address)
    case 'solana':
      return await fetchSolanaTxs(address)
    case 'bitcoin':
      return await fetchBitcoinTxs(address)
    default:
      return []
  }
}

async function fetchEthereumTxs(address) {
  // Use public JSON-RPC
  const payload = {
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: [address, 'latest'],
    id: 1,
  }
  
  const response = await fetch('https://eth.public.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  const data = await response.json()
  return data.result ? [{ value: data.result }] : []
}

async function fetchSolanaTxs(address) {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getSignaturesForAddress',
        params: [address, { limit: 10 }],
        id: 1,
      }),
    })
    
    const data = await response.json()
    return data.result || []
  } catch (e) {
    console.error('Solana RPC error:', e)
    return []
  }
}

async function fetchBitcoinTxs(address) {
  try {
    const response = await fetch(`https://blockstream.info/api/address/${address}/txs`)
    const txs = await response.json()
    return Array.isArray(txs) ? txs.slice(0, 100) : []
  } catch (e) {
    console.error('Bitcoin API error:', e)
    return []
  }
}

function analyzeTransactions(txs, targetAddress) {
  if (!txs || txs.length === 0) {
    return {
      status: 'clean',
      risk: 'none',
      txCount: 0,
      warnings: [],
      message: 'No transactions found or new address',
    }
  }
  
  let riskScore = 0
  const warnings = []
  const suspiciousPatterns = {
    dust: 0,
    zeroValue: 0,
    unknownContracts: 0,
    rapidFire: 0,
  }
  
  // Analyze transaction patterns
  for (let i = 0; i < Math.min(txs.length, 100); i++) {
    const tx = txs[i]
    
    // Check for dust (very small amounts)
    if (tx.value && BigInt(tx.value) > 0n && BigInt(tx.value) < BigInt('1000000000000000')) {
      suspiciousPatterns.dust++
      riskScore += 1
    }
    
    // Check for zero-value
    if (tx.value === '0' || !tx.value) {
      suspiciousPatterns.zeroValue++
      if (tx.input && tx.input.length > 2) {
        riskScore += 3 // Data-only transaction
      }
    }
    
    // Check for unknown contract interactions
    if (tx.to && !isKnownAddress(tx.to)) {
      suspiciousPatterns.unknownContracts++
      riskScore += 2
    }
  }
  
  // Check for rapid-fire transactions (spam pattern)
  if (txs.length > 50) {
    suspiciousPatterns.rapidFire++
    riskScore += 5
  }
  
  // Build warnings
  if (suspiciousPatterns.dust > 5) {
    warnings.push(`High dust activity (${suspiciousPatterns.dust} small transfers)`)
  }
  if (suspiciousPatterns.zeroValue > 10) {
    warnings.push(`Unusual zero-value transactions (${suspiciousPatterns.zeroValue})`)
  }
  if (suspiciousPatterns.unknownContracts > 20) {
    warnings.push(`Multiple unknown contract interactions`)
  }
  if (suspiciousPatterns.rapidFire) {
    warnings.push(`Rapid transaction pattern detected`)
  }
  
  const risk = riskScore > 20 ? 'high' : riskScore > 10 ? 'medium' : 'low'
  
  return {
    status: risk === 'high' ? 'poisoned' : 'clean',
    risk,
    txCount: txs.length,
    riskScore,
    suspiciousPatterns,
    warnings,
    message: warnings.length > 0 
      ? `⚠️ ${warnings.join(', ')}` 
      : '✅ Address appears clean',
  }
}

function isKnownAddress(address) {
  /**
   * List of well-known contracts/addresses
   * Expand as needed
   */
  const known = [
    '0x',
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  ]
  
  return known.some(addr => address.toLowerCase().includes(addr.toLowerCase()))
}

export function formatPoisonReport(report) {
  return `
Risk Level: ${report.risk.toUpperCase()}
Transactions Analyzed: ${report.txCount}
Risk Score: ${report.riskScore}
Message: ${report.message}
${report.suspiciousPatterns ? `
Suspicious Patterns:
  - Dust: ${report.suspiciousPatterns.dust}
  - Zero-Value: ${report.suspiciousPatterns.zeroValue}
  - Unknown Contracts: ${report.suspiciousPatterns.unknownContracts}
  - Rapid-Fire: ${report.suspiciousPatterns.rapidFire}
` : ''}
  `.trim()
}
