# AGENTS.md — LLM Operational Context & System Blueprint

> **Purpose**: Provides ultra-compact, high-density context for AI agents (and human contributors) to inspect, operate, and modify WhatsSchedule with minimum token overhead and maximum precision.

---

## 1. System Summary (10-Second Mental Model)

```
[ User Browser / Client (React 19 + Vite 6) ]
                    │
         HTTP / WS  │ (Port 5001)
                    ▼
[ Express Node.js Server (`server/src/index.ts`) ]
  ├── Auth Service (PBKDF2 Master PIN with timing-safe HMAC tokens)
  ├── AI Service (Groq / Gemini / Local Smart Drafter with cache & token limits)
  ├── SQLite Database (`server/prisma/dev.db` via Prisma ORM)
  ├── Scheduler Engine (Croner poller + Atomic DB Claiming + Per-Recipient Mutex)
  └── WhatsApp Engine (`@whiskeysockets/baileys` Multi-Device Socket)
                    │
                    ▼ (End-to-End Encrypted)
           [ WhatsApp Servers ]
```

---

## 2. Directory Layout & Key Entrypoints

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| `client/src/App.tsx` | Main application shell & routing | PIN lock, QR screen, 5-view switcher (`home`, `send-now`, `schedule`, `activity`, `settings`) |
| `client/src/components/` | Reusable React UI components | `BrandLogo.tsx`, `QRLoginPage.tsx`, `Sidebar.tsx`, `ChatView.tsx`, `ComposerModal.tsx`, `SettingsView.tsx` |
| `client/src/hooks/` | Custom state hooks | `useTheme.ts` (light, dark, auto system sync) |
| `client/src/services/api.ts` | Frontend API client | Typed fetch methods with Master PIN token header |
| `server/src/index.ts` | Express server & WebSocket hub | Route registrations, auth middleware, static bundle server |
| `server/src/services/whatsapp.service.ts`| Baileys WhatsApp adapter | Multi-device auth, QR generation, message & media dispatch, receipt hooks |
| `server/src/services/scheduler.service.ts`| Core scheduling queue | Cron poller, atomic DB claiming, per-recipient mutex, error classifier, Send Now |
| `server/src/services/auth.service.ts` | Master PIN Security | PBKDF2 (100k rounds) hashing, timing-safe equality, signed tokens |
| `server/src/services/ai.service.ts` | AI Drafting engine | Concurrency limiter, SHA-256 caching, token budgeting, multi-model failover |
| `server/prisma/schema.prisma` | SQLite data schema | `ScheduledMessage`, `Contact`, `OptOut`, `AppConfig` |

---

## 3. Core Design Tokens (Strict Compliance)

* **Page Background**: Light `#F6F9F7` | Dark `#101815`
* **Card Surface**: Light `#FFFFFF` | Dark `#17211D`
* **Secondary Surface**: Light `#F0F5F2` | Dark `#1E2B25`
* **Primary Emerald**: Light `#087F5B` (Hover: `#06684B`) | Dark `#25C993` (Hover: `#46D9A6`)
* **Primary Text**: Light `#16231F` | Dark `#F2F7F4`
* **Secondary Text**: Light `#5D7168` | Dark `#B2C1B8`
* **Muted Text**: Light `#788980` | Dark `#8A9A91`
* **Borders**: Light `#DCE7E1` | Dark `#2D3D35`
* **QR Surface**: `#FFFFFF` background, `#000000` payload (never tinted or inverted)

---

## 4. Key Engineering Invariants (Do Not Break)

1. **Operating System Synchronization (Concurrency)**:
   - Multiple messages scheduled for the same recipient are serialized sequentially through `acquireRecipientLock(jid)` in `scheduler.service.ts`.
   - Never remove the per-recipient mutex or atomic database claiming (`updateMany where status='pending'`).
2. **Security & Secrets**:
   - Never commit `.env` or session keys.
   - All private files remain strictly in `.gitignore`.
3. **Timezone Preservation**:
   - Dates must always be stored in ISO UTC format (`scheduledAt: new Date(isoString).toISOString()`).
   - Theme changes or page reloads must never modify delivery timestamps.
4. **Provider Transparency**:
   - Never claim official Meta affiliation or ban-proof operation.
   - Use `classifyError` to surface exact, human-readable explanations (Wi-Fi offline, unlinked session, timeout, invalid number).

---

## 5. Development & Testing Commands

```bash
# Run automated test suite
node --test server/test/concurrency.test.js server/test/compliance.test.js

# Build client
cd client && npm run build

# Build server
cd server && npm run build

# Start daemon server (Port 5001)
npm start
```
