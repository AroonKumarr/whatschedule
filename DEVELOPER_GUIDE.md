# WhatsSchedule Developer Guide & Technical Manual

> **Engineering Manual & Contributor Deep-Dive**  
> *Architected and maintained by **Aroon Kumar**.*

Welcome to the engineering guide for **WhatsSchedule**. This document provides an architectural walkthrough, explains our tech stack decisions, and shows you how to contribute new features like AI assistants and multi-platform scheduling.

---

## 🏗️ 1. Architecture & Tech Stack Evaluation

A common question from new contributors is: *“Why this specific tech stack?”*

Here is the technical breakdown comparing our stack against alternative ecosystems:

| Layer | Our Stack | Alternative Considered | Why We Chose Our Stack |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + TypeScript** | Plain HTML/JS or Vue | Strict type safety, component reusability, and instant state reactivity for WhatsApp chats. |
| **Build Tool** | **Vite 6** | Next.js / Webpack | Next.js introduces heavy SSR node runtime overhead and slower hydration. Vite builds the entire client in **< 900ms**, giving instant HMR and 91kB gzipped bundle sizes. |
| **Styling** | **Tailwind CSS** | CSS Modules / SCSS | Rapid pixel-perfect replication of WhatsApp Web's dark palette (`#0c1317`, `#111b21`, `#00a884`, `#005c4b`) with zero runtime CSS-in-JS overhead. |
| **Backend Core** | **Node.js + TypeScript + Express** | Python (FastAPI) or Go | The WhatsApp multi-device cryptographic protocol ecosystem (`@whiskeysockets/baileys`) is natively developed and most reliably maintained in TypeScript/Node.js. |
| **Database** | **Prisma ORM + SQLite** | MongoDB / PostgreSQL | SQLite is embedded, zero-configuration, and file-based (`dev.db`). Contributors and users never need to install external Docker containers or database daemons. |
| **Protocol Engine** | **Baileys Multi-Device** | Puppeteer / Selenium | Puppeteer requires a 500MB headless Chromium instance. Baileys speaks WhatsApp's binary WebSocket protocol directly, consuming **under 60MB RAM**. |

---

## ⚡ 2. How the WhatsApp Multi-Device Protocol Works

WhatsApp uses the **Noise Protocol Framework** with Curve25519 cryptography:

```
[ Primary Phone ] (WhatsApp Mobile App)
        │
        ▼ (Generates Linked Device QR Code)
[ WhatsSchedule Daemon ] (Companion Device)
        │
        ▼ (Maintains Independent Encrypted WebSocket)
[ WhatsApp Multi-Device Cloud Servers ]
        │
        ▼ (Delivers Message at Scheduled Timestamp)
[ Recipient's Phone ]
```

1. **Pairing**: Scanning the QR code registers WhatsSchedule as an authorized companion device.
2. **Session Persistence**: Auth tokens and encryption keys are stored in `sessions/wa_auth/`.
3. **Primary Phone Independence**: Once paired, WhatsApp allows companion devices to operate independently for up to 14 days without requiring the primary phone to be online or unlocked.

---

## 🔄 3. Persistent SQLite Scheduling Engine

Located in [`server/src/services/scheduler.service.ts`](file:///Users/aroonkumar/Developer/whatapp_schduler/server/src/services/scheduler.service.ts):

* **Cron Loop**: Evaluates pending dispatches every 5 seconds.
* **Controlled Batching**: Queries `ScheduledMessage` where `status == 'pending'` and `scheduledAt <= now`, processing in small batches of 5 to eliminate flood spikes.
* **Receipt Tracking**: On dispatch, captures WhatsApp's protocol `key.id` and listens for `messages.update`:
  - `status == 3`: Server Ack (Single Tick ✓)
  - `status == 4`: Delivery Ack (Double Grey Tick ✓✓)
  - `status >= 5`: Read / Played (Double Blue Tick ✓✓)

---

## 🤖 4. How to Extend: Adding AI Assistants & Auto-Reply

WhatsSchedule is designed modularly. If you want to contribute an **AI Assistant** feature:

1. Create a service file in `server/src/services/ai.service.ts`:
   ```typescript
   export async function generateSmartFollowUp(prompt: string, context: string): Promise<string> {
     // Connect with Google Gemini SDK or OpenAI API
     // e.g. "Draft a professional follow-up message to HR about salary update"
     return draftedMessage;
   }
   ```
2. Add an endpoint in `server/src/controllers/api.controller.ts`:
   ```typescript
   app.post('/api/ai/draft', ApiController.generateDraft);
   ```
3. Hook the suggestion button into `client/src/components/ComposerModal.tsx`.

---

## 🌐 5. How to Extend: Adding LinkedIn & Multi-Platform Scheduling

To add other scheduling channels (e.g., LinkedIn posts or Twitter/X):

1. Update `server/prisma/schema.prisma`:
   ```prisma
   enum Platform {
     WHATSAPP
     LINKEDIN
     TWITTER
   }
   ```
2. Create platform dispatchers in `server/src/services/linkedin.service.ts` using LinkedIn's REST API for UGC posts.
3. The existing SQLite scheduler queue handles execution timing universally.

---

## 🛠️ 6. Local Development Workflow

```bash
# 1. Clone repository
git clone https://github.com/AroonKumarr/whatschedule.git
cd whatschedule

# 2. Install all workspaces
npm run install:all

# 3. Synchronize database schema
cd server && npx prisma db push && cd ..

# 4. Start concurrent development servers
npm run dev
```

* Backend runs with `ts-node-dev` on `http://localhost:5001`.
* Frontend runs with Vite HMR on `http://localhost:5173`.
* API proxy routes `/api`, `/uploads`, and `/ws` automatically to backend.

---

## 📋 7. Good First Issues for New Contributors

Looking for a great way to contribute? Consider these roadmap items:

- [ ] **Recurring Schedules**: Add weekly/monthly recurring rules (e.g., *“Every 1st of the month at 9:00 AM”*).
- [ ] **CSV Contact Importer**: Allow importing contact lists via `.csv` or `.vcf` file.
- [ ] **Desktop Tray Icon**: Package using Tauri or Electron for native macOS menu-bar and Windows system tray execution.
- [ ] **Sound Effects**: Play WhatsApp's authentic outgoing message chime upon successful dispatch.

---

## 📄 License & Attribution

Copyright (c) 2026 **Aroon Kumar**. All rights reserved. Distributed under the MIT License.
