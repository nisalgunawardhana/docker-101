const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Custom Docker App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime() 
  });
});

// Environment info endpoint
app.get('/env', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    nodeVersion: process.version
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Container: ${os.hostname()}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
