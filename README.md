# WhatsSchedule ⏰💬

> **The Open-Source WhatsApp Message, Media & Automation Engine**  
> *Architected and maintained by **Aroon Kumar**.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vite.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## ⚡ 10-Second Value Overview

WhatsSchedule is an open-source, privacy-first messaging scheduler designed for professionals, teams, and developers:

```
[ Your Phone / Laptop ] ────► [ WhatsSchedule Engine (Local SQLite Queue) ]
                                            │
                                            ▼ (Multi-Device Protocol)
                               [ WhatsApp Encrypted Cloud ]
                                            │
                                            ▼
                           [ Recipient Receives on Schedule ]
```

* 🚀 **Unlimited Scheduling Power**: Schedule unlimited text messages, HD videos, documents, and voice notes with zero artificial paywalls.
* 🤖 **Built-In AI Assistant**: Production-grade drafting assistant with per-user rate limits, token budgeting, concurrency caps, and SHA-256 caching.
* 🔒 **Master Security PIN Protection**: Cryptographic PBKDF2 (100,000 iterations) passcode lock preventing unauthorized access across shared computers or browser profiles.
* 🛑 **Compliance & Opt-Out Engine**: Automatically detects inbound `STOP` or `UNSUBSCRIBE` requests and halts future dispatches to that recipient.
* 🚨 **Emergency Queue Pause Switch**: 1-click circuit breaker to immediately halt all outgoing message queues.
* ✓✓ **Real-Time Delivery & Read Ticks**: Live WebSocket updates for single ticks (sent), double grey ticks (delivered), and double blue ticks (read).
* 📁 **All Media Formats**: Full native support for Apple QuickTime MOV, HEIC photos, M4A voice notes, and documents up to 100MB.

---

## 📦 Painless Quick Start

### Option A: 1-Click Launchers (Zero Terminal Knowledge)
* **Mac & Linux**: Double-click or run `./start.sh` (installs packages, builds assets, and opens your browser automatically).
* **Windows**: Double-click `start.bat`.

### Option B: Docker Compose
```bash
# Clone the repository
git clone https://github.com/AroonKumarr/whatschedule.git
cd whatschedule

# Start containerized instance
docker compose up -d
```
Visit `http://localhost:5001` in your browser.

### Option C: Developer Setup
```bash
git clone https://github.com/AroonKumarr/whatschedule.git
cd whatschedule

# Install workspace dependencies
npm run install:all

# Run concurrent development servers (Port 5001 & Port 5173 with HMR)
npm run dev
```

---

## 📱 Mobile Access (iPhone & Android — $0 Cost)

WhatsSchedule is fully configured as a standalone **Progressive Web App (PWA)**:

* **iPhone (iOS)**: Open Safari $\to$ visit your instance URL $\to$ tap **Share** (⎙) $\to$ **Add to Home Screen**. Opens full-screen with native gestures and zero browser bars.
* **Android**: Open Chrome $\to$ tap menu (⋮) $\to$ **Install App**. Creates a native WebAPK in your app drawer.

---

## 🛡️ Architecture & Security Model

* **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide Icons, Date-fns.
* **Backend**: Node.js, Express, TypeScript, Multer, Pino.
* **Database**: Embedded SQLite via Prisma ORM (zero setup, single `dev.db` file).
* **AI Service Layer**: Built with global concurrency controls (5 max), per-user rate limiting (15 drafts/min), and fallback templates.
* **Threat Mitigation**: Signed HMAC-SHA256 session tokens with 24-hour expiration; timing-safe signature comparison; isolated `sessionStorage`.

---

## 🤝 Community & Contributing

We welcome community contributions! Please read:
* [`CONTRIBUTING.md`](CONTRIBUTING.md): Step-by-step contribution guidelines and PR templates.
* [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md): In-depth architectural manual, multi-device socket breakdown, and testing instructions.
* [`CHANGELOG.md`](CHANGELOG.md): Complete release history and roadmap.

---

## ⚖️ Legal Notice & Trademark Disclaimer

**WhatsApp** is a registered trademark of **Meta Platforms, Inc.**

**WhatsSchedule** is an independent open-source productivity software project created and owned by **Aroon Kumar**. It is **NOT** affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp LLC, Meta Platforms, Inc., or any of their affiliates. See [`LEGAL_DISCLAIMER.md`](LEGAL_DISCLAIMER.md) for details.

---

## 📄 License

Copyright (c) 2026 **Aroon Kumar**. All rights reserved.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
