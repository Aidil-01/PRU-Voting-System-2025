const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { generalLimiter, voteLimiter, registrationLimiter } = require('./middleware/rateLimiter');

// Import routes
const votersRoutes = require('./routes/voters');
const villagesRoutes = require('./routes/villages');
const partiesRoutes = require('./routes/parties');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Rate limiting middleware
app.use('/api/', generalLimiter);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes - Debug logging
console.log('Loading routes...');
app.use('/api/voters', votersRoutes);
app.use('/api/villages', villagesRoutes);
app.use('/api/parties', partiesRoutes);
console.log('Routes loaded successfully');

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'Connected' : 'Disconnected',
      server: 'Running'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      timestamp: new Date().toISOString(),
      database: 'Error',
      server: 'Running',
      error: error.message
    });
  }
});

// System info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PRU Voting System API',
    version: '1.0.0',
    description: 'Live Voting Statistics System for Malaysian Elections',
    endpoints: {
      voters: '/api/voters',
      villages: '/api/villages',
      parties: '/api/parties',
      health: '/api/health'
    },
    features: [
      'Real-time voting updates',
      'Village management',
      'Political party management',
      'Live statistics',
      'Audit trail',
      'Malaysian IC validation'
    ]
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  // Send current stats to new connection
  socket.emit('welcome', {
    message: 'Connected to PRU Voting System',
    timestamp: new Date().toISOString()
  });
  
  // Handle client requesting stats update
  socket.on('requestStats', async () => {
    try {
      const { pool } = require('./config/database');
      
      // Get overall stats
      const [overallStats] = await pool.execute('SELECT * FROM overall_stats');
      
      // Get party stats
      const [partyStats] = await pool.execute('SELECT * FROM vote_stats_by_party');
      
      // Get village stats
      const [villageStats] = await pool.execute('SELECT * FROM vote_stats_by_village');
      
      const stats = {
        overall: overallStats[0] || {
          total_voters: 0,
          total_votes_cast: 0,
          remaining_voters: 0,
          overall_turnout_percentage: 0
        },
        by_party: partyStats,
        by_village: villageStats,
        timestamp: new Date().toISOString()
      };
      
      socket.emit('statsUpdate', stats);
    } catch (error) {
      console.error('Error fetching stats for socket:', error);
      socket.emit('error', { message: 'Failed to fetch statistics' });
    }
  });
  
  // Handle join room for real-time updates
  socket.on('joinVotingRoom', () => {
    socket.join('voting-updates');
    console.log(`User ${socket.id} joined voting updates room`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/health',
      '/api/info',
      '/api/voters',
      '/api/villages',
      '/api/parties'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PRU Voting System API is running!',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your XAMPP MySQL service.');
      process.exit(1);
    }
    
    server.listen(PORT, () => {
      console.log('\n🚀 PRU Voting System Server Started');
      console.log('=====================================');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
      console.log(`🔄 Socket.io enabled for real-time updates`);
      console.log(`🗃️  Database: Connected to MySQL`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;