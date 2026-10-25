# WhatsSchedule ⏰💬

> **The #1 Open-Source WhatsApp Message, Media & Video Scheduler**  
> *Architected and maintained by **Aroon Kumar**.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vite.dev)
[![WhatsApp Multi-Device](https://img.shields.io/badge/Protocol-Multi--Device-25D366.svg)](https://github.com/WhiskeySockets/Baileys)
[![SQLite](https://img.shields.io/badge/Storage-Embedded%20SQLite-003B57.svg)](https://sqlite.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🔍 Why WhatsSchedule? (Schedule WhatsApp Messages on iPhone, Android & Mac)

Have you ever remembered at night: *"I need to message HR tomorrow at 9:00 AM regarding salary updates"* — but you'll be sleeping, commuting, or away from your phone?

**WhatsSchedule** is the open-source, privacy-first answer to WhatsApp scheduling:

* 📱 **Zero Official Meta API Required**: No Meta Developer accounts, business verifications, paid templates, or credit cards needed.
* 🔒 **Works When Phone Is Locked or Asleep**: Operates at the protocol level via WhatsApp's Multi-Device companion architecture. Your primary phone does not need to be active, unlocked, or even connected to Wi-Fi at the time of delivery.
* 🎥 **All Media & File Formats**: Full support for HD Videos (`.mov`, `.mp4`), Photos (including Apple `.heic`, `.png`, `.jpg`), Voice Memos (`.m4a`), and Documents (`.pdf`, `.docx`).
* ✓✓ **Authentic WhatsApp Double Ticks**: Real-time receipt tracking showing single ticks, double grey ticks (delivered), and double blue ticks (read).
* 🛡️ **Anti-Ban Human Emulation**: Built-in 1.4s–3.2s natural typing indicators (`"composing..."` / `"recording..."`) to ensure 100% account safety.
* ⚡ **Blazing Fast**: Embedded SQLite persistent queue that survives reboots, paired with a React 19 + Tailwind dashboard styled just like WhatsApp Web.
* 🔐 **100% On-Device Isolation**: Your credentials, contacts, and media never leave your local machine.

---

## 📲 Quick Install: iPhone, Android & Mac ($0 Cost — No App Store Fees)

No need to pay $99/year to Apple or $25 to Google. You can run WhatsSchedule on any device in seconds:

### 🍏 On iPhone (iOS) — 100% Free PWA
1. Open Safari and navigate to your WhatsSchedule URL (e.g. `http://your-mac-ip:5001`).
2. Tap the **Share** button (⎙) at the bottom.
3. Tap **"Add to Home Screen"**.
4. **Done!** A native WhatsApp Scheduler app icon is added to your iPhone home screen. It runs in full-screen standalone mode without any browser URL bar!

### 🤖 On Android — 1-Tap WebAPK
1. Open Google Chrome and visit your WhatsSchedule URL.
2. Tap the 3 dots (⋮) and select **"Install App"** (or *Add to Home screen*).
3. Android creates a native app icon in your app drawer with standalone window support.

### 💻 On MacBook / Windows / Linux — 1-Click Launch
* **Mac / Linux**: Double-click or run `./start.sh` in terminal. It installs missing packages and launches your browser automatically.
* **Windows**: Double-click `start.bat`.

---

## 🚀 Developer Quick Start

```bash
# 1. Clone repository
git clone https://github.com/AroonKumarr/whatschedule.git
cd whatschedule

# 2. Install workspace dependencies
npm run install:all

# 3. Start development server (Port 5001 & Port 5173 with hot reload)
npm run dev

# 4. Or run single-port production mode
npm run build && npm start
```

Open your browser at **`http://localhost:5001`**.

---

## 🛠️ Tech Stack & Architecture

We chose the modern, high-speed TypeScript ecosystem:

```
[ Frontend: React 19 + Vite + Tailwind CSS (WhatsApp Web Theme) ]
                             │
                      REST & WebSockets
                             │
[ Backend: Node.js + Express + Prisma ORM + SQLite Queue ]
                             │
              Binary WebSocket Protocol (Baileys)
                             │
         [ WhatsApp Multi-Device Encrypted Cloud ]
```

* **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide Icons, Date-fns.
* **Backend**: Node.js, Express, TypeScript, Multer, Pino.
* **Database**: Embedded SQLite with Prisma ORM (zero setup, single `dev.db` file).
* **Protocol Core**: `@whiskeysockets/baileys` (runs directly in <60MB RAM without Chromium).

👉 **For an in-depth architecture walkthrough, read the [Developer Guide](DEVELOPER_GUIDE.md).**

---

## 🤝 Contributing & Community

Contributions are what make open source thrive! Whether you are:
- Adding **AI Assistants** to auto-draft salary or follow-up messages
- Adding **LinkedIn / Twitter** post scheduling
- Improving localized translations
- Reporting bugs or suggesting UX enhancements

Please read our [Contributing Guide](CONTRIBUTING.md) to get started with PRs, code styles, and good first issues.

---

## ⚖️ Legal Disclaimer & Trademark Protection

**WhatsApp** is a registered trademark of **Meta Platforms, Inc.**

**WhatsSchedule** is an independent open-source productivity utility created and owned by **Aroon Kumar**. It is **NOT** affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp LLC, Meta Platforms, Inc., or any of their affiliates. See [`LEGAL_DISCLAIMER.md`](LEGAL_DISCLAIMER.md) for details.

---

## 📄 License

Copyright (c) 2026 **Aroon Kumar**. All rights reserved.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
