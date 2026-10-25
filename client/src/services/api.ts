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

  async getSchedules(status?: string): Promise<ScheduledMessage[]> {
    const url = status ? `${API_BASE}/schedules?status=${status}` : `${API_BASE}/schedules`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.data || [];
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
