const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sweet_haven_db';
let isConnected = false;
let mongodInstance = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return true;

  // 1. First attempt: connect to configured MONGO_URI (Atlas or local mongod)
  try {
    console.log(`🔌 Attempting MongoDB connection to: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
      socketTimeoutMS: 30000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully to "${mongoose.connection.name}" at ${mongoose.connection.host}:${mongoose.connection.port}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  External MongoDB not reachable at ${MONGO_URI} (${error.message}).`);
    console.log('🚀 Initializing built-in MongoDB engine for zero-configuration startup...');
  }

  // 2. Fallback: Start in-memory MongoDB engine
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: { dbName: 'sweet_haven_db' }
    });
    const memoryUri = mongodInstance.getUri();
    MONGO_URI = memoryUri;

    await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log(`✅ Built-in MongoDB engine connected at: ${memoryUri}`);
    return true;
  } catch (memErr) {
    console.error('❌ Failed to initialize MongoDB:', memErr.message);
    isConnected = false;
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected.');
});

process.on('SIGINT', async () => {
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  process.exit(0);
});

module.exports = {
  connectDB,
  getIsConnected: () => isConnected,
  getDB: () => mongoose.connection,
  getMongoUri: () => MONGO_URI
};
