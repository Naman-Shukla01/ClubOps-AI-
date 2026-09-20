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
    ]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
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

app.use(notFound);
app.use(errorHandler);

export default app;
