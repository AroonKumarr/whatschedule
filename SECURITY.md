# Security Policy & Cryptographic Model

WhatsSchedule is designed for local privacy, zero cloud tracking, and strict session isolation.

---

## 1. Threat Model & Mitigations

| Threat | Mitigation Architecture |
| :--- | :--- |
| **Unauthorized User on Shared Machine** | **Master Security PIN with PBKDF2**: Key derivation uses 100,000 iterations of SHA-512 with a cryptographically secure 16-byte salt (`crypto.randomBytes(16)`). Comparisons utilize timing-safe equality (`crypto.timingSafeEqual`) to prevent timing side-channel attacks. |
| **Cross-Profile Session Hijacking** | Access tokens are stored solely in **`sessionStorage`**, preventing token leakage across browser profiles or tabs opened in other profiles. |
| **WhatsApp Spam / Account Ban** | **Human-Like Emulation & Recipient Mutex**: Messages to the same contact are serialized with a 1.5-second pacing delay. Typing simulation (`composing` state) is broadcast prior to dispatch. |
| **Unsolicited Communications (Anti-Spam)** | **Opt-Out Engine**: Inbound messages with `STOP`, `UNSUBSCRIBE`, or `CANCEL` automatically flag the contact in the SQLite `OptOut` table and abort any future pending jobs. |
| **API Denial of Service / Token Exhaustion** | **Token Bucket Rate Limiting**: AI drafting requests are capped at 15 calls/minute per user with a hard global concurrency limit of 8 concurrent requests. |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability in WhatsSchedule, please report it privately:

1. **Email**: Open a security advisory on the GitHub repository at `https://github.com/AroonKumarr/whatschedule/security/advisories/new` or contact the maintainer directly.
2. **Timeline**: You will receive an initial response within 24 hours acknowledging receipt.
3. **Disclosure Policy**: Please allow up to 7 days for a patch to be released before public disclosure.

---

## 3. Secret Management & `.env` Best Practices

* Never push your `.env` file to any public repository.
* When deploying to Docker, supply environment variables via Docker secrets or `--env-file`.
* If you suspect an API key has been exposed, rotate it immediately in the respective provider console (Groq / Google AI Studio / Meta).
