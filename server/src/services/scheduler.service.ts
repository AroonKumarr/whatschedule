import { Cron } from 'croner';
import { prisma } from '../database/prisma';
import { whatsAppService } from './whatsapp.service';
import fs from 'fs';

export interface CreateScheduleInput {
  recipient: string;
  recipientName?: string;
  content?: string;
  type?: 'text' | 'image' | 'video' | 'document' | 'audio';
  mediaPath?: string;
  mediaMimeType?: string;
  mediaFileName?: string;
  scheduledAt: Date;
}

/**
 * Diagnostic Error Classifier
 * Translates low-level network, socket, and Baileys errors into clear, actionable advice.
 */
export function classifyError(rawError: any): { reason: string; userAdvice: string; isRetryable: boolean } {
  const msg = (rawError?.message || String(rawError || '')).toLowerCase();

  // 1. Local Network / Wi-Fi Disconnected
  if (
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('enetunreach') ||
    msg.includes('network') ||
    msg.includes('offline')
  ) {
    return {
      reason: 'No Internet Connection',
      userAdvice: 'Your device is not connected to the internet. Please check your Wi-Fi or network connection, then click Retry.',
      isRetryable: true,
    };
  }

  // 2. WhatsApp Session Unlinked / Logged Out
  if (
    msg.includes('not connected') ||
    msg.includes('logged out') ||
    msg.includes('unauthorized') ||
    msg.includes('session closed') ||
    msg.includes('connection closed') ||
    msg.includes('qr')
  ) {
    return {
      reason: 'WhatsApp Session Offline',
      userAdvice: 'WhatsSchedule is not linked to WhatsApp on your phone. Please re-scan the QR code on the connection screen.',
      isRetryable: true,
    };
  }

  // 3. Connection Timeout / Slow Network
  if (msg.includes('timed out') || msg.includes('timeout') || msg.includes('etimedout')) {
    return {
      reason: 'Network Timeout',
      userAdvice: 'The WhatsApp network did not respond in time due to slow connectivity. Your message is held safely—click Retry to dispatch.',
      isRetryable: true,
    };
  }

  // 4. Invalid or Unregistered WhatsApp Phone Number
  if (
    msg.includes('not registered') ||
    msg.includes('item-not-found') ||
    msg.includes('jid-malformed') ||
    msg.includes('invalid')
  ) {
    return {
      reason: 'Invalid Contact Number',
      userAdvice: 'This phone number does not have an active WhatsApp account or the country code is incorrect. Check the number and reschedule.',
      isRetryable: false,
    };
  }

  // 5. Compliance & Opt-Out
  if (msg.includes('opted out') || msg.includes('compliance')) {
    return {
      reason: 'Blocked by Recipient Opt-Out',
      userAdvice: 'This contact previously requested to stop receiving automated messages. Out of respect for anti-spam laws, dispatches are blocked.',
      isRetryable: false,
    };
  }

  // 6. Media File Missing or Corrupted
  if (msg.includes('file not found') || msg.includes('enoent') || msg.includes('media')) {
    return {
      reason: 'Attachment Not Found',
      userAdvice: 'The attached video or file could not be read from disk. Please re-attach the file and reschedule.',
      isRetryable: false,
    };
  }

  // Default Fallback
  return {
    reason: 'Dispatch Interrupted',
    userAdvice: rawError?.message || 'An unexpected error occurred while communicating with WhatsApp. Click Retry to send again.',
    isRetryable: true,
  };
}

class SchedulerService {
  private cronJob: Cron | null = null;
  private isProcessing: boolean = false;
  private isPaused: boolean = false;
  private listeners: (() => void)[] = [];

  // OS Concurrency Concept: Recipient Mutex Map
  // Prevents race conditions when multiple messages are queued for the same recipient simultaneously.
  private recipientMutexes: Map<string, Promise<void>> = new Map();

