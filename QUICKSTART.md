# CloakSeed - Quick Start Guide

Get started with CloakSeed in 5 minutes.

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm (comes with Node.js)
- A modern browser (Chrome, Firefox, Safari, Edge)

### Setup

```bash
# 1. Navigate to project
cd vanity-eth-pro-custom

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

Done! You should see the CloakSeed landing page.

---

## 📖 First Time Usage

### Step 1: Create Your Cipher

1. Click **"Start Creating Your Cloak"**
2. Choose a theme:
   - 🦁 Animals (lions, zebras, etc.)
   - 🎨 Colors (crimson, azure, etc.)
   - 🍕 Food (pizza, taco, etc.)
   - ⚔️ Fantasy (dragon, wizard, etc.)
   - 🎪 Nonsense (blorb, flurp, etc.)
3. Click the theme to confirm

### Step 2: Generate Your First Cloak

1. Click **"Generate Cloak Phrase"**
2. You'll see:
   - **Your Cloak Phrase** (write this down)
   - **Real BIP-39 Seed** (hidden by default)
   - **Wallet Addresses** (ETH, BTC, SOL)

### Step 3: Write It Down

Save your cloak phrase:
- Notebook (looks like random words!)
- Password manager
- Encrypted text file
- Anywhere safe

### Step 4: Import into Wallet

To access your funds later:

1. Click **"Show Real Seed"** to reveal it
2. Copy the **real seed phrase**
3. Open MetaMask, Phantom, Ledger, etc.
4. Import using BIP-39 recovery phrase
5. Your wallet is restored!

### Step 5: Restore Later

To recover your wallet again:

1. Click **"Restore"** in the top menu
2. Paste your **cloak phrase**
3. Click **"Restore Wallet"**
4. See your real seed + addresses

---

## 💡 Tips & Tricks

### Safe Generation

**Best practice:**

```
1. Disconnect from internet
2. Load CloakSeed (it caches offline)
3. Generate your cloak
4. Write it down
5. Clear your browser history
6. Reconnect to internet
```

### Custom Wordlist

Instead of presets, create your own 2048-word cipher:

1. Click **"Upload Custom Wordlist"**
2. Upload `.txt` file with 2048 words (one per line)
3. Or paste words directly
4. Click to confirm

### Backup Your Cipher

You can export your cipher for safekeeping:

1. Click **"Export"** in menu
2. Set a strong password
3. Download encrypted JSON file
4. Store in secure location (safe, vault, etc.)

### Panic Phrase (Pro Feature)

If someone forces you to reveal your seed:

1. Generate a **Panic Phrase**
2. Give them the fake phrase instead
3. It decodes to a worthless wallet
4. Your real funds stay safe

---

## ⚙️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🔒 Security Checklist

Before using with real crypto:

- [ ] Verify you're on the correct domain (no phishing)
- [ ] Check browser HTTPS lock icon
- [ ] Disconnect from internet for generation
- [ ] Never screenshot seed phrases
- [ ] Never paste online
- [ ] Write down in secure location
- [ ] Test restore on test wallet first
- [ ] Keep backup in separate location
- [ ] Use strong password for export

---

## 🐛 Troubleshooting

### "Module not found" error

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 5173 already in use

```bash
npm run dev -- --port 3000
# Or kill the process using the port
```

### Browser can't connect

- Make sure dev server is running
- Try `http://localhost:5173`
- Clear browser cache (Ctrl+Shift+Del)
- Check firewall settings

### Slow performance

- Close other tabs/apps
- Disable browser extensions
- Clear cache: Ctrl+Shift+Del
- Try different browser

---

## 📱 Mobile Usage

CloakSeed works on mobile devices:

1. Open on phone/tablet
2. Go to URL bar
3. iOS: Tap share → "Add to Home Screen"
4. Android: Tap menu → "Install app"
5. App is now offline-capable

---

## 🎓 Learn More

- **Full Guide**: [README.md](./README.md)
- **Features**: [CLOAKSEED_README.md](./CLOAKSEED_README.md)
- **Integration**: [CLOAKSEED_INTEGRATION.md](./CLOAKSEED_INTEGRATION.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 Need Help?

- **Docs**: Check README.md
- **Issues**: [GitHub Issues](https://github.com/yourusername/cloakseed)
- **Email**: support@cloakseed.dev
- **Security Issue**: security@cloakseed.dev

---

## ⚡ Pro Tips

### 1. Airgap Your Generation

```bash
# Download standalone version
npm run build

# Transfer dist/ to offline USB
# Open index.html on airgapped computer
# No internet needed after that
```

### 2. Multiple Ciphers

Create different ciphers for different purposes:
- One for daily spending wallet
- One for long-term storage
- One for family inheritance

### 3. Password-Protected Export

Export your cipher encrypted:

1. Click "Export"
2. Set strong password (20+ chars)
3. Download encrypted JSON
4. Store password separately from file
5. Keep in safe location

### 4. Test Restore First

Before trusting a cloak:

1. Create new cloak
2. Test restore on brand-new test wallet
3. Verify addresses match
4. Then use for real funds

### 5. Multiple Backups

Store backups in separate locations:
- One in home safe
- One in safety deposit box
- One in password manager (encrypted export)
- One with trusted family member

---

## 🎯 Common Mistakes to Avoid

❌ **Don't:**
- Use on public WiFi
- Screenshot seed phrases
- Paste online anywhere
- Share with anyone
- Use weak passwords
- Rely on single backup
- Use on untrusted computer
- Forget your cipher theme/password

✅ **Do:**
- Use on trusted computer
- Write down in notebook
- Store in secure location
- Keep backups separate
- Test restore before trusting
- Use strong passwords
- Generate on airgapped device
- Remember your theme (write it down!)

---

## 📊 Example Workflow

```
Day 1: Setup
  1. npm run dev
  2. Select "Animals" theme
  3. Generate cloak phrase
  4. Write down: "lion zebra dolphin..."
  5. Test restore

Week 1: Import to Wallet
  1. Load CloakSeed again
  2. Click "Restore"
  3. Paste cloak phrase
  4. Get real seed
  5. Import to MetaMask
  6. Receive funds

Year 1: Recovery
  1. Lost wallet? Device broke?
  2. Load CloakSeed (or download again)
  3. Click "Restore"
  4. Paste cloak from notebook
  5. Import real seed to new wallet
  6. All funds recovered!
```

---

## 🚀 Next Steps

1. **Try it out**: Generate a test cloak
2. **Test restore**: Practice restoring
3. **Read security**: Learn threat model
4. **Deploy**: Set up custom domain
5. **Go live**: Use with real crypto

---

**Happy cloaking!** 🛡️

---

*Last updated: 2025-01-XX*
