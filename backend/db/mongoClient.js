// backend/db/mongoClient.js
const mongoose = require('mongoose');

// Cache the connection across serverless invocations (warm starts reuse this)
let cachedConnection = null;

const connectDB = async () => {
  // If a connection is already established and ready, reuse it immediately
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }

    // Tuned for serverless: small pool, fast timeouts, no idle connections held open
    const options = {
      serverSelectionTimeoutMS: 5000,  // Fail fast (5s) instead of hanging for 30s
      socketTimeoutMS: 10000,
      maxPoolSize: 5,                  // Small pool suitable for serverless
      minPoolSize: 0,                  // Don't hold idle connections (serverless scales to zero)
      retryWrites: true,
      family: 4,                       // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    cachedConnection = mongoose.connection;
    console.log('✅ Successfully connected to MongoDB');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      cachedConnection = null; // Reset cache so next request retries
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      cachedConnection = null; // Reset cache so next request reconnects
    });

    return cachedConnection;

  } catch (error) {
    cachedConnection = null;
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;