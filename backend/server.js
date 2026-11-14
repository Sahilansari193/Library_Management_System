const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to Database & auto seed sample data if clean
connectDB().then(() => {
  autoSeedIfEmpty();
}).catch((err) => {
  console.error('Database initialization error:', err.message);
});

const app = express();

// Body Parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: '*',
  })
);

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Library Membership & Fine Payment Management System API',
    timestamp: new Date().toISOString(),
  });
});

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/borrow', require('./routes/borrowRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Library Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
