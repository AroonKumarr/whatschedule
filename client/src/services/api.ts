import { ScheduledMessage, Contact, WhatsAppStatus, QueueStats } from '../types';

const API_BASE = '/api';

export interface AuthStatus {
  isPinSet: boolean;
  isUnlocked: boolean;
}

export const api = {
  getToken(): string | null {
    return sessionStorage.getItem('whatschedule_auth_token');
  },

  setToken(token: string): void {
    sessionStorage.setItem('whatschedule_auth_token', token);
  },

  clearToken(): void {
    sessionStorage.removeItem('whatschedule_auth_token');
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getAuthStatus(): Promise<AuthStatus> {
    const res = await fetch(`${API_BASE}/auth/status`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data;
  },

  async setupPin(pin: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to setup PIN');
    }
    this.setToken(data.token);
    return data.token;
  },

  async unlock(pin: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Incorrect Master PIN');
    }
    this.setToken(data.token);
    return data.token;
  },

  async getStatus(): Promise<WhatsAppStatus> {
    const res = await fetch(`${API_BASE}/status`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data;
  },

  // Dedicated Phone Linking API
  async linkPhone(phone: string, userId: string = 'default_user'): Promise<{ code: string; formattedCode: string; expiresInSec: number }> {
    const res = await fetch(`${API_BASE}/link/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ phone, userId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to request pairing code');
    }
    return {
      code: data.code,
      formattedCode: data.formattedCode || data.code,
      expiresInSec: data.expiresInSec || 180,
    };
  },

  async getLinkStatus(userId: string = 'default_user'): Promise<{
    status: 'idle' | 'code_ready' | 'connected' | 'expired' | 'error';
    error: string | null;
    secondsLeft: number;
    code?: string | null;
    formattedCode?: string | null;
  }> {
    const res = await fetch(`${API_BASE}/link/status/${encodeURIComponent(userId)}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch link status');
    }
    return data;
  },

  async cancelLink(userId: string = 'default_user'): Promise<void> {
    await fetch(`${API_BASE}/link/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ userId }),
    });
  },

  async requestPairingCode(phoneNumber: string, countryCode?: string): Promise<{ code: string; formattedCode: string }> {
    const fullNumber = countryCode ? `${countryCode}${phoneNumber}` : phoneNumber;
    const res = await this.linkPhone(fullNumber);
    return { code: res.code, formattedCode: res.formattedCode };
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async getContacts(): Promise<Contact[]> {
    const res = await fetch(`${API_BASE}/contacts`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  async saveContact(name: string, number: string): Promise<Contact> {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ name, number }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save contact');
    }
    return data.data;
  },

  async generateAIDraft(prompt: string, tone: string = 'professional', recipientRole?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ prompt, tone, recipientRole }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate AI draft');
    }
    return data.data.draft;
  },

  async parseVoiceCommand(transcript: string, timezone?: string): Promise<{
    recipientName: string | null;
    message: string | null;
    scheduledAt: string | null;
    provider: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/parse-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({
        transcript,
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to parse voice command');
    }
    return data.data;
  },

  async getSchedules(status?: string): Promise<ScheduledMessage[]> {
    const url = status ? `${API_BASE}/schedules?status=${status}` : `${API_BASE}/schedules`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  async getChatMessages(jid: string): Promise<{ history: any[]; scheduled: ScheduledMessage[] }> {
    const res = await fetch(`${API_BASE}/chats/${encodeURIComponent(jid)}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data || { history: [], scheduled: [] };
  },

  async createSchedule(formData: FormData): Promise<ScheduledMessage> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to schedule message');
    }
    return data.data;
  },

  async cancelSchedule(id: string): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules/${id}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data;
  },

  async retrySchedule(id: string): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules/${id}/retry`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data;
  },

  async sendNow(id: string): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules/${id}/send-now`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to dispatch message');
    }
    return data.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  },

  async pauseQueue(): Promise<void> {
    await fetch(`${API_BASE}/queue/pause`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async resumeQueue(): Promise<void> {
    await fetch(`${API_BASE}/queue/resume`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async getStats(): Promise<QueueStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data || { total: 0, pending: 0, sent: 0, failed: 0 };
  },
};
