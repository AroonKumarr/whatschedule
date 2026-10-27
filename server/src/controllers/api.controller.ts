import { Request, Response } from 'express';
import { whatsAppService } from '../services/whatsapp.service';
import { schedulerService } from '../services/scheduler.service';
import { detectMediaType } from '../services/media.service';
import { authService } from '../services/auth.service';
import { aiService } from '../services/ai.service';
import { phoneLinkService } from '../services/phone-link.service';
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
    // Lock feature removed per user request: always unlocked
    return res.json({
      success: true,
      data: {
        isPinSet: false,
        isUnlocked: true,
      },
    });
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

  // Dedicated WhatsApp Phone Number Pairing Endpoints
  public static async linkPhone(req: Request, res: Response) {
    try {
      const userId = (req.body.userId || 'default_user').trim();
      const rawPhone = (req.body.phone || req.body.phoneNumber || '').trim();

      if (!rawPhone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
      }

      const result = await phoneLinkService.requestPhoneLink(userId, rawPhone);
      return res.json({
        success: true,
        code: result.code,
        formattedCode: result.formattedCode,
        expiresInSec: result.expiresInSec,
        data: result,
      });
    } catch (err: any) {
      console.error('[API] Phone linking initiation failed:', err?.message);
      return res.status(400).json({ success: false, error: err?.message || 'Failed to start phone linking' });
    }
  }

  public static async getLinkStatus(req: Request, res: Response) {
    try {
      const userId = String(req.params.userId || 'default_user').trim();
      const statusInfo = phoneLinkService.getSessionStatus(userId);
      return res.json({
        success: true,
        status: statusInfo.status,
        error: statusInfo.error,
        secondsLeft: statusInfo.secondsLeft,
        code: statusInfo.code,
        formattedCode: statusInfo.formattedCode,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  }

  public static async cancelLink(req: Request, res: Response) {
    try {
      const userId = (req.body.userId || 'default_user').trim();
      await phoneLinkService.cancel(userId);
      return res.json({ success: true, message: 'Phone linking attempt cancelled successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  }

  // Backwards compatibility alias
  public static async requestPairingCode(req: Request, res: Response) {
    return ApiController.linkPhone(req, res);
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

  // Batch import contacts directly from phone contacts picker or VCF/CSV
  public static async importContacts(req: Request, res: Response) {
    try {
      const { contacts } = req.body;
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ success: false, error: 'contacts array is required' });
      }

      let imported = 0;
      for (const c of contacts) {
        const rawNum = String(c.tel || c.number || '').replace(/[^0-9]/g, '');
        if (!rawNum || rawNum.length < 7) continue;

        const name = String(c.name || rawNum).trim();
        const jid = rawNum.includes('@') ? rawNum : `${rawNum}@s.whatsapp.net`;

        await prisma.contact.upsert({
          where: { id: jid },
          create: {
            id: jid,
            number: rawNum,
            name,
            lastContactedAt: new Date(),
          },
          update: {
            name: name || undefined,
            lastContactedAt: new Date(),
          },
        }).catch(() => {});
        imported++;
      }

      return res.json({
        success: true,
        message: `Imported ${imported} contact${imported === 1 ? '' : 's'} successfully`,
        count: imported,
      });
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

  // Get Live Chat Messages for a Contact
  public static async getChatMessages(req: Request, res: Response) {
    try {
      const jid = String(req.params.jid || '');
      if (!jid) {
        return res.status(400).json({ success: false, error: 'Recipient jid is required' });
      }

      const rawNumber = jid.replace(/[^0-9]/g, '');

      // Identify associated contact to also find cross-referenced LIDs or phone numbers
      const contact = await prisma.contact.findFirst({
        where: {
          OR: [
            { id: jid },
            ...(rawNumber ? [{ number: rawNumber }, { id: { contains: rawNumber } }] : []),
          ],
        },
      });

      const orConditions: any[] = [
        { jid: jid },
        ...(rawNumber ? [{ jid: { contains: rawNumber } }] : []),
      ];

      if (contact) {
        orConditions.push({ jid: contact.id });
        if (contact.number) {
          orConditions.push({ jid: { contains: contact.number } });
        }
      }

      // 1. Fetch live sent/received chat history from chatMessage table
      const chatHistory = await (prisma as any).chatMessage.findMany({
        where: {
          OR: orConditions,
        },
        orderBy: { timestamp: 'asc' },
        take: 150,
      });

      // 2. Also fetch scheduled dispatches for this recipient
      const scheduled = await prisma.scheduledMessage.findMany({
        where: {
          OR: [
            { recipient: jid },
            ...(rawNumber ? [{ recipient: { contains: rawNumber } }] : []),
            ...(contact ? [{ recipient: contact.id }, { recipient: { contains: contact.number } }] : []),
          ],
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return res.json({
        success: true,
        data: {
          history: chatHistory,
          scheduled,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get Unified Conversations List with Latest Message & Metadata
  public static async getConversations(req: Request, res: Response) {
    try {
      // 1. Fetch all contacts (excluding newsletters and broadcast status)
      const contacts = await prisma.contact.findMany({
        where: {
          NOT: [
            { id: { contains: '@newsletter' } },
            { id: { contains: 'broadcast' } },
          ],
        },
      });

      // 2. Fetch recent chat messages (last 300)
      const recentMessages = await (prisma as any).chatMessage.findMany({
        where: {
          NOT: [
            { jid: { contains: '@newsletter' } },
            { jid: { contains: 'broadcast' } },
          ],
        },
        orderBy: { timestamp: 'desc' },
        take: 300,
      });

      // 3. Fetch all scheduled messages
      const schedules = await prisma.scheduledMessage.findMany({
        orderBy: { scheduledAt: 'desc' },
        take: 100,
      });

      const convMap = new Map<string, any>();

      // Group recent chat messages first (newest messages take priority)
      for (const msg of recentMessages) {
        const jidKey = msg.jid;
        const rawNum = jidKey.replace(/[^0-9]/g, '');

        let existingKey = convMap.has(jidKey) ? jidKey : null;
        if (!existingKey && rawNum) {
          for (const key of convMap.keys()) {
            if (key.includes(rawNum)) {
              existingKey = key;
              break;
            }
          }
        }

        const key = existingKey || jidKey;
        if (!convMap.has(key)) {
          const contact = contacts.find((c) => c.id === key || (rawNum && c.number === rawNum));
          let displayName = contact?.name;
          if (!displayName || displayName.replace(/[.\s_-]/g, '').length === 0) {
            displayName = rawNum ? `+${rawNum}` : 'WhatsApp User';
          }

          convMap.set(key, {
            id: key,
            jid: jidKey,
            name: displayName,
            number: contact?.number || rawNum,
            lastMessage: msg.content || (msg.mediaUrl ? '[Media]' : '[Message]'),
            lastTimestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
            sender: msg.sender,
            status: msg.status === 'received' ? 'received' : 'sent',
            unreadCount: msg.sender === 'incoming' ? 1 : 0,
            hasMedia: !!msg.mediaUrl,
            avatarColor: '#00A884',
            isGroup: jidKey.includes('@g.us'),
          });
        }
      }

      // Merge with scheduled messages
      for (const sch of schedules) {
        const jidKey = sch.recipient;
        const rawNum = jidKey.replace(/[^0-9]/g, '');

        let existingKey = convMap.has(jidKey) ? jidKey : null;
        if (!existingKey && rawNum) {
          for (const key of convMap.keys()) {
            if (key.includes(rawNum)) {
              existingKey = key;
              break;
            }
          }
        }

        if (existingKey) {
          const conv = convMap.get(existingKey);
          if (sch.status === 'pending') {
            conv.hasScheduled = true;
          }
        } else {
          const contact = contacts.find((c) => c.id === jidKey || (rawNum && c.number === rawNum));
          let displayName = sch.recipientName || contact?.name;
          if (!displayName || displayName.replace(/[.\s_-]/g, '').length === 0) {
            displayName = rawNum ? `+${rawNum}` : 'WhatsApp Contact';
          }

          convMap.set(jidKey, {
            id: jidKey,
            jid: jidKey,
            name: displayName,
            number: contact?.number || rawNum,
            lastMessage: sch.content || (sch.mediaPath ? `[${sch.type.toUpperCase()}]` : 'Scheduled message'),
            lastTimestamp: sch.scheduledAt ? new Date(sch.scheduledAt).toISOString() : new Date().toISOString(),
            sender: 'outgoing',
            status: sch.status,
            unreadCount: 0,
            hasMedia: !!sch.mediaPath,
            hasScheduled: sch.status === 'pending',
            avatarColor: '#10B981',
            isGroup: jidKey.includes('@g.us'),
          });
        }
      }

      // Merge remaining contacts that haven't chatted or scheduled yet
      for (const contact of contacts) {
        const rawNum = contact.number || contact.id.replace(/[^0-9]/g, '');
        let exists = false;
        for (const key of convMap.keys()) {
          if (key === contact.id || (rawNum && key.includes(rawNum))) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          let displayName = contact.name;
          if (!displayName || displayName.replace(/[.\s_-]/g, '').length === 0) {
            displayName = rawNum ? `+${rawNum}` : 'WhatsApp Contact';
          }

          convMap.set(contact.id, {
            id: contact.id,
            jid: contact.id,
            name: displayName,
            number: contact.number || rawNum,
            lastMessage: 'Tap to start conversation',
            lastTimestamp: contact.lastContactedAt ? new Date(contact.lastContactedAt).toISOString() : contact.createdAt.toISOString(),
            sender: 'incoming',
            status: 'sent',
            unreadCount: 0,
            hasMedia: false,
            avatarColor: '#059669',
            isGroup: contact.id.includes('@g.us'),
          });
        }
      }

      // Sort by newest activity first (identical to WhatsApp Web)
      const conversations = Array.from(convMap.values()).sort((a, b) => {
        return new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime();
      });

      return res.json({
        success: true,
        data: conversations,
      });
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

  public static async sendNow(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const result = await schedulerService.sendNow(id);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.message, data: result.record });
      }
      return res.json({ success: true, message: result.message, data: result.record });
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

  /**
   * POST /api/ai/parse-voice
   * Parse a natural-language voice transcript into a structured schedule.
   * Body: { transcript: string, timezone?: string }
   * Returns: { recipientName, message, scheduledAt, provider }
   */
  public static async parseVoiceCommand(req: Request, res: Response) {
    try {
      const transcript = String(req.body.transcript || '').trim();
      const timezone = String(req.body.timezone || 'UTC').trim();
      const userId = (req as any).userId || 'anon';

      if (!transcript) {
        return res.status(400).json({ success: false, error: 'transcript is required' });
      }
      if (transcript.length > 500) {
        return res.status(400).json({ success: false, error: 'transcript too long (max 500 chars)' });
      }

      const result = await aiService.parseVoiceCommand(userId, transcript, timezone);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Voice parse failed' });
    }
  }
}
