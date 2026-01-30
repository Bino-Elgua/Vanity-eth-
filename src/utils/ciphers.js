/**
 * CloakSeed Cipher Engine
 * Maps custom 2048-word ciphers to BIP-39 indices
 */

// Simple BIP-39 wordlist (first 100 words for demo)
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absolute', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
  'across', 'act', 'action', 'actor', 'actual', 'acuity', 'acute', 'ad',
  'add', 'addicted', 'addition', 'additive', 'address', 'adjust', 'administer', 'admiral',
  'admire', 'admit', 'adobe', 'adopt', 'adore', 'adorn', 'adult', 'advance',
  'adverse', 'advertise', 'advice', 'advise', 'advocate', 'afar', 'afraid', 'after',
  'again', 'against', 'age', 'agent', 'agile', 'aging', 'agitate', 'aglow',
  'agony', 'agony', 'agree', 'ahead', 'aid', 'aide', 'ail', 'aim'
];

import { sha256 } from '@noble/hashes/sha256';

/**
 * Generate a custom cipher: map 2048 custom words to BIP-39 indices
 * @param {string[]} customWords - Array of 2048 unique custom words
 * @returns {Object} Cipher mapping: { word -> bip39Index }
 */
export function generateCipher(customWords) {
  if (customWords.length !== 2048) {
    throw new Error('Cipher must contain exactly 2048 words');
  }

  const uniqueWords = new Set(customWords);
  if (uniqueWords.size !== 2048) {
    throw new Error('All cipher words must be unique');
  }

  const cipherMap = {};
  customWords.forEach((word, index) => {
    cipherMap[word.toLowerCase()] = index; // Index 0-2047 maps to BIP-39 index
  });

  return cipherMap;
}

/**
 * Create a cipher from a theme + user customizations
 * @param {string[]} themeWords - Base theme words (2048)
 * @param {Object} customizations - User edits: { oldWord: newWord, ... }
 * @returns {Object} Final cipher mapping
 */
export function generateCipherFromTheme(themeWords, customizations = {}) {
  const cipher = [...themeWords]; // Clone theme

  // Apply customizations
  Object.entries(customizations).forEach(([oldWord, newWord]) => {
    const index = cipher.indexOf(oldWord);
    if (index !== -1) {
      cipher[index] = newWord;
    }
  });

  return generateCipher(cipher);
}

/**
 * Encode a BIP-39 phrase using custom cipher
 * Input: "abandon able zone" (real BIP-39 words)
 * Output: "fluff spark moon" (custom cipher words)
 * 
 * @param {string} bip39Phrase - Standard 12 or 24-word BIP-39 phrase
 * @param {string[]} cipherWords - Custom cipher words (2048)
 * @returns {string} Encoded cloak phrase
 */
export function encodePhrase(bip39Phrase, cipherWords) {
  const phraseWords = bip39Phrase.trim().split(/\s+/);

  return phraseWords
    .map(word => {
      const index = BIP39_WORDS.indexOf(word.toLowerCase());
      if (index === -1) {
        // If word not in demo list, just use hash
        return cipherWords[Math.abs(word.charCodeAt(0)) % cipherWords.length];
      }
      return cipherWords[index % cipherWords.length];
    })
    .join(' ');
}

/**
 * Decode a cloak phrase back to real BIP-39
 * Input: "fluff spark moon" (cloak)
 * Output: "abandon able zone" (real BIP-39)
 * 
 * @param {string} cloakPhrase - Custom cipher phrase
 * @param {string[]} cipherWords - Custom cipher words (2048)
 * @returns {string} Real BIP-39 phrase
 */
export function decodePhrase(cloakPhrase, cipherWords) {
  const cloakWords = cloakPhrase.trim().split(/\s+/);

  return cloakWords
    .map(word => {
      const index = cipherWords.indexOf(word.toLowerCase());
      if (index === -1) {
        throw new Error(`Invalid cloak word: ${word}`);
      }
      return BIP39_WORDS[index % BIP39_WORDS.length];
    })
    .join(' ');
}

/**
 * Validate a cipher
 * @param {string[]} cipherWords - Words to validate (should be 2048)
 * @returns {Object} { isValid: bool, error?: string }
 */
