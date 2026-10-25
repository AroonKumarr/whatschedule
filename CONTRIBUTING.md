# Contributing to WhatsSchedule

First off, thank you for considering contributing to **WhatsSchedule**! It's people like you that make open source such an amazing community.

WhatsSchedule was created by **Aroon Kumar** as an open-source productivity automation engine for WhatsApp scheduling and future AI assistants.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (or **pnpm**)
- A smartphone with WhatsApp installed (for scanning the pairing QR code)

### 2. Fork and Clone
```bash
git clone https://github.com/AroonKumarr/whatschedule.git
cd whatschedule
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Run Development Servers
```bash
# Runs backend on port 5001 and frontend with hot-reload on port 5173
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧭 Project Architecture

- **`server/`**:
  - `src/services/whatsapp.service.ts`: Baileys Multi-Device WebSocket connection manager.
  - `src/services/scheduler.service.ts`: SQLite persistent queue running background execution ticks.
  - `src/services/media.service.ts`: File upload and storage handling.
  - `prisma/schema.prisma`: SQLite database schema.
- **`client/`**:
  - `src/components/QRLoginPage.tsx`: WhatsApp Web initial pairing experience.
  - `src/components/Sidebar.tsx`: Queue list and filtering.
  - `src/components/ChatView.tsx`: Authentic WhatsApp message rendering with playable videos/docs.
  - `src/components/ComposerModal.tsx`: Phone picker with country codes, date-time presets, and file uploader.
  - `src/components/CalendarView.tsx`: Schedule timeline.
  - `src/components/MediaVaultView.tsx`: Media gallery.

---

## 💡 Code of Conduct & Guidelines

1. **Keep it Fast**: Optimize SQLite queries and keep client bundle sizes minimal.
2. **Preserve Privacy**: Never transmit user authentication sessions or contacts off the local device.
3. **Safe Automation**: Always maintain human-emulated typing presence and delays to protect user accounts.
4. **Clean Commits**: Format commits with clear prefixes (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## 📄 License & Intellectual Property

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE), with original authorship and ownership attributed to **Aroon Kumar**.
