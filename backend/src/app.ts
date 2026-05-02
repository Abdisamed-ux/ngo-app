import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/auth/user.routes.js';
import donorsRoutes from './modules/donors/donors.routes.js';
import aidRequestsRoutes from './modules/aid-requests/aid-requests.routes.js';
import caseMgmtRoutes from './modules/case-mgmt/case-mgmt.routes.js';
import fundsRoutes from './modules/funds/funds.routes.js';
import reportingRoutes from './modules/reporting/reporting.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import jobsRoutes from './modules/jobs/jobs.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';

const app = express();

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/donations', donorsRoutes);
app.use('/api/v1/aid-requests', aidRequestsRoutes);
app.use('/api/v1/case-mgmt', caseMgmtRoutes);
app.use('/api/v1/funds', fundsRoutes);
app.use('/api/v1/reporting', reportingRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/messages', messagesRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist.' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

export default app;
