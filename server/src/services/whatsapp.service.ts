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
import { normalizePhoneNumber } from '../utils/phone.util';

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
  private receiptListeners: (() => void)[] = [];
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

  public subscribeReceipts(listener: () => void) {
    this.receiptListeners.push(listener);
    return () => {
      this.receiptListeners = this.receiptListeners.filter((l) => l !== listener);
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

  private notifyReceipts() {
    this.receiptListeners.forEach((l) => {
      try {
        l();
      } catch (err) {}
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

  public async adoptPairedSession(
    pairedAuthDir: string,
    user: { id: string; name?: string }
  ): Promise<void> {
    console.log('[WhatsAppService] Adopting newly linked phone pairing session...');

    // 1. Terminate any existing socket (e.g. previous QR listener)
    if (this.sock) {
      try {
        this.sock.ev.removeAllListeners('connection.update');
        this.sock.ev.removeAllListeners('creds.update');
        this.sock.end(undefined);
      } catch (e) {}
      this.sock = null;
    }
    this.isInitializing = false;

    // 2. Synchronize credentials into main auth directory
    try {
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }
      const files = fs.readdirSync(pairedAuthDir);
      for (const file of files) {
        fs.copyFileSync(path.join(pairedAuthDir, file), path.join(this.authDir, file));
      }
      console.log('[WhatsAppService] Companion credentials copied to main store.');
    } catch (err: any) {
      console.error('[WhatsAppService] Failed to copy companion credentials:', err?.message);
    }

    // 3. Immediately set state to connected and notify clients
    this.state = 'connected';
    this.qrCodeUrl = null;
    this.qrRaw = null;
    this.user = user;
    this.lastConnectedAt = new Date().toISOString();
    this.notifyStatus();

    // 4. Initialize real main socket with new auth state so it can process outbound scheduled messages
    setTimeout(() => {
      this.initialize().catch((err) => {
        console.error('[WhatsAppService] Post-adoption initialization error:', err?.message);
      });
    }, 200);
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
        printQRInTerminal: false,
        auth: state,
        browser: ['WhatsSchedule', 'Desktop', '1.0.0'],
        syncFullHistory: false, // Privacy protection: Do not download historical chats
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        generateHighQualityLinkPreview: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Listen for WhatsApp connection state
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

      // Listen for Inbound & Outbound Messages to Sync Live Chat Thread & Opt-Outs
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' && type !== 'append') return;

        for (const msg of messages) {
          if (!msg.message) continue;

          const remoteJid = msg.key.remoteJid;
          if (!remoteJid) continue;

          const isFromMe = !!msg.key.fromMe;
          const text = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            msg.message.documentMessage?.caption ||
            msg.message.documentMessage?.title ||
            ''
          ).trim();

          // 1. Record chat message in database for real-time conversation visibility
          try {
            const waId = msg.key.id || `local-${Date.now()}`;
            await (prisma as any).chatMessage.upsert({
              where: { waMessageId: waId },
              create: {
                waMessageId: waId,
                jid: remoteJid,
                sender: isFromMe ? 'outgoing' : 'incoming',
                content: text || (msg.message.imageMessage ? '[Photo]' : msg.message.videoMessage ? '[Video]' : msg.message.documentMessage ? '[Document]' : '[Message]'),
                timestamp: msg.messageTimestamp ? new Date(Number(msg.messageTimestamp) * 1000) : new Date(),
                status: isFromMe ? 'sent' : 'received',
              },
              update: {
                content: text || undefined,
              },
            });

            // Auto-sync contact in phonebook with WhatsApp name
            if (!remoteJid.includes('@g.us') && !remoteJid.includes('broadcast')) {
              const cleanNumber = remoteJid.replace(/[^0-9]/g, '');
              const pushName = msg.pushName || undefined;
              await prisma.contact.upsert({
                where: { id: remoteJid },
                create: {
                  id: remoteJid,
                  number: cleanNumber,
                  name: pushName || cleanNumber,
                  lastContactedAt: new Date(),
                },
                update: {
                  name: pushName || undefined,
                  lastContactedAt: new Date(),
                },
              }).catch(() => {});
            }

            this.notifyReceipts();
          } catch (chatSaveErr) {
            // Non-critical if schema migration pending
          }

          if (isFromMe) continue;
          if (remoteJid.includes('@g.us')) continue; // Ignore groups for opt-out

          const upperText = text.toUpperCase();

          // Check for standard compliance opt-out keywords
          if (['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPTOUT', 'QUIT'].includes(upperText)) {
            console.log(`[Compliance] Received opt-out keyword '${upperText}' from ${remoteJid}`);
            const rawNumber = remoteJid.split('@')[0];

            try {
              await prisma.optOut.upsert({
                where: { recipient: rawNumber },
                create: {
                  recipient: rawNumber,
                  reason: `Inbound keyword: ${upperText}`,
                },
                update: {
                  reason: `Inbound keyword: ${upperText}`,
                },
              });

              await prisma.contact.updateMany({
                where: { number: rawNumber },
                data: { isOptedOut: true, optedOutAt: new Date() },
              });

              // Cancel any future pending schedules for this opted-out recipient
              await prisma.scheduledMessage.updateMany({
                where: {
                  recipient: { contains: rawNumber },
                  status: 'pending',
                },
                data: {
                  status: 'cancelled',
                  error: 'Cancelled automatically: Recipient sent opt-out request (STOP).',
                },
              });

              this.notifyReceipts();
            } catch (err) {
              console.error('[Compliance] Error processing opt-out:', err);
            }
          }
        }
      });
      this.sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
          const waId = update.key.id;
          if (!waId) continue;

          // Baileys update status codes:
          // 3: SERVER_ACK (sent / single tick)
          // 4: DELIVERY_ACK (delivered to recipient phone / double grey tick)
          // 5: READ (opened and read by recipient / double blue tick)
          // 6: PLAYED (audio listened / media played)
          const numStatus = Number(update.update.status);

          let newDeliveryStatus: 'sent' | 'delivered' | 'read' | null = null;
          if (numStatus === 3) newDeliveryStatus = 'sent';
          else if (numStatus === 4) newDeliveryStatus = 'delivered';
          else if (numStatus >= 5) newDeliveryStatus = 'read';

          if (newDeliveryStatus) {
            try {
              const matched = await prisma.scheduledMessage.findFirst({
                where: { waMessageId: waId },
              });

              if (matched) {
                const dataToUpdate: any = { deliveryStatus: newDeliveryStatus };
                if (newDeliveryStatus === 'delivered' && !matched.deliveredAt) {
                  dataToUpdate.deliveredAt = new Date();
                }
                if (newDeliveryStatus === 'read' && !matched.readAt) {
                  dataToUpdate.readAt = new Date();
                }

                await prisma.scheduledMessage.update({
                  where: { id: matched.id },
                  data: dataToUpdate,
                });

                this.notifyReceipts();
              }
            } catch (err) {
              // Ignore receipt lookup errors
            }
          }
        }
      });

      // Sync contacts from initial messaging history (Phonebook & recent chats)
      this.sock.ev.on('messaging-history.set', async ({ contacts, chats }) => {
        console.log(`[WhatsApp] Syncing ${contacts.length} contacts & ${chats.length} chats from WhatsApp...`);

        for (const contact of contacts) {
          if (contact.id && !contact.id.includes('@g.us')) {
            const rawNumber = contact.id.split('@')[0];
            const name = contact.notify || contact.verifiedName || contact.name || rawNumber;
            try {
              await prisma.contact.upsert({
                where: { id: contact.id },
                create: { id: contact.id, number: rawNumber, name },
                update: { name },
              });
            } catch (err) {}
          }
        }

        for (const chat of chats) {
          if (chat.id && !chat.id.includes('@g.us')) {
            const rawNumber = chat.id.split('@')[0];
            const name = chat.name || rawNumber;
            try {
              await prisma.contact.upsert({
                where: { id: chat.id },
                create: { id: chat.id, number: rawNumber, name },
                update: { name: chat.name || undefined },
              });
            } catch (err) {}
          }
        }

        this.notifyReceipts();
      });

      // Sync and store contacts into SQLite automatically
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
            } catch (err) {}
          }
        }
      });

      // Sync contacts from chat list as well
      this.sock.ev.on('chats.upsert', async (chats) => {
        for (const chat of chats) {
          if (chat.id && !chat.id.includes('@g.us')) {
            const rawNumber = chat.id.split('@')[0];
            const name = chat.name || rawNumber;
            try {
              await prisma.contact.upsert({
                where: { id: chat.id },
                create: {
                  id: chat.id,
                  number: rawNumber,
                  name: name,
                },
                update: {
                  name: name,
                },
              });
            } catch (err) {}
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

  /**
   * Anti-ban delay with natural jitter: Simulates human typing behavior
   */
  private async applyHumanEmulation(jid: string, isMedia: boolean = false): Promise<void> {
    if (!this.sock) return;

    // Random delay between 1400ms and 3200ms
    const delay = Math.floor(Math.random() * (3200 - 1400 + 1)) + 1400;

    try {
      await this.sock.sendPresenceUpdate(isMedia ? 'recording' : 'composing', jid);
      await new Promise((resolve) => setTimeout(resolve, delay));
      await this.sock.sendPresenceUpdate('paused', jid);
    } catch (e) {
      // Ignore presence update error if contact not yet synced
    }
  }

  public async sendTextMessage(to: string, content: string): Promise<{ keyId?: string }> {
    if (!this.sock || this.state !== 'connected') {
      throw new Error('WhatsApp is not connected. Please scan the QR code first.');
    }

    const jid = this.formatJid(to);
    const rawNumber = to.replace(/[^0-9]/g, '');

    // Opt-out Compliance Check: Never dispatch to unsubscribed recipients
    const optOut = await prisma.optOut.findUnique({ where: { recipient: rawNumber } });
    if (optOut) {
      throw new Error(`Dispatch blocked: Recipient ${rawNumber} has opted out of communications (${optOut.reason}).`);
    }

    // Apply human typing simulation (Anti-ban safety)
    await this.applyHumanEmulation(jid, false);

    const result = await this.sock.sendMessage(jid, { text: content });

    // Store outgoing sent message in chat message history
    try {
      await (prisma as any).chatMessage.create({
        data: {
          waMessageId: result?.key?.id,
          jid,
          sender: 'outgoing',
          content,
          timestamp: new Date(),
          status: 'sent',
        },
      });
      this.notifyReceipts();
    } catch (_) {}

    return { keyId: result?.key?.id || undefined };
  }

  public async sendMediaMessage(
    to: string,
    filePath: string,
    mimeType: string,
    caption?: string,
    fileName?: string
  ): Promise<{ keyId?: string }> {
    if (!this.sock || this.state !== 'connected') {
      throw new Error('WhatsApp is not connected. Please scan the QR code first.');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Media file not found at: ${filePath}`);
    }

    const jid = this.formatJid(to);
    const rawNumber = to.replace(/[^0-9]/g, '');

    // Opt-out Compliance Check
    const optOut = await prisma.optOut.findUnique({ where: { recipient: rawNumber } });
    if (optOut) {
      throw new Error(`Dispatch blocked: Recipient ${rawNumber} has opted out of communications.`);
    }
    const fileBuffer = fs.readFileSync(filePath);
    const isAudio = mimeType.startsWith('audio/');

    // Anti-ban simulation
    await this.applyHumanEmulation(jid, isAudio);

    let result;
    if (mimeType.startsWith('image/')) {
      result = await this.sock.sendMessage(jid, {
        image: fileBuffer,
        caption: caption || undefined,
        mimetype: mimeType,
      });
    } else if (mimeType.startsWith('video/') || mimeType === 'video/quicktime') {
      result = await this.sock.sendMessage(jid, {
        video: fileBuffer,
        caption: caption || undefined,
        mimetype: mimeType,
      });
    } else if (isAudio) {
      result = await this.sock.sendMessage(jid, {
        audio: fileBuffer,
        mimetype: mimeType,
        ptt: false, // voice memo
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

    // Store outgoing media message in chat history
    try {
      await (prisma as any).chatMessage.create({
        data: {
          waMessageId: result?.key?.id,
          jid,
          sender: 'outgoing',
          content: caption || (fileName ? `[${fileName}]` : '[Media Attachment]'),
          timestamp: new Date(),
          status: 'sent',
          mediaUrl: filePath ? `/uploads/${path.basename(filePath)}` : null,
          mediaType: mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : 'document',
          mediaFileName: fileName || path.basename(filePath),
        },
      });
      this.notifyReceipts();
    } catch (_) {}

    return { keyId: result?.key?.id || undefined };
  }

  public async requestPairingCode(phoneNumber: string, countryCode: string = '92'): Promise<string> {
    const cleaned = normalizePhoneNumber(phoneNumber, countryCode);

    if (this.state === 'connected') {
      throw new Error('WhatsApp is already connected. Please disconnect first if you wish to pair a new device.');
    }

    if (!this.sock) {
      await this.initialize();
      let attempts = 0;
      while (!this.sock && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        attempts++;
      }
    }

    if (!this.sock) {
      throw new Error('WhatsApp engine is initializing. Please try again in a few moments.');
    }

    try {
      const code = await this.sock.requestPairingCode(cleaned);
      return code;
    } catch (err: any) {
      console.error('[WhatsApp] Pairing code generation failed:', err);
      throw new Error(err.message || 'Failed to request pairing code from WhatsApp. Please verify the phone number.');
    }
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

    await this.initialize();
  }
}

export const whatsAppService = new WhatsAppService();
