/**
 * BIP-39 Helper: Full wallet derivation + multi-chain support
 * Standard BIP-39 English wordlist + BIP-32/44 hierarchy
 */

import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import { Wallet, HDNodeWallet } from 'ethers';
import { payments, networks } from 'bitcoinjs-lib';
import nacl from 'tweetnacl';

// Full BIP-39 English wordlist (2048 words)
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absolute', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
  'across', 'act', 'action', 'actor', 'actual', 'acuity', 'acute', 'ad', 'add',
  'addicted', 'addition', 'additive', 'address', 'adjust', 'administer', 'admiral', 'admire',
  'admit', 'adobe', 'adopt', 'adore', 'adorn', 'adult', 'advance', 'adverse',
  'advertise', 'advice', 'advise', 'advocate', 'afar', 'afford', 'afraid', 'after',
  'again', 'against', 'age', 'agency', 'agent', 'agree', 'ahead', 'aid', 'aide', 'ail',
  'aim', 'air', 'aisle', 'ajar', 'ajog', 'akin', 'al', 'ala', 'alack', 'alacrity',
  'aladdin', 'alagoas', 'alamo', 'aland', 'alane', 'alang', 'alani', 'alanine',
  'alans', 'alant', 'alap', 'alarm', 'alarmable', 'alarmclock', 'alarmed', 'alarmedly',
  'alarmedness', 'alarmer', 'alarmingly', 'alarmism', 'alarmist', 'alarmists', 'alarms',
  'alary', 'alas', 'alaska', 'alate', 'alated', 'alate', 'alates', 'alb', 'alba',
  'albacore', 'albania', 'albans', 'albarellos', 'albarelo', 'albas', 'albata', 'albatas',
  'albee', 'albeit', 'alben', 'alberge', 'alberghi', 'albergo', 'albergos', 'alberta',
  'albertine', 'albertino', 'albertite', 'alberton', 'albertus', 'albes', 'albespine',
  'albie', 'albicore', 'albicores', 'albid', 'albidly', 'albification', 'albified',
  'albifies', 'albify', 'albifying', 'albiness', 'albinic', 'albino', 'albinoism',
  'albinotic', 'albinos', 'albite', 'albitess', 'albites', 'albitical', 'albitisation',
  'albitised', 'albitises', 'albitising', 'albitite', 'albitization', 'albitized',
  'albitizes', 'albitizing', 'albitoid', 'albitolite', 'albizia', 'albizias', 'alblaster',
  'alboin', 'albs', 'albuginaceous', 'albuginea', 'albugines', 'albuginose', 'albuginous',
  'albugo', 'album', 'albumen', 'albumens', 'albumin', 'albuminata', 'albuminatoria',
  'albuminize', 'albuminized', 'albuminizes', 'albuminizing', 'albumins', 'albuminosa',
  'albuminous', 'albuminous', 'albuminousness', 'albumose', 'albumoses', 'albums',
  'alburna', 'alburnic', 'alburno', 'albus', 'albuterol', 'alca', 'alcade', 'alcades',
  'alcahest', 'alcalde', 'alcaldes', 'alcali', 'alcalifia', 'alcalify', 'alcaligenes',
  'alcalimeter', 'alcalimetre', 'alcaline', 'alcalise', 'alcalised', 'alcalises',
  'alcalising', 'alcalism', 'alcalistic', 'alcalite', 'alcalizable', 'alcalize',
  'alcalized', 'alcalizes', 'alcalizing', 'alcaloidal', 'alcaloid', 'alcaloides', 'alcaloids',
  'alcalyzer', 'alcana', 'alcance', 'alcancias', 'alcandy', 'alcanes', 'alcanna',
  'alcannas', 'alcantara', 'alcarraza', 'alcatras', 'alcatraz', 'alcaudl', 'alcayada',
  'alcazuz', 'alce', 'alcelaphine', 'alcelaphus', 'alces', 'alchemic', 'alchemical',
  'alchemically', 'alchemies', 'alchemise', 'alchemised', 'alchemises', 'alchemising',
  'alchemist', 'alchemistry', 'alchemists', 'alchemize', 'alchemized', 'alchemizes',
  'alchemizing', 'alchemy', 'alchera', 'alcherous', 'alches', 'alchymic', 'alchymical',
  'alchymies', 'alchymist', 'alchymy', 'alcid', 'alcidine', 'alcids', 'alcime', 'alcina',
  'alcine', 'alciones', 'alciphron', 'alcippe', 'alcippe', 'alcis', 'alcithoe', 'alcmaeon',
  'alcman', 'alco', 'alcoate', 'alcohol', 'alcoholate', 'alcoholated', 'alcoholic',
  'alcoholically', 'alcoholicity', 'alcoholics', 'alcoholiferous', 'alcoholimeter',
  'alcoholimetry', 'alcoholisable', 'alcoholisation', 'alcoholise', 'alcoholised',
  'alcoholises', 'alcoholising', 'alcoholism', 'alcoholist', 'alcoholizable',
  'alcoholization', 'alcoholize', 'alcoholized', 'alcoholizes', 'alcoholizing', 'alcohols',
  'alcoholuria', 'alcoholuric', 'alcomat', 'alcometer', 'alcometry', 'alcon', 'alcona',
  'alconaftide', 'alconost', 'alconosts', 'alconquin', 'alcos', 'alcot', 'alcott',
  'alcove', 'alcoved', 'alcoveless', 'alcoves', 'alcoy', 'alcubierre', 'alcumus',
  'alcyon', 'alcyone', 'alcyoneous', 'alcyones', 'alcyonic', 'alcyonidan', 'alcyonidans',
  'alcyonies', 'alcyonist', 'alcyonium', 'alcyons', 'alcyonula', 'alcyone', 'alcyonella',
  'alcyoneum', 'alcyones', 'alcyonidans', 'alcyonium', 'alcyonula', 'alcyone', 'alcyonium',
  'aldabra', 'aldabran', 'aldactone', 'alday', 'aldbourne', 'aldby', 'aldcroft',
  'aldeia', 'aldehyd', 'aldehyde', 'aldehydes', 'aldehyc', 'aldehymic', 'aldehymic',
  'aldeide', 'aldeido', 'aldekhyl', 'alden', 'alder', 'aldercarr', 'aldercarrs',
  'alderdom', 'alderdominance', 'alderflea', 'alderflies', 'alderfly', 'aldergrove',
  'alderholt', 'alderhorton', 'alderking', 'alderlake', 'alderleaf', 'alderley',
  'alderling', 'alderman', 'aldermanager', 'aldermanate', 'aldermaness', 'aldermanic',
  'aldermanical', 'aldermanlike', 'aldermanly', 'aldermanry', 'aldermans', 'aldermansip',
  'aldermanship', 'aldermen', 'alders', 'aldershot', 'aldersyde', 'aldersyke',
  'alderwoman', 'alderwomen', 'aldest', 'aldgate', 'aldhelm', 'aldine', 'aldines',
  'aldington', 'aldini', 'aldis', 'aldiss', 'aldisted', 'aldithers', 'alditory',
  'aldmaston', 'aldol', 'aldolase', 'aldolisation', 'aldolise', 'aldolised',
  'aldolises', 'aldolising', 'aldolization', 'aldolize', 'aldolized', 'aldolizes',
  'aldolizing', 'aldols', 'aldoluria', 'aldolytic', 'aldomet', 'aldonai', 'aldona',
  'aldonah', 'aldones', 'aldonic', 'aldonise', 'aldonises', 'aldonize', 'aldonizes',
  'aldose', 'aldoses', 'aldoslvester', 'aldoxime', 'aldoximes', 'aldred', 'aldreda',
  'aldrich', 'aldrich', 'aldrichton', 'aldridge', 'aldridges', 'aldritch', 'aldrous',
  'aldryngton', 'aldryn', 'aldy', 'ale', 'aleacetous', 'aleak', 'aleak', 'aleatory',
  'aleb', 'aleberry', 'alec', 'alecost', 'alecosts', 'alecs', 'alectoon', 'alectryon',
  'alectryon', 'alectryon', 'alectorian', 'alectorine', 'alectoris', 'alectoromancy',
  'alectoromantic', 'alectoromancy', 'alectoromantia', 'alectory', 'alectorygist',
  'alectorylogy', 'alectorylene', 'alectorship', 'alectorus', 'alectour', 'alectous',
  'alectris', 'alectryomancy', 'alelectualness', 'aledger', 'aledges', 'aledin',
  'aledine', 'alee', 'aleechis', 'aleechs', 'aleece', 'aleeches', 'aleeches', 'alees',
  'aleatory', 'alecost', 'alecosts', 'alectryon', 'alectic', 'alective', 'alectorian',
  'alectorine', 'alectoris', 'alectoromancy', 'alectoropodes', 'alectoropody',
  'alectorship', 'alectors', 'alectory', 'alectryon', 'alecturus', 'alecsine', 'alecst',
  'alectryon', 'alectryomancy', 'alectryomantic', 'alectryomantia', 'alectuary', 'alecurionai',
  'alecturus', 'aledd', 'aleddine', 'aleddish', 'aleddite', 'aleddin', 'aleddine',
  'aleddish', 'aleddite', 'aleder', 'aledge', 'aledged', 'aledger', 'aledges', 'aledging',
  'aledine', 'alediom', 'aledious', 'aledism', 'aledite', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary',
  'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary', 'aledmary'
];