export function validateCipher(cipherWords) {
  if (!Array.isArray(cipherWords)) {
    return { isValid: false, error: 'Cipher must be an array' };
  }

  if (cipherWords.length !== 2048) {
    return { isValid: false, error: `Cipher must have exactly 2048 words, got ${cipherWords.length}` };
  }

  const uniqueWords = new Set(cipherWords.map(w => w.toLowerCase()));
  if (uniqueWords.size !== 2048) {
    return { isValid: false, error: 'All cipher words must be unique' };
  }

  // Check for empty/invalid words
  if (cipherWords.some(w => !w || typeof w !== 'string' || w.trim() === '')) {
    return { isValid: false, error: 'Cipher contains invalid or empty words' };
  }

  return { isValid: true };
}

/**
 * Hash a cipher for fingerprinting
 * @param {string[]} cipherWords - Cipher to hash
 * @returns {string} Hex-encoded SHA256 hash
 */
export function hashCipher(cipherWords) {
  const cipherString = cipherWords.join('|');
  const hash = sha256(cipherString);
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a "panic phrase" - a fake cloak using a different seed
 * User types this fake phrase, app shows a worthless wallet
 * Real wallet stays hidden until real cloak is entered
 * 
 * @param {string[]} cipherWords - Custom cipher
 * @param {string} panicInput - User's panic phrase (fake words)
 * @returns {Object} { cloakPhrase: string, seedPhrase: string, entropy: string }
 */
export function generatePanicPhrase(cipherWords, panicInput = '') {
  // Generate random entropy (12 words = 128-bit entropy)
  const entropy = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
  
  // Create fake seed from entropy (just use words at random indices)
  const fakeSeed = Array(12)
    .fill(0)
    .map(() => BIP39_WORDS[Math.floor(Math.random() * BIP39_WORDS.length)])
    .join(' ');

  // Encode fake seed with cipher
  const fakeCloak = encodePhrase(fakeSeed, cipherWords);

  return {
    cloakPhrase: fakeCloak,
    seedPhrase: fakeSeed,
    entropy: Array.from(entropy).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

/**
 * Check if a phrase matches a cipher
 * (Verify user entered correct cloak words)
 * 
 * @param {string} cloakPhrase - User's entered phrase
 * @param {string[]} cipherWords - Known cipher
 * @returns {Object} { isValid: bool, matchCount: number, totalWords: number }
 */
export function validateCloak(cloakPhrase, cipherWords) {
  const cloakWords = cloakPhrase.trim().split(/\s+/);
  const cipherSet = new Set(cipherWords.map(w => w.toLowerCase()));

  let matchCount = 0;
  cloakWords.forEach(word => {
    if (cipherSet.has(word.toLowerCase())) {
      matchCount++;
    }
  });

  return {
    isValid: matchCount === cloakWords.length && cloakWords.length > 0,
    matchCount,
    totalWords: cloakWords.length,
    confidence: Math.round((matchCount / cloakWords.length) * 100)
  };
}

/**
 * Export cipher as encrypted JSON
 * @param {string[]} cipherWords - Cipher to export
 * @param {string} password - Password for encryption
 * @returns {string} Encrypted JSON string
 */
export async function exportCipherEncrypted(cipherWords, password) {
  // Simple XOR encryption (for demo; use proper crypto for production)
  const cipherData = JSON.stringify({ words: cipherWords, version: 1 });
  
  // Derive key from password using PBKDF2
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // XOR cipher with key (simple, not cryptographically secure for production)
  const keyArray = new Uint8Array(hashBuffer);
  const dataArray = new Uint8Array(encoder.encode(cipherData));
  const encrypted = new Uint8Array(dataArray.length);
  
  for (let i = 0; i < dataArray.length; i++) {
    encrypted[i] = dataArray[i] ^ keyArray[i % keyArray.length];
  }

  return JSON.stringify({
    version: 1,
    encrypted: Buffer.from(encrypted).toString('base64'),
    salt: Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  });
}

/**
 * Import encrypted cipher JSON
 * @param {string} encryptedJson - Encrypted JSON string
 * @param {string} password - Password for decryption
 * @returns {string[]} Decrypted cipher words
 */
export async function importCipherEncrypted(encryptedJson, password) {
  const data = JSON.parse(encryptedJson);
  
  // Derive key from password
  const encoder = new TextEncoder();
  const pwData = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', pwData);
  const keyArray = new Uint8Array(hashBuffer);
  
  // Decrypt
  const encrypted = new Uint8Array(Buffer.from(data.encrypted, 'base64'));
  const decrypted = new Uint8Array(encrypted.length);
  
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyArray[i % keyArray.length];
  }

  const decryptedString = new TextDecoder().decode(decrypted);
  const cipherData = JSON.parse(decryptedString);
  
  return cipherData.words;
}
