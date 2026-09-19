<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');




// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health / Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'ClubOps AI Backend API is running...',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Route Mount Placeholders (ready for devs 1, 2, 3)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));
// app.use('/api/ai', require('./routes/aiRoutes'));


const aiRoutes = require('./routes/aiRoutes');
app.use('/api/meetings', aiRoutes);


// Add this import near your other routes in server.js
const documentRoutes = require('./routes/documentRoutes');

// Mount the route
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
=======
import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`ClubOps AI backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
>>>>>>> main
});
