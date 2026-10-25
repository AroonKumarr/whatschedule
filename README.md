# WhatsSchedule ⏰💬

> **Open-Source WhatsApp Message & Media Scheduler**  
> *Developed and maintained by **Aroon Kumar**.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![WhatsApp Web Protocol](https://img.shields.io/badge/Protocol-Multi--Device-25D366.svg)](https://github.com/WhiskeySockets/Baileys)
[![SQLite](https://img.shields.io/badge/Storage-Embedded%20SQLite-003B57.svg)](https://sqlite.org)

---

## ⚖️ Legal Disclaimer & Trademark Notice

**WhatsApp** is a registered trademark of **Meta Platforms, Inc.**

**WhatsSchedule** is an independent, community-driven open-source software project created and owned by **Aroon Kumar**. This project is **NOT** affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp LLC, Meta Platforms, Inc., or any of their affiliates or subsidiaries.

All code and intellectual property in this repository are owned by **Aroon Kumar** and released under the **MIT License**.

---

## 🌟 Why WhatsSchedule?

Have you ever thought at night: *"I need to message HR tomorrow at 9:00 AM about salary updates"*, but you know you will be asleep, commuting, or busy?

WhatsSchedule solves this completely:
- 📱 **Zero Paid APIs Needed**: No Meta Cloud API, no business verification, no credit cards, and no message template approvals required.
- 🔒 **Works When Phone Is Asleep or Screen Is Locked**: Operates at the socket level via WhatsApp's Multi-Device companion protocol. Your primary phone does not need to be active, unlocked, or even on Wi-Fi at the time of delivery.
- 🎥 **Full Media & Document Support**: Schedule text messages, HD videos (`.mp4`, `.mov`), images (`.png`, `.jpg`), voice notes, and office files (`.pdf`, `.docx`).
- ⚡ **Blazing Fast**: Embedded SQLite database with zero-delay local processing and a React + Vite interface styled just like WhatsApp Web.
- 🔐 **100% Private & Local**: Your credentials, contacts, and scheduled media never leave your machine.

---

## 🖥️ User Interface & Experience

WhatsSchedule features an authentic **WhatsApp Web** aesthetic with dark mode and green accents:
1. **Instant QR Pairing Screen**: Scan the QR code once with your phone (WhatsApp $\to$ Linked Devices $\to$ Link a Device).
2. **Scheduled Chat Queue**: View all scheduled dispatches with live countdown timers (*"Sends in 4 hours 12 mins"*).
3. **Rich Composer**:
   - Direct international phone input with country dial codes (`+1`, `+91`, `+44`, `+971`, etc.).
   - Synced WhatsApp contacts autocomplete.
   - Quick date-time presets (*"Tomorrow 9:00 AM"*, *"+15 Mins"*, *"+1 Hour"*).
   - Drag & drop media uploader.
4. **Calendar & Timeline View**: Day-by-day roadmap of upcoming automated messages.
5. **Media Vault**: Local gallery to manage scheduled videos, images, and documents.
6. **System & Device Settings**: Monitor session health and manage linked credentials.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/whatapp_schduler.git
cd whatapp_schduler

# Install all workspace dependencies
npm run install:all
```

### Running in Development Mode

```bash
# Starts both the backend daemon (Port 5001) and frontend dashboard (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running in Production Mode (Single Port)

```bash
# Build client and server
npm run build

# Start production server
npm start
```

Open your browser at `http://localhost:5001`.

---

## 📂 Project Architecture

```
whatapp_schduler/
├── server/                     # Backend Node.js / TypeScript Core
│   ├── src/
│   │   ├── database/           # Prisma & SQLite singleton
│   │   ├── services/
│   │   │   ├── whatsapp.service.ts    # Baileys Multi-Device socket manager
│   │   │   ├── scheduler.service.ts   # Persistent SQLite queue & cron engine
│   │   │   └── media.service.ts       # Video / doc upload & storage pipeline
│   │   ├── controllers/        # REST API endpoints
│   │   └── index.ts            # Express & WebSocket server
│   └── prisma/
│       └── schema.prisma       # SQLite data models
├── client/                     # Frontend React + Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── QRLoginPage.tsx        # WhatsApp Web QR Pairing landing
│   │   │   ├── Sidebar.tsx            # Queue sidebar with filters
│   │   │   ├── ChatView.tsx           # WhatsApp chat canvas & media bubbles
│   │   │   ├── ComposerModal.tsx      # Phone picker, presets & file uploader
│   │   │   ├── CalendarView.tsx       # Timeline calendar view
│   │   │   ├── MediaVaultView.tsx     # Stored videos and documents gallery
│   │   │   └── SettingsView.tsx       # Device status & license attribution
│   │   └── App.tsx                    # State orchestrator & live WebSocket sync
├── LEGAL_DISCLAIMER.md         # Trademark and legal protection terms
├── LICENSE                     # MIT License (Aroon Kumar)
└── package.json
```

---

## 🛡️ Anti-Ban & Safe Usage Practices

WhatsSchedule is crafted for legitimate personal productivity:
- Built-in human emulation delays (1.2-second typing indicator before message dispatch).
- Spaced dispatch intervals for batched messages.
- Intended strictly for personal notifications and scheduling reminders. Do **not** use for automated spamming or bulk unsolicited marketing.

---

## 📄 License & Attribution

Copyright (c) 2026 **Aroon Kumar**. All rights reserved.

Distributed under the **MIT License**. See `LICENSE` for details.
