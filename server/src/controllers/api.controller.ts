import { Request, Response } from 'express';
import { whatsAppService } from '../services/whatsapp.service';
import { schedulerService } from '../services/scheduler.service';
import { detectMediaType } from '../services/media.service';
import { authService } from '../services/auth.service';
import { aiService } from '../services/ai.service';
import { prisma } from '../database/prisma';

export class ApiController {
  // AI Drafting Assistant Endpoint (with rate limits, token budget & cache)
  public static async generateAIDraft(req: Request, res: Response) {
    try {
      const { prompt, context, tone, recipientRole } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt description is required' });
      }

      // Use client IP or auth token as user identifier for rate limiting
      const userId = (req.headers['x-forwarded-for'] as string) || req.ip || 'local-user';

      const result = await aiService.generateDraft(userId, {
        prompt,
        context,
        tone: tone || 'professional',
        recipientRole,
      });

      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  // Security & Master PIN Endpoints
  public static async getAuthStatus(req: Request, res: Response) {
    try {
      const isPinSet = await authService.isPinConfigured();
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const isUnlocked = isPinSet ? authService.validateToken(token) : false;

      return res.json({
        success: true,
        data: {
          isPinSet,
          isUnlocked: !isPinSet || isUnlocked, // If no PIN is configured yet, allows setup
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async setupPin(req: Request, res: Response) {
    try {
      const { pin } = req.body;
      if (!pin || pin.length < 4 || pin.length > 8) {
        return res.status(400).json({ success: false, error: 'PIN must be between 4 and 8 digits' });
      }

      await authService.setPin(pin);
      const auth = await authService.authenticate(pin);
      return res.json({ success: true, token: auth.token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async unlock(req: Request, res: Response) {
    try {
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ success: false, error: 'PIN is required' });
      }

      const auth = await authService.authenticate(pin);
      if (!auth.success) {
        return res.status(401).json({ success: false, error: auth.error || 'Invalid PIN' });
      }

      return res.json({ success: true, token: auth.token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Contact Creation & Sync
  public static async saveContact(req: Request, res: Response) {
    try {
      const { name, number } = req.body;
      if (!number) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }
      const rawNumber = number.replace(/[^0-9]/g, '');
      const jid = whatsAppService.formatJid(number);

      const contact = await prisma.contact.upsert({
        where: { id: jid },
        create: { id: jid, number: rawNumber, name: name || rawNumber },
        update: { name: name || undefined },
      });

      return res.json({ success: true, data: contact });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getStatus(req: Request, res: Response) {
    const status = whatsAppService.getStatus();
    return res.json({ success: true, data: status });
  }

  public static async logout(req: Request, res: Response) {
    try {
      await whatsAppService.logout();
      return res.json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getContacts(req: Request, res: Response) {
    try {
      const contacts = await prisma.contact.findMany({
        orderBy: [{ lastContactedAt: 'desc' }, { name: 'asc' }],
        take: 100,
      });
      return res.json({ success: true, data: contacts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getSchedules(req: Request, res: Response) {
    try {
      const statusFilter = req.query.status as string | undefined;
      const schedules = await schedulerService.getAll(
        statusFilter ? { status: statusFilter } : undefined
      );
      return res.json({ success: true, data: schedules });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createSchedule(req: Request, res: Response) {
    try {
      const { recipient, recipientName, content, scheduledAt } = req.body;

      if (!recipient) {
        return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
      }

      if (!scheduledAt) {
        return res.status(400).json({ success: false, error: 'Scheduled date and time is required' });
      }

      // Safeguard: WhatsApp character length limit (65,536 characters)
      if (content && content.length > 65536) {
        return res.status(400).json({
          success: false,
          error: `Message is too long (${content.length} characters). Maximum allowed is 65,536 characters.`,
        });
      }

      const scheduleDate = new Date(scheduledAt);
      if (isNaN(scheduleDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid scheduled date format' });
      }

      let type: 'text' | 'image' | 'video' | 'document' | 'audio' = 'text';
      let mediaPath: string | undefined;
      let mediaMimeType: string | undefined;
      let mediaFileName: string | undefined;

      if (req.file) {
        mediaPath = req.file.path;
        mediaMimeType = req.file.mimetype;
        mediaFileName = req.file.originalname;
        type = detectMediaType(req.file.mimetype);
      }

      const record = await schedulerService.create({
        recipient,
        recipientName: recipientName || undefined,
        content: content || '',
        type,
        mediaPath,
        mediaMimeType,
        mediaFileName,
        scheduledAt: scheduleDate,
      });

      return res.json({ success: true, data: record });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async pauseQueue(req: Request, res: Response) {
    try {
      schedulerService.setPaused(true);
      return res.json({ success: true, message: 'All scheduled message dispatches paused' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async resumeQueue(req: Request, res: Response) {
    try {
      schedulerService.setPaused(false);
      return res.json({ success: true, message: 'Scheduled message dispatches resumed' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async cancelSchedule(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const record = await schedulerService.cancel(id);
      return res.json({ success: true, data: record });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async retrySchedule(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const record = await schedulerService.retry(id);
      return res.json({ success: true, data: record });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteSchedule(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const record = await schedulerService.delete(id);
      return res.json({ success: true, data: record });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getStats(req: Request, res: Response) {
    try {
      const stats = await schedulerService.getStats();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
