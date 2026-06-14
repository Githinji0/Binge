// Load environment variables
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Custom CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Fallback Route for Undefined Paths
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
