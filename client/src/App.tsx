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

  // 5-Item Primary Navigation (Requested by user: home, send-now, schedule, activity, settings)
  const [activeView, setActiveView] = useState<MainNavView>('home');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
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

  const selectedMessage = schedules.find((s) => s.id === selectedId) || null;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F6F9F7] dark:bg-[#101815] transition-colors duration-150">
      {/* 5-Item Navigation Left Sidebar */}
      <Sidebar
        schedules={schedules}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setActiveView('activity');
        }}
        onOpenComposer={() => setIsComposerOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        status={status}
        stats={stats}
        onRetry={handleRetry}
        onDelete={handleDelete}
        onLock={handleLock}
        onTogglePause={handleTogglePause}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Right Screen Content: Switched cleanly between the 5 requested views */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {/* 1. Home Dashboard */}
        {activeView === 'home' && (
          <HomeView
            status={status}
            stats={stats}
            schedules={schedules}
            onNavigate={(view) => setActiveView(view)}
            onSendNow={handleSendNow}
            sendingId={sendingId}
          />
        )}

        {/* 2. Send Now (Instant Dispatch) */}
        {activeView === 'send-now' && (
          <SendNowView
            contacts={contacts}
            onMessageSent={() => {
              refreshSchedules();
              refreshStats();
              setActiveView('activity');
            }}
          />
        )}

        {/* 3. Schedule for Later (Calendar Timeline) */}
        {activeView === 'schedule' && (
          <CalendarView
            schedules={schedules}
            onSelect={(id) => {
              setSelectedId(id);
              setActiveView('activity');
            }}
            onOpenComposer={() => setIsComposerOpen(true)}
          />
        )}

        {/* 4. Activity & Message Management */}
        {activeView === 'activity' && (
          <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden">
            <ActivityView
              schedules={schedules}
              contacts={contacts}
              onSelectMessage={(id) => setSelectedId(id)}
              onSendNow={handleSendNow}
              onRetry={handleRetry}
              onDelete={handleDelete}
              sendingId={sendingId}
            />
            {selectedMessage && (
              <div className="hidden lg:flex w-[420px] h-full border-l border-[#DCE7E1] dark:border-[#2D3D35]">
                <ChatView
                  selectedMessage={selectedMessage}
                  onSendNow={handleSendNow}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onOpenComposer={() => setIsComposerOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* 5. Settings & Preferences */}
        {activeView === 'settings' && (
          <SettingsView
            status={status}
            stats={stats}
            onLogout={handleLogout}
            onTogglePause={handleTogglePause}
          />
        )}
      </main>

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
