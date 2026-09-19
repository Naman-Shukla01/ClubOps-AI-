<<<<<<< HEAD
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn('⚠️  MongoDB connection failed. Check your IP Whitelist on MongoDB Atlas (Network Access -> Add IP -> 0.0.0.0/0). Server will continue running...');
  }
};

module.exports = connectDB;
=======
import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
}
>>>>>>> main
