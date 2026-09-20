import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import actionRoutes from './routes/actionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { configureGoogleStrategy } from './config/googleAuth.js';
import passport from './config/googleAuth.js';

const app = express();
configureGoogleStrategy();
const allowedOrigin = process.env.CLIENT_URL || '*';
const allowedOrigins = allowedOrigin === '*'
  ? null
  : new Set([
      allowedOrigin,
      allowedOrigin.replace('localhost', '127.0.0.1'),
      allowedOrigin.replace('127.0.0.1', 'localhost'),
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
    ]);

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      !allowedOrigins ||
      allowedOrigins.has(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(session({
  secret: process.env.OAUTH_SESSION_SECRET || process.env.JWT_SECRET || 'clubops-ai-session-secret-key-default',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 ClubOps AI Backend Server is running successfully!',
    frontendUrl: 'http://localhost:3000',
    endpoints: {
      health: 'GET /api/health',
      auth: '/api/auth',
      events: '/api/events',
      tasks: '/api/tasks',
      meetings: '/api/meetings',
      volunteers: '/api/volunteers',
      documents: '/api/documents',
      risks: '/api/risks',
      aiChat: 'POST /api/ai/chat'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ClubOps AI backend is running'
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/events', authenticate, eventRoutes);
app.use('/api/meetings', authenticate, meetingRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/volunteers', authenticate, volunteerRoutes);
app.use('/api/documents', authenticate, documentRoutes);
app.use('/api/risks', authenticate, riskRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/actions', authenticate, actionRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/clubs', authenticate, clubRoutes);
app.use('/api/announcements', authenticate, announcementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
