import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import actionRoutes from './routes/actionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
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
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ClubOps AI backend is running'
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
