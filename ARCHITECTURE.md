# WhatsSchedule Architecture & Technical Blueprint

This document details the architectural boundaries, database models, synchronization primitives, and provider adapters powering WhatsSchedule.

---

## 1. High-Level Architecture Overview

WhatsSchedule operates as a self-contained, local-first application designed for single-user desktops or private server deployments:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (SPA)                     │
│  React 19 + TypeScript + Vite 6 + Tailwind CSS              │
│  - 5 Primary Views: Home, Send Now, Schedule, Activity, Settings │
│  - Live WebSocket Client (/ws)                              │
│  - Master Security PIN Session Token                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / WebSocket (Port 5001)
┌──────────────────────────────▼──────────────────────────────┐
│                    Server & API Gateway                     │
│  Express 4 + TypeScript Router + Multer File Handler        │
│  - Security Middleware: PBKDF2 Token Authentication         │
│  - Rate Limiter & Input Size Guardrails                     │
└───────────────┬───────────────────────────────┬─────────────┘
                │                               │
┌───────────────▼──────────────┐ ┌──────────────▼─────────────┐
│       Scheduler Engine       │ │       AI Service Layer      │
│  - Cron Poller (Every 5s)    │ │  - Dual Engine Failover    │
│  - Atomic Job Claiming (DB)  │ │  - Concurrency Limiter (8) │
│  - Per-Recipient OS Mutex    │ │  - SHA-256 Memory Cache    │
│  - Human-Like Delay Emulation│ │  - Token Budget Tracker    │
└───────────────┬──────────────┘ └────────────────────────────┘
                │
┌───────────────▼──────────────┐
│  WhatsApp Adapter (Baileys)  │
│  - Multi-Device Socket       │
│  - QR Code Stream Generator  │
│  - Delivery / Read Receipts  │
└───────────────┬──────────────┘
                │
┌───────────────▼──────────────┐
│    SQLite Persistent DB      │
│  - ScheduledMessage Queue    │
│  - Contact Directory         │
│  - Anti-Spam OptOut Registry │
└──────────────────────────────┘
```

---

## 2. Operating System Synchronization & Race Condition Primitives

When multiple messages are scheduled for the same recipient at the exact same instant (or rapid Send Now actions are triggered), simultaneous calls to Baileys cause socket collisions, out-of-order delivery, and WhatsApp spam heuristics triggers.

WhatsSchedule addresses this using two complementary operating system concepts:

### A. Atomic Job Claiming (Database Level)
Before processing any due job, the poller executes an atomic conditional update:
```typescript
const claim = await prisma.scheduledMessage.updateMany({
  where: {
    id: msg.id,
    status: 'pending', // Only succeeds if still pending
  },
  data: {
    status: 'processing',
  },
});

if (claim.count === 0) {
  // Already claimed by another concurrent tick or Send Now action
  continue;
}
```
This guarantees that **exactly one worker thread** can execute a message dispatch.

### B. Per-Recipient Mutual Exclusion (Mutex)
All dispatches to a specific recipient JID (e.g. `15551234567@s.whatsapp.net`) must acquire that recipient's serialization lock:
```typescript
private async acquireRecipientLock<T>(recipientKey: string, fn: () => Promise<T>): Promise<T> {
  const prevLock = this.recipientMutexes.get(recipientKey) || Promise.resolve();

  let releaseLock: () => void;
  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  this.recipientMutexes.set(recipientKey, prevLock.then(() => currentLock));

  try {
    await prevLock;
    const result = await fn();
    // 1.5-second pacing delay to mimic natural typing and avoid spam detection
    await new Promise((r) => setTimeout(r, 1500));
    return result;
  } finally {
    releaseLock!();
    if (this.recipientMutexes.get(recipientKey) === currentLock) {
      this.recipientMutexes.delete(recipientKey);
    }
  }
}
```
**Benefits**:
* Messages to the same person always arrive in strictly scheduled order.
* Eliminates socket pipeline contention.
* Enforces natural pacing without blocking dispatches to other recipients.

---

## 3. Message Lifecycle State Machine

A scheduled message transitions through defined states:

```
[ UI Submission ]
        │
        ▼
   ( pending ) ──► [ User clicks Cancel ] ──► ( cancelled )
        │
        ▼ (Scheduled time reached OR Send Now clicked)
  ( processing )  ◄── Claimed atomically + Recipient Mutex acquired
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
( sent )                       ( failed )
   │                               │
   ▼                               ▼
Delivery Receipts          [ User clicks Retry ]
- single tick (server)             │
- double grey (device)             └─► ( pending )
- double blue (read)
```

---

## 4. Diagnostics & Error Categorization

WhatsSchedule automatically maps raw socket errors into human-readable diagnostics:

| Low-Level Cause | Reason | User-Facing Explanation |
| :--- | :--- | :--- |
| `ENOTFOUND`, `ECONNREFUSED` | No Internet Connection | "Your device is not connected to the internet. Please check your Wi-Fi or network connection, then click Retry." |
| Socket disconnected / unlinked | WhatsApp Session Offline | "WhatsSchedule is not linked to WhatsApp on your phone. Please re-scan the QR code." |
| Socket timeout ($> 30\text{s}$) | Network Timeout | "The WhatsApp network did not respond in time due to slow connectivity. Click Retry to dispatch." |
| `item-not-found` | Invalid Contact Number | "This phone number does not have an active WhatsApp account or the country code is incorrect." |
| Opt-out entry exists | Blocked by Opt-Out | "This contact previously opted out (`STOP` received). Blocked by anti-spam compliance." |
