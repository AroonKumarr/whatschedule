export interface ScheduledMessage {
  id: string;
  waMessageId?: string | null;
  recipient: string;
  recipientName?: string | null;
  content?: string | null;
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  mediaPath?: string | null;
  mediaMimeType?: string | null;
  mediaFileName?: string | null;
  scheduledAt: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'read';
  error?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name?: string | null;
  number: string;
  avatarUrl?: string | null;
  lastContactedAt?: string | null;
}

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

export interface QueueStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  isPaused?: boolean;
}

export interface ConversationItem {
  id: string;
  jid: string;
  name: string;
  number: string;
  lastMessage: string;
  lastTimestamp: string;
  sender: 'incoming' | 'outgoing';
  status: 'sent' | 'received' | 'pending' | 'failed';
  unreadCount: number;
  hasMedia: boolean;
  hasScheduled?: boolean;
  avatarColor?: string;
  isGroup?: boolean;
}
