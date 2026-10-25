# Changelog

All notable changes to **WhatsSchedule** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-26

### Added
- **Core Multi-Device Engine**: Pure WebSocket companion client using Baileys with sub-60MB memory footprint.
- **Embedded SQLite Persistent Queue**: Zero-config Prisma ORM backing that survives machine reboots.
- **Original Brand Identity**: Custom emerald curved chat-dial logo eliminating Meta trademark infringement risks.
- **Master Security PIN Protection**: Salted PBKDF2 (100,000 iterations) authentication preventing multi-profile browser leaks.
- **Auditable Recipient Consent & Opt-Outs**: Automatic detection of `STOP` / `UNSUBSCRIBE` keywords to block unsanctioned dispatches.
- **Production AI Drafting Assistant**: Per-user rate limiting (15 drafts/min), global concurrency caps, 250-token output limits, and SHA-256 prompt caching.
- **Live Receipt Tracking**: Real-time single tick (sent), double grey tick (delivered), and double blue tick (read) WebSocket callbacks.
- **Emergency Queue Pause Switch**: Instant 1-click circuit breaker to halt all outgoing message queues.
- **Comprehensive Media Pipeline**: Native support for iPhone HEIC, QuickTime MOV, Apple M4A Voice Memos, and documents up to 100MB.
- **1-Click Launchers**: Double-clickable `start.sh` for macOS/Linux and `start.bat` for Windows.
- **Developer Suite**: Docker Compose, multi-stage Dockerfile, GitHub Actions CI, and comprehensive architecture manual.
