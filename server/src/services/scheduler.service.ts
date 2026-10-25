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

class SchedulerService {
  private cronJob: Cron | null = null;
  private isProcessing: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.startScheduler();
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
    // Check queue every 5 seconds
    this.cronJob = new Cron('*/5 * * * * *', async () => {
      await this.processPendingQueue();
    });
    console.log('Scheduler Service started (polling every 5s for due jobs)');
  }

  public async processPendingQueue(): Promise<void> {
    if (this.isProcessing) return;

    // Check if WhatsApp is connected before attempting dispatch
    const status = whatsAppService.getStatus();
    if (status.state !== 'connected') {
      return;
    }

    this.isProcessing = true;

    try {
      const now = new Date();
      // Fetch pending messages that are due
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
        take: 5, // Process in controlled batches to avoid flood
      });

      for (const msg of dueMessages) {
        // Mark as processing
        await prisma.scheduledMessage.update({
          where: { id: msg.id },
          data: { status: 'processing' },
        });
        this.notifyUpdate();

        try {
          if (msg.type === 'text' || !msg.mediaPath) {
            await whatsAppService.sendTextMessage(msg.recipient, msg.content || '');
          } else {
            await whatsAppService.sendMediaMessage(
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
              sentAt: new Date(),
              error: null,
            },
          });

          // Update contact last contacted
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

          console.log(`[Scheduler] Successfully sent scheduled message ${msg.id} to ${msg.recipient}`);
        } catch (err: any) {
          console.error(`[Scheduler] Failed to dispatch message ${msg.id}:`, err);
          await prisma.scheduledMessage.update({
            where: { id: msg.id },
            data: {
              status: 'failed',
              error: err?.message || 'Unknown dispatch error',
            },
          });
        }
        this.notifyUpdate();
      }
    } catch (err) {
      console.error('Error processing scheduler queue:', err);
    } finally {
      this.isProcessing = false;
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
    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        status: 'pending',
        scheduledAt: new Date(), // Immediate retry
        error: null,
      },
    });
    this.notifyUpdate();
    // Trigger immediate pass
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

    return { total, pending, sent, failed };
  }
}

export const schedulerService = new SchedulerService();
