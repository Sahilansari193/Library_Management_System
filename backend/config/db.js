
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/library_management_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    console.log(`[Database Name]: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('[MongoDB Connection Failed]:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB Disconnected]');
  } catch (error) {
    console.error('[Disconnect Error]:', error.message);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
