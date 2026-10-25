import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { ApiController } from './controllers/api.controller';
import { upload } from './services/media.service';
import { whatsAppService } from './services/whatsapp.service';
import { schedulerService } from './services/scheduler.service';
import { authService } from './services/auth.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware for security: Checks if master PIN is configured
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isPinSet = await authService.isPinConfigured();
  if (!isPinSet) {
    // No PIN set yet, allow through to initial setup
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

  if (!authService.validateToken(token)) {
    return res.status(401).json({
      success: false,
      error: 'Security Lock Active. Please enter Master PIN to unlock.',
      locked: true,
    });
  }

  next();
};

// Security & Master PIN Routes (Always accessible)
app.get('/api/auth/status', ApiController.getAuthStatus);
app.post('/api/auth/setup', ApiController.setupPin);
app.post('/api/auth/unlock', ApiController.unlock);

// Serve uploaded media (protected by file token or internal)
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes (Protected by Master Security PIN)
app.get('/api/status', ApiController.getStatus);
app.post('/api/logout', requireAuth, ApiController.logout);
app.get('/api/contacts', requireAuth, ApiController.getContacts);
app.post('/api/contacts', requireAuth, ApiController.saveContact);
app.post('/api/ai/draft', requireAuth, ApiController.generateAIDraft);
app.get('/api/schedules', requireAuth, ApiController.getSchedules);
app.post('/api/schedules', requireAuth, upload.single('media'), ApiController.createSchedule);
app.post('/api/queue/pause', requireAuth, ApiController.pauseQueue);
app.post('/api/queue/resume', requireAuth, ApiController.resumeQueue);
app.post('/api/schedules/:id/cancel', requireAuth, ApiController.cancelSchedule);
app.post('/api/schedules/:id/retry', requireAuth, ApiController.retrySchedule);
app.delete('/api/schedules/:id', requireAuth, ApiController.deleteSchedule);
app.get('/api/stats', requireAuth, ApiController.getStats);

// Serve static frontend build if available (production mode)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  // Send initial state immediately
  ws.send(JSON.stringify({ type: 'STATUS_UPDATE', data: whatsAppService.getStatus() }));

  const unsubscribeStatus = whatsAppService.subscribeStatus((status) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'STATUS_UPDATE', data: status }));
    }
  });

  const unsubscribeQueue = schedulerService.onQueueUpdate(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'QUEUE_UPDATE' }));
    }
  });

  const unsubscribeReceipts = whatsAppService.subscribeReceipts(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'QUEUE_UPDATE' }));
    }
  });

  ws.on('close', () => {
    unsubscribeStatus();
    unsubscribeQueue();
    unsubscribeReceipts();
  });
});

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 WhatsSchedule Engine running on http://localhost:${PORT}`);
  console.log(`⚙️  WebSocket Live Sync on ws://localhost:${PORT}/ws`);
  console.log(`=======================================================`);

  // Initialize WhatsApp connection automatically
  await whatsAppService.initialize();
});
