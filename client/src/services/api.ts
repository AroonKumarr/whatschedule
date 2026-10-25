import { ScheduledMessage, Contact, WhatsAppStatus, QueueStats } from '../types';

const API_BASE = '/api';

export const api = {
  async getStatus(): Promise<WhatsAppStatus> {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    return data.data;
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
  },

  async getContacts(): Promise<Contact[]> {
    const res = await fetch(`${API_BASE}/contacts`);
    const data = await res.json();
    return data.data || [];
  },

  async getSchedules(status?: string): Promise<ScheduledMessage[]> {
    const url = status ? `${API_BASE}/schedules?status=${status}` : `${API_BASE}/schedules`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  async createSchedule(formData: FormData): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to schedule message');
    }
    return data.data;
  },

  async cancelSchedule(id: string): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules/${id}/cancel`, { method: 'POST' });
    const data = await res.json();
    return data.data;
  },

  async retrySchedule(id: string): Promise<ScheduledMessage> {
    const res = await fetch(`${API_BASE}/schedules/${id}/retry`, { method: 'POST' });
    const data = await res.json();
    return data.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
  },

  async getStats(): Promise<QueueStats> {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    return data.data || { total: 0, pending: 0, sent: 0, failed: 0 };
  },
};
