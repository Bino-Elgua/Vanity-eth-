import * as bip39 from 'bip39';
console.log('bip39 loaded:', typeof bip39.generateMnemonic);

import { THEMES } from './src/utils/wordlists.js';
console.log('THEMES loaded:', Object.keys(THEMES).length);

import { generateCipherFromTheme, encodePhrase } from './src/utils/ciphers.js';
console.log('ciphers loaded');

import { generateRandomSeed, getAllAddresses } from './src/utils/bip39Helper.js';
console.log('bip39Helper loaded');
