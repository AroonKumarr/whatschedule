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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.get('/api/status', ApiController.getStatus);
app.post('/api/logout', ApiController.logout);
app.get('/api/contacts', ApiController.getContacts);
app.get('/api/schedules', ApiController.getSchedules);
app.post('/api/schedules', upload.single('media'), ApiController.createSchedule);
app.post('/api/schedules/:id/cancel', ApiController.cancelSchedule);
app.post('/api/schedules/:id/retry', ApiController.retrySchedule);
app.delete('/api/schedules/:id', ApiController.deleteSchedule);
app.get('/api/stats', ApiController.getStats);

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
