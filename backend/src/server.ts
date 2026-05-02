import http from 'http';
import app from './app.js';
import { setupWorkers } from './shared/jobs/worker.js';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);
  
  // Clients can join a room named after their userId to receive personal notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start background worker
const workers = setupWorkers();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await Promise.all(workers.map(w => w.close()));
  server.close(() => {
    console.log('HTTP server closed');
  });
});