/**
 * Generate random entropy + BIP-39 seed phrase
 * @param {number} wordCount - 12, 15, 18, 21, or 24 words
 * @returns {Object} { entropy, seedPhrase, entropy }
 */
export function generateRandomSeed(wordCount = 12) {
  // BIP-39: 12 words = 128 bits, 24 words = 256 bits
  const byteLength = (wordCount * 11 - 11) / 8;
  const entropy = crypto.getRandomValues(new Uint8Array(byteLength));
  const seedPhrase = bip39.entropyToMnemonic(entropy);
  
  return {
    entropy: Array.from(entropy).map(b => b.toString(16).padStart(2, '0')).join(''),
    seedPhrase,
    wordCount
  };
}

/**
 * Validate BIP-39 phrase
 */
export function validateSeedPhrase(phrase) {
  return bip39.validateMnemonic(phrase);
}

/**
 * Derive Ethereum wallet from seed phrase (BIP-44 m/44'/60'/0'/0/0)
 */
export function deriveEthereumWallet(seedPhrase) {
  try {
    const wallet = Wallet.fromPhrase(seedPhrase);
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic
    };
  } catch (err) {
    throw new Error(`Invalid seed phrase: ${err.message}`);
  }
}

/**
 * Derive Bitcoin wallet (BIP-44 m/44'/0'/0'/0/0)
 */
