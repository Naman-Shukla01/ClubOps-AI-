import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import aiRoutes from './routes/aiRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const allowedOrigin = process.env.CLIENT_URL || '*';

app.use(cors({ origin: allowedOrigin }));
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
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
