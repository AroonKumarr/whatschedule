import { Request, Response } from 'express';
import { whatsAppService } from '../services/whatsapp.service';
import { schedulerService } from '../services/scheduler.service';
import { detectMediaType } from '../services/media.service';
import { prisma } from '../database/prisma';

export class ApiController {
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
