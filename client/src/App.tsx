import React, { useState, useEffect, useCallback } from 'react';
import { ScheduledMessage, Contact, WhatsAppStatus, QueueStats } from './types';
import { api, AuthStatus } from './services/api';
import { PinLockScreen } from './components/PinLockScreen';
import { QRLoginPage } from './components/QRLoginPage';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { CalendarView } from './components/CalendarView';
import { MediaVaultView } from './components/MediaVaultView';
import { SettingsView } from './components/SettingsView';
import { ComposerModal } from './components/ComposerModal';

export const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isPinSet: true, // Defaults to locked until checked
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
  const [activeView, setActiveView] = useState<'chats' | 'calendar' | 'vault' | 'settings'>('chats');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Check Master PIN Security Status on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getAuthStatus();
        setAuthStatus(res);
      } catch (e) {
        // Fallback
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

  const handleSendNow = async (id: string) => {
    try {
      await api.retrySchedule(id);
      refreshSchedules();
      refreshStats();
    } catch (e) {
      alert('Failed to trigger immediate send');
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
    await handleSendNow(id);
  };

  const handleCreateSchedule = async (formData: FormData) => {
    const created = await api.createSchedule(formData);
    setSelectedId(created.id);
    setActiveView('chats');
    refreshSchedules();
    refreshStats();
  };

  const handleLogout = async () => {
    if (!confirm('Unlink this WhatsApp session? You will need to scan the QR code again.')) return;
    await api.logout();
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-[#0c1317] flex items-center justify-center text-[#8696a0] text-sm">
        Initializing Security Environment...
      </div>
    );
  }

  // 1. Master PIN Security Lock (Protects from other Chrome profiles & unauthorized users)
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
      />
    );
  }

  const selectedMessage = schedules.find((s) => s.id === selectedId) || null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#0c1317]">
      {/* WhatsApp Web Left Sidebar */}
      <Sidebar
        schedules={schedules}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setActiveView('chats');
        }}
        onOpenComposer={() => setIsComposerOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        status={status}
        stats={stats}
        onRetry={handleRetry}
        onDelete={handleDelete}
        onLock={handleLock}
      />

      {/* Main Right Screen Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeView === 'chats' && (
          <ChatView
            selectedMessage={selectedMessage}
            onSendNow={handleSendNow}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onOpenComposer={() => setIsComposerOpen(true)}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            schedules={schedules}
            onSelect={(id) => {
              setSelectedId(id);
              setActiveView('chats');
            }}
            onOpenComposer={() => setIsComposerOpen(true)}
          />
        )}

        {activeView === 'vault' && (
          <MediaVaultView
            schedules={schedules}
            onSelect={(id) => {
              setSelectedId(id);
              setActiveView('chats');
            }}
            onDelete={handleDelete}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            status={status}
            stats={stats}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* New Schedule Composer Modal */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreateSchedule}
        contacts={contacts}
      />
    </div>
  );
};
