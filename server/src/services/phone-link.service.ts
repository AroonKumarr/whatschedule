import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { normalizePhoneNumber, maskPhoneNumber, maskPairingCode } from '../utils/phone.util';
import { whatsAppService } from './whatsapp.service';

export type PhoneLinkStatus = 'idle' | 'code_ready' | 'connected' | 'expired' | 'error';

export interface UserPhoneLinkSession {
  userId: string;
  phone: string;
  status: PhoneLinkStatus;
  code: string | null;
  formattedCode: string | null;
  expiresAt: number | null;
  error: string | null;
  sock: WASocket | null;
  authDir: string;
  expiryTimer: NodeJS.Timeout | null;
  isPairingRequested: boolean;
  isReconnecting: boolean;
}

export class PhoneLinkService {
  private sessions: Map<string, UserPhoneLinkSession> = new Map();
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(__dirname, '../../sessions/phone_link');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getUserAuthDir(userId: string): string {
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.baseDir, sanitizedUserId);
  }

  private wipeDirectory(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (err: any) {
      console.warn(`[PhoneLink] Could not fully remove directory: ${dirPath}`, err?.message);
    }
  }

  public getSessionStatus(userId: string): {
    status: PhoneLinkStatus;
    error: string | null;
    secondsLeft: number;
    code?: string | null;
    formattedCode?: string | null;
  } {
    const session = this.sessions.get(userId);
    if (!session) {
      return { status: 'idle', error: null, secondsLeft: 0 };
    }

    let secondsLeft = 0;
    if (session.expiresAt) {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      secondsLeft = remaining;

      if (remaining === 0 && session.status === 'code_ready') {
        session.status = 'expired';
        console.log(`[PhoneLink] Pairing code expired for user "${session.userId}"`);
        this.cleanupSession(userId, false);
      }
    }

    return {
      status: session.status,
      error: session.error,
      secondsLeft,
      code: session.code,
      formattedCode: session.formattedCode,
    };
  }

  public async cancel(userId: string): Promise<void> {
    console.log(`[PhoneLink] Cancelling phone linking attempt for user "${userId}"`);
    await this.cleanupSession(userId, true);
  }

  private async cleanupSession(userId: string, wipeCreds: boolean = true): Promise<void> {
    const session = this.sessions.get(userId);
    if (!session) return;

    if (session.expiryTimer) {
      clearTimeout(session.expiryTimer);
      session.expiryTimer = null;
    }

    if (session.sock) {
      try {
        session.sock.ev.removeAllListeners('connection.update');
        session.sock.ev.removeAllListeners('creds.update');
        session.sock.end(undefined);
      } catch (e) {}
      session.sock = null;
    }

    if (wipeCreds) {
      this.wipeDirectory(session.authDir);
      session.status = 'idle';
    } else if (session.status !== 'connected' && session.status !== 'expired') {
      session.status = 'idle';
    }
  }

  public async requestPhoneLink(
    userId: string,
    rawPhone: string
  ): Promise<{ code: string; formattedCode: string; expiresInSec: number }> {
    // 1. Normalize and validate phone number (E.164 without plus)
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const masked = maskPhoneNumber(normalizedPhone);
    console.log(`[PhoneLink] Normalized number for user "${userId}": ${masked}`);

    // 2. Check if main session is already connected
    const mainStatus = whatsAppService.getStatus();
    if (mainStatus.state === 'connected') {
      throw new Error('WhatsApp is already connected. Please disconnect the active session first.');
    }

    // 3. Cancel and wipe any previous attempt for this user (guarantees fresh credentials)
    await this.cleanupSession(userId, true);

    const userAuthDir = this.getUserAuthDir(userId);
    this.wipeDirectory(userAuthDir);
    fs.mkdirSync(userAuthDir, { recursive: true });

    // 4. Create new session state
    const session: UserPhoneLinkSession = {
      userId,
      phone: normalizedPhone,
      status: 'idle',
      code: null,
      formattedCode: null,
      expiresAt: null,
      error: null,
      sock: null,
      authDir: userAuthDir,
      expiryTimer: null,
      isPairingRequested: false,
      isReconnecting: false,
    };
    this.sessions.set(userId, session);

    // 5. Initialize isolated Baileys socket for companion phone pairing
    return new Promise<{ code: string; formattedCode: string; expiresInSec: number }>(
      async (resolve, reject) => {
        let isResolved = false;

        const timeoutHandler = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            session.status = 'error';
            session.error = 'Connection timed out while contacting WhatsApp companion servers. Please try again.';
            this.cleanupSession(userId, true);
            reject(new Error(session.error));
          }
        }, 30000);

        try {
          await this.startSocket(userId, session, (err, codeResult) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeoutHandler);
              if (err) {
                reject(err);
              } else if (codeResult) {
                resolve(codeResult);
              }
            }
          });
        } catch (initErr: any) {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutHandler);
            session.status = 'error';
            session.error = initErr?.message || 'Failed to initialize WhatsApp pairing socket';
            this.cleanupSession(userId, true);
            reject(initErr);
          }
        }
      }
    );
  }

  private async startSocket(
    userId: string,
    session: UserPhoneLinkSession,
    onCodeReady?: (err: Error | null, res?: { code: string; formattedCode: string; expiresInSec: number }) => void
  ): Promise<void> {
    console.log(`[PhoneLink] Initializing socket for user "${userId}" at ${session.authDir}`);
    const { state, saveCreds } = await useMultiFileAuthState(session.authDir);
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: 'silent' });

    // Official recognized browser signature is required for Companion Device Registration
    const browser = Browsers.macOS('Chrome');

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: state,
      browser,
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
    });

    session.sock = sock;

    sock.ev.on('creds.update', async () => {
      try {
        fs.mkdirSync(session.authDir, { recursive: true });
        await saveCreds();
      } catch (e: any) {
        // Safe guard against asynchronous credential writes during session disposal
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Only request pairing code once the QR value appears (meaning WS is open & ready)
      if (qr && !session.isPairingRequested && !state.creds.registered) {
        session.isPairingRequested = true;
        try {
          console.log(`[PhoneLink] Requesting companion pairing code for ${maskPhoneNumber(session.phone)}...`);
          const rawCode = await sock.requestPairingCode(session.phone);

          // Format code as ABCD-1234
          const cleanCode = (rawCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          const formatted = cleanCode.length === 8 ? `${cleanCode.slice(0, 4)}-${cleanCode.slice(4)}` : cleanCode;

          session.code = cleanCode;
          session.formattedCode = formatted;
          session.status = 'code_ready';
          // WhatsApp companion pairing codes are valid for ~180 seconds
          session.expiresAt = Date.now() + 180 * 1000;

          console.log(`[PhoneLink] Companion code received: ${maskPairingCode(cleanCode)} (valid for 180s)`);

          // Start 180s countdown timer
          if (session.expiryTimer) clearTimeout(session.expiryTimer);
          session.expiryTimer = setTimeout(() => {
            if (session.status === 'code_ready') {
              session.status = 'expired';
              console.log(`[PhoneLink] Code expired for user "${userId}"`);
              this.cleanupSession(userId, false);
            }
          }, 180 * 1000);

          if (onCodeReady) {
            onCodeReady(null, {
              code: cleanCode,
              formattedCode: formatted,
              expiresInSec: 180,
            });
          }
        } catch (pairErr: any) {
          console.error(`[PhoneLink] Failed to request pairing code:`, pairErr?.message);
          session.status = 'error';
          session.error = pairErr?.message || 'Failed to request pairing code from WhatsApp. Check phone number.';
          if (onCodeReady) {
            onCodeReady(new Error(session.error || 'Failed to request pairing code'));
          }
        }
      }

      // Handle Connection Close (Crucial: WhatsApp closes stream with 515 restartRequired when code is entered on phone)
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const errorMessage = (lastDisconnect?.error as any)?.message || 'Unknown reason';
        console.log(`[PhoneLink] Connection closed. StatusCode: ${statusCode}. Message: ${errorMessage}`);

        // 515 = DisconnectReason.restartRequired (WhatsApp companion pairing completed handshake!)
        if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
          console.log(`[PhoneLink] Received 515 (restartRequired) — Pairing handshake completed on phone! Reconnecting...`);
          session.isReconnecting = true;

          // Reconnect with newly saved credentials to complete login
          setTimeout(() => {
            this.startSocket(userId, session).catch((err) => {
              console.error(`[PhoneLink] Failed to reconnect after pairing:`, err);
            });
          }, 1000);
          return;
        }

        if (statusCode === DisconnectReason.loggedOut) {
          console.log(`[PhoneLink] User logged out or unregistered.`);
          session.status = 'error';
          session.error = 'Pairing rejected or device limit exceeded (max 4 linked devices allowed).';
          this.cleanupSession(userId, true);
          return;
        }

        // Other temporary reconnects
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect && session.status !== 'expired' && session.status !== 'error') {
          console.log(`[PhoneLink] Stream closed (${statusCode}). Attempting auto-reconnect in 2s...`);
          setTimeout(() => {
            if (session.status !== 'expired' && session.status !== 'error') {
              this.startSocket(userId, session).catch(() => {});
            }
          }, 2000);
        }
      }

      // Handle Connection Open (SUCCESS!)
      if (connection === 'open') {
        console.log(`[PhoneLink] Connection OPEN! WhatsApp successfully linked for user "${userId}"!`);
        session.status = 'connected';
        session.error = null;
        if (session.expiryTimer) {
          clearTimeout(session.expiryTimer);
          session.expiryTimer = null;
        }

        // Copy authenticated companion credentials to main sessions/wa_auth directory
        try {
          const mainAuthDir = path.resolve(__dirname, '../../sessions/wa_auth');
          if (!fs.existsSync(mainAuthDir)) {
            fs.mkdirSync(mainAuthDir, { recursive: true });
          }

          const files = fs.readdirSync(session.authDir);
          for (const file of files) {
            fs.copyFileSync(path.join(session.authDir, file), path.join(mainAuthDir, file));
          }
          console.log(`[PhoneLink] Authenticated credentials successfully migrated to primary WhatsApp engine.`);

          // Reinitialize main WhatsApp service to pick up newly paired credentials immediately
          setTimeout(async () => {
            try {
              await whatsAppService.initialize();
            } catch (e) {}
          }, 500);
        } catch (copyErr) {
          console.error(`[PhoneLink] Error syncing credentials to main engine:`, copyErr);
        }
      }
    });
  }
}

export const phoneLinkService = new PhoneLinkService();
