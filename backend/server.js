import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
let server;

// Process-level uncaught exception safety guard
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]:', error);
});

// Process-level unhandled promise rejection safety guard
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]:', reason);
});

async function startServer() {
  await connectDatabase();

  server = app.listen(port, () => {
    console.log(`ClubOps AI backend running on http://localhost:${port}`);
    console.log(`- AI Action Executor: POST /api/ai/chat`);
    console.log(`- Analytics Health:    GET  /api/analytics/health`);
    console.log(`- Base Health Check:   GET  /api/health`);
  });
}

function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('Server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});