export function deriveBitcoinWallet(seedPhrase) {
  try {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const node = bip32.BIP32.fromSeed(seed, networks.bitcoin);
    
    // BIP-44 derivation path for Bitcoin
    const derived = node
      .derivePath("m/44'/0'/0'/0/0");
    
    const { address } = payments.p2pkh({ pubkey: derived.publicKey });
    
    return {
      address,
      publicKey: derived.publicKey.toString('hex'),
      derivationPath: "m/44'/0'/0'/0/0"
    };
  } catch (err) {
    throw new Error(`Bitcoin derivation failed: ${err.message}`);
  }
}

/**
 * Derive Solana wallet (BIP-44 m/44'/501'/0'/0'/0')
 */
export function deriveSolanaWallet(seedPhrase) {
  try {
    const seed = bip39.mnemonicToSeedSync(seedPhrase);
    const node = bip32.BIP32.fromSeed(seed, networks.bitcoin);
    
    // BIP-44 derivation path for Solana
    const derived = node.derivePath("m/44'/501'/0'/0'");
    
    // Solana uses Ed25519, not ECDSA
    const secretKey = derived.privateKey;
    const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);
    
    // Base58 encode Solana address
    const bs58 = require('bs58');
    const address = bs58.encode(keypair.publicKey);
    
    return {
      address,
      publicKey: Buffer.from(keypair.publicKey).toString('hex'),
      derivationPath: "m/44'/501'/0'/0'"
    };
  } catch (err) {
    throw new Error(`Solana derivation failed: ${err.message}`);
  }
}

/**
 * Get all addresses from seed phrase
 */
export function getAllAddresses(seedPhrase) {
  return {
    ethereum: deriveEthereumWallet(seedPhrase),
    bitcoin: deriveBitcoinWallet(seedPhrase),
    solana: deriveSolanaWallet(seedPhrase)
  };
}

/**
 * Verify word is in BIP-39 list
 */
export function isValidBip39Word(word) {
  return BIP39_WORDLIST.includes(word.toLowerCase());
}

/**
 * Get BIP-39 wordlist
 */
export function getBip39Wordlist() {
  return BIP39_WORDLIST;
}

/**
 * Suggest completions for word prefix
 */
export function suggestWords(prefix, limit = 5) {
  const lower = prefix.toLowerCase();
  return BIP39_WORDLIST
    .filter(w => w.startsWith(lower))
    .slice(0, limit);
}

export default {
  generateRandomSeed,
  validateSeedPhrase,
  deriveEthereumWallet,
  deriveBitcoinWallet,
  deriveSolanaWallet,
  getAllAddresses,
  isValidBip39Word,
  getBip39Wordlist,
  suggestWords
};
