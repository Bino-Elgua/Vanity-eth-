import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import { CHAINS } from './chains'
import type { ChainId } from './types'

interface DerivedKey {
  privateKey: string
  publicKey: string
  path: string
  chainId: string
}

export async function generateSeedPhrase(): Promise<string> {
  const entropy = crypto.getRandomValues(new Uint8Array(32))
  return bip39.entropyToMnemonic(Buffer.from(entropy))
}

export async function mnemonicToSeed(mnemonic: string): Promise<Buffer> {
  return await bip39.mnemonicToSeed(mnemonic)
}

export function deriveFromSeed(seed: Buffer, chainId: ChainId = 'ethereum'): DerivedKey {
  const chain = CHAINS[chainId] || CHAINS.ethereum
  const root = bip32.fromSeed(seed)
  const path = chain.bip44
  const child = root.derivePath(path)
  return {
    privateKey: child.privateKey!.toString('hex'),
    publicKey: child.publicKey.toString('hex'),
    path,
    chainId,
  }
}

export function getAllDerivations(seed: Buffer): Record<string, DerivedKey> {
  const derivations: Record<string, DerivedKey> = {}
  for (const chainId of Object.keys(CHAINS) as ChainId[]) {
    try {
      derivations[chainId] = deriveFromSeed(seed, chainId)
    } catch (e) {
      console.error(`Failed to derive ${chainId}:`, e)
    }
  }
  return derivations
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic)
}

export function mnemonicToEntropy(mnemonic: string): string {
  return bip39.mnemonicToEntropy(mnemonic)
}

export const WORDLIST: string[] = bip39.wordlists.EN
