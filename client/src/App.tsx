import React, { useState, useEffect, useCallback } from 'react';
import { ScheduledMessage, Contact, WhatsAppStatus, QueueStats } from './types';
import { api, AuthStatus } from './services/api';
import { useTheme } from './hooks/useTheme';
import { PinLockScreen } from './components/PinLockScreen';
import { QRLoginPage } from './components/QRLoginPage';
import { Sidebar, MainNavView } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { SendNowView } from './components/SendNowView';
import { CalendarView } from './components/CalendarView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { ChatView } from './components/ChatView';
import { ComposerModal } from './components/ComposerModal';
import { WhatsScheduleDashboard } from './components/dashboard/WhatsScheduleDashboard';
import { ScheduleOptions } from './components/dashboard/SchedulePopover';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isPinSet: true,
    isUnlocked: false,
  });
  const [authChecked, setAuthChecked] = useState(false);

  const [status, setStatus] = useState<WhatsAppStatus>({
    state: 'connecting',
    qrCodeUrl: null,
    qrRaw: null,
    user: null,
    lastConnectedAt: null,
  });

  const [schedules, setSchedules] = useState<ScheduledMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<QueueStats>({ total: 0, pending: 0, sent: 0, failed: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 5-Item Primary Navigation & Settings Overlay
  const [activeView, setActiveView] = useState<MainNavView>('home');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Check Master PIN Security Status on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getAuthStatus();
        setAuthStatus(res);
      } catch (e) {
        setAuthStatus({ isPinSet: false, isUnlocked: true });
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Load Data
  const refreshSchedules = useCallback(async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  }, [selectedId]);

  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {}
  }, []);

  const refreshContacts = useCallback(async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {}
  }, []);

  // WebSocket Live Sync
  useEffect(() => {
    if (!authStatus.isUnlocked) return;

    refreshSchedules();
    refreshStats();
    refreshContacts();

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'STATUS_UPDATE') {
            setStatus(payload.data);
          } else if (payload.type === 'QUEUE_UPDATE') {
            refreshSchedules();
            refreshStats();
            refreshContacts();
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connectWs();

    const interval = setInterval(() => {
      refreshSchedules();
      refreshStats();
    }, 8000);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
    };
  }, [authStatus.isUnlocked, refreshSchedules, refreshStats, refreshContacts]);

  // Actions
  const handleLock = () => {
    api.clearToken();
    setAuthStatus((prev) => ({ ...prev, isUnlocked: false }));
  };

  const handleTogglePause = async () => {
    try {
      if (stats.isPaused) {
        await api.resumeQueue();
      } else {
        await api.pauseQueue();
      }
      refreshStats();
    } catch (e) {
      alert('Failed to update queue state');
    }
  };

  const handleSendNow = async (id: string) => {
    setSendingId(id);
    try {
      await api.sendNow(id);
      refreshSchedules();
      refreshStats();
    } catch (e: any) {
      alert(e?.message || 'Failed to trigger immediate dispatch');
    } finally {
      setSendingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelSchedule(id);
      refreshSchedules();
      refreshStats();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled message?')) return;
    try {
      await api.deleteSchedule(id);
      if (selectedId === id) setSelectedId(null);
      refreshSchedules();
      refreshStats();
    } catch (e) {}
  };

  const handleRetry = async (id: string) => {
    setSendingId(id);
    try {
      await api.retrySchedule(id);
      refreshSchedules();
      refreshStats();
    } catch (e: any) {
      alert(e?.message || 'Failed to retry message');
    } finally {
      setSendingId(null);
    }
  };

  const handleCreateSchedule = async (formData: FormData) => {
    const created = await api.createSchedule(formData);
    setSelectedId(created.id);
    setActiveView('activity');
    refreshSchedules();
    refreshStats();
  };

  const handleLogout = async () => {
    if (!confirm('Unlink this WhatsApp session? You will need to scan the QR code again.')) return;
    await api.logout();
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-[#F6F9F7] dark:bg-[#101815] flex items-center justify-center text-[#5D7168] dark:text-[#8A9A91] text-sm font-medium">
        Initializing Security Environment...
      </div>
    );
  }

  // 1. Master PIN Security Lock
  if (!authStatus.isUnlocked) {
    return (
      <PinLockScreen
        isPinSet={authStatus.isPinSet}
        onSetup={async (pin) => {
          return await api.setupPin(pin);
        }}
        onUnlock={async (pin) => {
          return await api.unlock(pin);
        }}
        onSuccess={() => {
          setAuthStatus({ isPinSet: true, isUnlocked: true });
        }}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 2. WhatsApp QR Login Screen (If session not linked)
  if (status.state !== 'connected') {
    return (
      <QRLoginPage
        status={status}
        onRefresh={async () => {
          try {
            await api.logout();
          } catch (e) {}
        }}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const handleDashboardScheduleMessage = async (
    recipientJid: string,
    recipientName: string,
    content: string,
    file: File | null,
    options?: ScheduleOptions
  ) => {
    try {
      const formData = new FormData();
      formData.append('recipient', recipientJid);
      if (recipientName) formData.append('recipientName', recipientName);
      formData.append('content', content);

      const targetTime = options?.scheduledAt || new Date().toISOString();
      formData.append('scheduledAt', targetTime);

      if (file) {
        formData.append('media', file);
      }

      const created = await api.createSchedule(formData);

      // If scheduled for immediate send (within 10s), trigger instant send now
      if (!options || Math.abs(new Date(options.scheduledAt).getTime() - Date.now()) < 10000) {
        await api.sendNow(created.id);
      }

      await refreshSchedules();
      await refreshStats();
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch message');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0B0F0D] text-[#E9EDEF]">
      {/* Three-Zone Shell Dashboard (Desktop, Tablet, Phone) */}
      <WhatsScheduleDashboard
        schedules={schedules}
        contacts={contacts}
        status={status}
        stats={stats}
        selectedId={selectedId}
        onSelectSchedule={(id) => setSelectedId(id)}
        onNewSchedule={() => setIsComposerOpen(true)}
        onSendNow={handleSendNow}
        onRetry={handleRetry}
        onDelete={handleDelete}
        onScheduleMessage={handleDashboardScheduleMessage}
        onLockApp={handleLock}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSending={sendingId !== null}
      />

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-2xl bg-[#17211D] border border-[#2D3D35] rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-[#F2F7F4]">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-[#A0A0A0] hover:text-white p-1 rounded-lg"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
            <SettingsView
              status={status}
              stats={stats}
              onLogout={() => {
                setIsSettingsOpen(false);
                handleLogout();
              }}
              onTogglePause={handleTogglePause}
            />
          </div>
        </div>
      )}

      {/* Schedule Composer Modal */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreateSchedule}
        contacts={contacts}
      />
    </div>
  );
};