  constructor() {
    this.startScheduler();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.notifyUpdate();
    console.log(`[Scheduler] Queue ${paused ? 'PAUSED' : 'RESUMED'}`);
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public onQueueUpdate(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyUpdate() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error notifying queue listener:', err);
      }
    });
  }

  public startScheduler() {
    // Polling every 5 seconds for due dispatches with unref to avoid blocking test exits
    this.cronJob = new Cron('*/5 * * * * *', { unref: true }, async () => {
      await this.processPendingQueue();
    });
    console.log('Scheduler Service started (polling every 5s for due jobs with atomic claiming & recipient mutex)');
  }

  public stopScheduler() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  /**
   * Acquire synchronization lock for a given recipient (OS Mutex).
   * Ensures messages to the same person are dispatched sequentially without socket collisions.
   */
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
      // Enforce a calm 1.5s human-like spacing delay between sequential messages to the same person
      await new Promise((r) => setTimeout(r, 1500));
      return result;
    } finally {
      releaseLock!();
      if (this.recipientMutexes.get(recipientKey) === currentLock) {
        this.recipientMutexes.delete(recipientKey);
      }
    }
  }

  /**
   * Processes the queue with atomic database-level claiming and recipient mutex locks.
   */
  public async processPendingQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused) return;

    // Check if WhatsApp is connected before attempting dispatch
    const status = whatsAppService.getStatus();
    if (status.state !== 'connected') {
      return;
    }

    this.isProcessing = true;

    try {
      const now = new Date();

      // Find due messages ordered by time
      const dueMessages = await prisma.scheduledMessage.findMany({
        where: {
          status: 'pending',
          scheduledAt: {
            lte: now,
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        take: 10,
      });

      for (const msg of dueMessages) {
        // OS Concept: Atomic Job Claiming via DB condition
        // Prevents duplicate processing by multiple workers or rapid cron ticks
        const claim = await prisma.scheduledMessage.updateMany({
          where: {
            id: msg.id,
            status: 'pending',
          },
          data: {
            status: 'processing',
          },
        });

        if (claim.count === 0) {
          // Already claimed by another pass, skip safely
          continue;
        }

        this.notifyUpdate();

        // Check recipient opt-out suppression
        const rawNumber = msg.recipient.replace(/[^0-9]/g, '');
        const isOptedOut = await prisma.optOut.findUnique({ where: { recipient: rawNumber } });

        if (isOptedOut) {
          await prisma.scheduledMessage.update({
            where: { id: msg.id },
            data: {
              status: 'cancelled',
              error: `Blocked by Compliance: Recipient has opted out (${isOptedOut.reason}).`,
            },
          });
          this.notifyUpdate();
          continue;
        }

        // Dispatch under Per-Recipient Mutex to eliminate race conditions
        const recipientLockKey = whatsAppService.formatJid(msg.recipient);
        await this.acquireRecipientLock(recipientLockKey, async () => {
          await this.executeDispatch(msg.id);
        });
      }
    } catch (err) {
      console.error('Error processing scheduler queue:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Performs the actual message dispatch with full error classification.
   */
  private async executeDispatch(id: string): Promise<boolean> {
    const msg = await prisma.scheduledMessage.findUnique({ where: { id } });
    if (!msg) return false;

    try {
      let dispatchResult: { keyId?: string };

      if (msg.type === 'text' || !msg.mediaPath) {
        dispatchResult = await whatsAppService.sendTextMessage(msg.recipient, msg.content || '');
      } else {
        dispatchResult = await whatsAppService.sendMediaMessage(
          msg.recipient,
          msg.mediaPath,
          msg.mediaMimeType || 'application/octet-stream',
          msg.content || undefined,
          msg.mediaFileName || undefined
        );
      }

      // Mark as sent
      await prisma.scheduledMessage.update({
        where: { id: msg.id },
        data: {
          status: 'sent',
          deliveryStatus: 'sent',
          waMessageId: dispatchResult?.keyId || null,
          sentAt: new Date(),
          error: null,
        },
      });

      // Update contact record
      const rawNumber = msg.recipient.replace(/[^0-9]/g, '');
      const jid = whatsAppService.formatJid(msg.recipient);
      await prisma.contact.upsert({
        where: { id: jid },
        create: {
          id: jid,
          number: rawNumber,
          name: msg.recipientName || rawNumber,
          lastContactedAt: new Date(),
        },
        update: {
          name: msg.recipientName || undefined,
          lastContactedAt: new Date(),
        },
      });

      console.log(`[Scheduler] Successfully dispatched message ${msg.id} to ${msg.recipient}`);
      this.notifyUpdate();
      return true;
    } catch (err: any) {
      console.error(`[Scheduler] Dispatch failed for ${msg.id}:`, err);
      const diagnostic = classifyError(err);

      await prisma.scheduledMessage.update({
        where: { id: msg.id },
        data: {
          status: 'failed',
          error: `${diagnostic.reason}: ${diagnostic.userAdvice}`,
        },
      });

      this.notifyUpdate();
      return false;
    }
  }

  /**
   * Immediate 'Send Now' Action:
   * Bypasses future schedule timer, claims job atomically, and dispatches immediately.
   */
  public async sendNow(id: string): Promise<{ success: boolean; message: string; record?: any }> {
    const item = await prisma.scheduledMessage.findUnique({ where: { id } });
    if (!item) {
      return { success: false, message: 'Message not found' };
    }

    if (item.status === 'sent') {
      return { success: false, message: 'Message has already been sent' };
    }

    if (item.status === 'processing') {
      return { success: false, message: 'Message is currently being dispatched' };
    }

    // Atomically claim the message
    const claim = await prisma.scheduledMessage.updateMany({
      where: {
        id,
        status: { in: ['pending', 'failed', 'cancelled'] },
      },
      data: {
        status: 'processing',
        error: null,
      },
    });

    if (claim.count === 0) {
      return { success: false, message: 'Message was already claimed by another process' };
    }

    this.notifyUpdate();

    // Acquire recipient mutex for race condition safety
    const recipientLockKey = whatsAppService.formatJid(item.recipient);
    const sent = await this.acquireRecipientLock(recipientLockKey, async () => {
      return await this.executeDispatch(id);
    });

    const updated = await prisma.scheduledMessage.findUnique({ where: { id } });
    if (sent) {
      return { success: true, message: 'Message sent successfully', record: updated };
    } else {
      return {
        success: false,
        message: updated?.error || 'Dispatch failed',
        record: updated,
      };
    }
  }

  public async create(input: CreateScheduleInput) {
    const record = await prisma.scheduledMessage.create({
      data: {
        recipient: input.recipient,
        recipientName: input.recipientName,
        content: input.content,
        type: input.type || 'text',
        mediaPath: input.mediaPath,
        mediaMimeType: input.mediaMimeType,
        mediaFileName: input.mediaFileName,
        scheduledAt: input.scheduledAt,
        status: 'pending',
      },
    });
    this.notifyUpdate();
    return record;
  }

  public async getAll(filter?: { status?: string }) {
    return prisma.scheduledMessage.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  public async getById(id: string) {
    return prisma.scheduledMessage.findUnique({
      where: { id },
    });
  }

  public async cancel(id: string) {
    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    this.notifyUpdate();
    return updated;
  }

  public async delete(id: string) {
    const item = await prisma.scheduledMessage.findUnique({ where: { id } });
    if (item?.mediaPath && fs.existsSync(item.mediaPath)) {
      try {
        fs.unlinkSync(item.mediaPath);
      } catch (e) {}
    }
    const res = await prisma.scheduledMessage.delete({ where: { id } });
    this.notifyUpdate();
    return res;
  }

  public async retry(id: string) {
    // Reset status to pending with current time, then trigger immediate pass
    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        status: 'pending',
        scheduledAt: new Date(),
        error: null,
      },
    });
    this.notifyUpdate();
    setImmediate(() => this.processPendingQueue());
    return updated;
  }

  public async getStats() {
    const [total, pending, sent, failed] = await Promise.all([
      prisma.scheduledMessage.count(),
      prisma.scheduledMessage.count({ where: { status: 'pending' } }),
      prisma.scheduledMessage.count({ where: { status: 'sent' } }),
      prisma.scheduledMessage.count({ where: { status: 'failed' } }),
    ]);

    return { total, pending, sent, failed, isPaused: this.isPaused };
  }
}

export const schedulerService = new SchedulerService();
