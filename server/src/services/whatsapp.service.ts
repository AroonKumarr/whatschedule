import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  proto,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { prisma } from '../database/prisma';

export interface WhatsAppStatus {
  state: 'idle' | 'connecting' | 'qr_ready' | 'connected' | 'error';
  qrCodeUrl: string | null;
  qrRaw: string | null;
  user: {
    id: string;
    name?: string;
  } | null;
  lastConnectedAt: string | null;
}

class WhatsAppService {
  private sock: WASocket | null = null;
  private statusListeners: ((status: WhatsAppStatus) => void)[] = [];
  private authDir: string;
  private qrRaw: string | null = null;
  private qrCodeUrl: string | null = null;
  private state: 'idle' | 'connecting' | 'qr_ready' | 'connected' | 'error' = 'idle';
  private user: { id: string; name?: string } | null = null;
  private lastConnectedAt: string | null = null;
  private isInitializing: boolean = false;

  constructor() {
    this.authDir = path.resolve(__dirname, '../../sessions/wa_auth');
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  public subscribeStatus(listener: (status: WhatsAppStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  public getStatus(): WhatsAppStatus {
    return {
      state: this.state,
      qrCodeUrl: this.qrCodeUrl,
      qrRaw: this.qrRaw,
      user: this.user,
      lastConnectedAt: this.lastConnectedAt,
    };
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;
    this.state = 'connecting';
    this.notifyStatus();

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      const { version } = await fetchLatestBaileysVersion();

      const logger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        browser: ['WhatsSchedule', 'Desktop', '1.0.0'],
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrRaw = qr;
          try {
            this.qrCodeUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              scale: 6,
              color: {
                dark: '#111b21',
                light: '#ffffff',
              },
            });
            this.state = 'qr_ready';
            this.notifyStatus();
          } catch (e) {
            console.error('Failed to generate QR data URL:', e);
          }
        }

        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as any)?.output?.statusCode !==
            DisconnectReason.loggedOut;

          this.state = 'idle';
          this.user = null;
          this.qrCodeUrl = null;
          this.qrRaw = null;
          this.notifyStatus();

          console.log(
            `Connection closed. Reason: ${
              (lastDisconnect?.error as any)?.message || 'Unknown'
            }. Reconnect: ${shouldReconnect}`
          );

          if (shouldReconnect) {
            this.isInitializing = false;
            setTimeout(() => this.initialize(), 4000);
          } else {
            this.isInitializing = false;
          }
        } else if (connection === 'open') {
          this.state = 'connected';
          this.qrRaw = null;
          this.qrCodeUrl = null;
          this.lastConnectedAt = new Date().toISOString();

          const userJid = this.sock?.user?.id;
          const userName = this.sock?.user?.name || 'WhatsApp User';

          this.user = userJid
            ? {
                id: userJid.split(':')[0] + '@s.whatsapp.net',
                name: userName,
              }
            : null;

          console.log(`WhatsApp Multi-Device Connected as ${userName} (${this.user?.id})`);
          this.notifyStatus();
        }
      });

      // Sync and store contacts
      this.sock.ev.on('contacts.upsert', async (contacts) => {
        for (const contact of contacts) {
          if (contact.id && !contact.id.includes('@g.us')) {
            const rawNumber = contact.id.split('@')[0];
            const name = contact.notify || contact.verifiedName || contact.name || rawNumber;
            try {
              await prisma.contact.upsert({
                where: { id: contact.id },
                create: {
                  id: contact.id,
                  number: rawNumber,
                  name: name,
                },
                update: {
                  name: name,
                },
              });
            } catch (err) {
              // Ignore contact upsert lock error
            }
          }
        }
      });
    } catch (err) {
      console.error('Error during WhatsApp socket initialization:', err);
      this.state = 'error';
      this.notifyStatus();
      this.isInitializing = false;
    }
  }

  public formatJid(recipient: string): string {
    const cleaned = recipient.replace(/[^0-9]/g, '');
    if (recipient.endsWith('@s.whatsapp.net') || recipient.endsWith('@g.us')) {
      return recipient;
    }
    return `${cleaned}@s.whatsapp.net`;
  }

  public async sendTextMessage(to: string, content: string): Promise<any> {
    if (!this.sock || this.state !== 'connected') {
      throw new Error('WhatsApp is not connected. Please scan the QR code first.');
    }

    const jid = this.formatJid(to);

    // Human typing emulation (1.2 second typing indicator)
    try {
      await this.sock.sendPresenceUpdate('composing', jid);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch (e) {
      // Ignore presence update error if JID is not yet synced
    }

    const result = await this.sock.sendMessage(jid, { text: content });

    try {
      await this.sock.sendPresenceUpdate('paused', jid);
    } catch (e) {}

    return result;
  }

  public async sendMediaMessage(
    to: string,
    filePath: string,
    mimeType: string,
    caption?: string,
    fileName?: string
  ): Promise<any> {
    if (!this.sock || this.state !== 'connected') {
      throw new Error('WhatsApp is not connected. Please scan the QR code first.');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Media file not found at: ${filePath}`);
    }

    const jid = this.formatJid(to);
    const fileBuffer = fs.readFileSync(filePath);

    try {
      await this.sock.sendPresenceUpdate('composing', jid);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {}

    let result;
    if (mimeType.startsWith('image/')) {
      result = await this.sock.sendMessage(jid, {
        image: fileBuffer,
        caption: caption || undefined,
        mimetype: mimeType,
      });
    } else if (mimeType.startsWith('video/')) {
      result = await this.sock.sendMessage(jid, {
        video: fileBuffer,
        caption: caption || undefined,
        mimetype: mimeType,
      });
    } else if (mimeType.startsWith('audio/')) {
      result = await this.sock.sendMessage(jid, {
        audio: fileBuffer,
        mimetype: mimeType,
        ptt: false, // voice message
      });
    } else {
      // Document (PDF, docx, etc.)
      result = await this.sock.sendMessage(jid, {
        document: fileBuffer,
        mimetype: mimeType,
        fileName: fileName || path.basename(filePath),
        caption: caption || undefined,
      });
    }

    try {
      await this.sock.sendPresenceUpdate('paused', jid);
    } catch (e) {}

    return result;
  }

  public async logout(): Promise<void> {
    try {
      if (this.sock) {
        await this.sock.logout();
      }
    } catch (e) {}

    try {
      if (fs.existsSync(this.authDir)) {
        fs.rmSync(this.authDir, { recursive: true, force: true });
      }
    } catch (e) {}

    this.sock = null;
    this.state = 'idle';
    this.user = null;
    this.qrCodeUrl = null;
    this.qrRaw = null;
    this.isInitializing = false;
    this.notifyStatus();

    // Restart socket to generate new QR
    await this.initialize();
  }
}

export const whatsAppService = new WhatsAppService();
