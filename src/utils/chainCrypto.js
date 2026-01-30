import * as secp256k1 from '@noble/secp256k1'
import * as ed25519 from '@noble/ed25519'
import { keccak_256, sha3_256 } from '@noble/hashes/sha3'
import { sha256 } from '@noble/hashes/sha256'
import { blake2b } from '@noble/hashes/blake2b'

/**
 * Multi-chain cryptography engine
 * Handles secp256k1, ed25519, schnorr across chains
 */

function hexToBytes(hex) {
  const h = hex.replace('0x', '')
  const bytes = new Uint8Array(h.length / 2)
  for (let i = 0; i < h.length; i += 2) {
    bytes[i / 2] = parseInt(h.substr(i, 2), 16)
  }
  return bytes
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getHashFunction(hashType) {
  switch (hashType) {
    case 'keccak256':
      return data => keccak_256(data)
    case 'sha256':
      return data => sha256(data)
    case 'blake2b':
      return data => blake2b(data, { dkLen: 32 })
    case 'sha3':
      return data => sha3_256(data)
    default:
      return data => keccak_256(data)
  }
}

export async function generateKeyForChain(chain) {
  const privateKey = crypto.getRandomValues(new Uint8Array(32))
  
  if (chain.curve === 'ed25519') {
    const publicKey = await ed25519.getPublicKey(privateKey)
    return {
      privateKey: bytesToHex(privateKey),
      publicKey: bytesToHex(publicKey),
      privateKeyBytes: privateKey,
      publicKeyBytes: publicKey,
    }
  } else {
    // secp256k1 / schnorr
    const publicKey = secp256k1.getPublicKey(privateKey, false)
    return {
      privateKey: bytesToHex(privateKey),
      publicKey: bytesToHex(publicKey),
      privateKeyBytes: privateKey,
      publicKeyBytes: publicKey,
    }
  }
}

export async function generateAddressForChain(chain, privateKey) {
  const privKeyBytes = typeof privateKey === 'string' ? hexToBytes(privateKey) : privateKey
  const hashFn = getHashFunction(chain.hash)
  
  let publicKeyBytes, address
  
  if (chain.curve === 'ed25519') {
    publicKeyBytes = await ed25519.getPublicKey(privKeyBytes)
  } else {
    publicKeyBytes = secp256k1.getPublicKey(privKeyBytes, true) // compressed
  }
  
  switch (chain.id) {
    case 'ethereum':
      address = deriveEthereumAddress(publicKeyBytes, hashFn)
      break
    case 'solana':
      address = deriveSolanaAddress(publicKeyBytes)
      break
    case 'bitcoin':
      address = deriveBitcoinAddress(publicKeyBytes, hashFn)
      break
    case 'sui':
      address = deriveSuiAddress(publicKeyBytes, hashFn)
      break
    case 'cosmos':
      address = deriveCosmosAddress(publicKeyBytes, hashFn)
      break
    case 'aptos':
      address = deriveAptosAddress(publicKeyBytes, hashFn)
      break
    default:
      address = deriveEthereumAddress(publicKeyBytes, hashFn)
  }
  
  return {
    address,
    privateKey: bytesToHex(privKeyBytes),
    publicKey: bytesToHex(publicKeyBytes),
  }
}

function deriveEthereumAddress(publicKey, hashFn) {
  // Remove first byte (0x04) for uncompressed
  const pubBytes = publicKey.slice(1)
  const hash = hashFn(pubBytes)
  const address = '0x' + bytesToHex(hash).slice(-40)
  return toChecksumAddress(address)
}

function deriveSolanaAddress(publicKey) {
  // Solana uses base58 encoding of public key
  // For now, return hex - proper base58 requires buffer module
  return '0x' + bytesToHex(publicKey)
}

function deriveBitcoinAddress(publicKey, hashFn) {
  // P2PKH: hash160(pubkey) = ripemd160(sha256(pubkey))
  // Simplified: use sha256 then return with prefix
  const sha256Data = hashFn(publicKey)
  // Return simplified format
  return '1' + bytesToHex(sha256Data).slice(0, 40)
}

function deriveSuiAddress(publicKey, hashFn) {
  // Sui uses blake2b hash of public key
  const hash = hashFn(publicKey)
  return '0x' + bytesToHex(hash).slice(-64)
}

function deriveCosmosAddress(publicKey, hashFn) {
  // cosmos1 + simplified hash encoding
  const sha256Data = hashFn(publicKey)
  return 'cosmos1' + bytesToHex(sha256Data).slice(0, 40)
}

function deriveAptosAddress(publicKey, hashFn) {
  // 0x + single signature scheme (0x00) + sha3(pubkey || 0x00)
  const schemeBytes = new Uint8Array([0])
  const combined = new Uint8Array(publicKey.length + 1)
  combined.set(publicKey)
  combined.set(schemeBytes, publicKey.length)
  const hash = hashFn(combined)
  return '0x' + bytesToHex(hash).slice(-64)
}

function toChecksumAddress(address) {
  const addr = address.toLowerCase().slice(2)
  const hash = keccak_256(hexToBytes(addr))
  let checksum = '0x'
  for (let i = 0; i < addr.length; i++) {
    const hashValue = parseInt(bytesToHex(hash)[i], 16)
    checksum += hashValue >= 8 ? addr[i].toUpperCase() : addr[i]
  }
  return checksum
}



export function matchesPatternForChain(address, chain, prefix, suffix) {
  let addr = address.replace(chain.prefix, '').toLowerCase()
  
  if (chain.id === 'bitcoin' || chain.id === 'solana') {
    // Base58 patterns
    const prefixMatch = !prefix || addr.startsWith(prefix)
    const suffixMatch = !suffix || addr.endsWith(suffix)
    return prefixMatch && suffixMatch
  }
  
  // Hex patterns (ETH, Sui, Aptos, Cosmos)
  const hexAddr = addr.replace(/^0x/, '')
  const prefixMatch = !prefix || hexAddr.startsWith(prefix.toLowerCase())
  const suffixMatch = !suffix || hexAddr.endsWith(suffix.toLowerCase())
  return prefixMatch && suffixMatch
}
