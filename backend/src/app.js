const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Use demo routes for easier setup
const authRoutes = require('./routes/auth-demo');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const inviteRoutes = require('./routes/invites');
const exportRoutes = require('./routes/export');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: process.env.DB_TYPE || 'mysql',
    message: 'TaskMan API is running!'
  });
});

// Demo endpoint
app.get('/api/demo', (req, res) => {
  res.json({
    message: 'TaskMan MVP Demo',
    features: [
      'User registration and authentication',
      'Task management with status transitions',
      'Role-based access control (Lead/Member)',
      'File attachments',
      'Comments system',
      'CSV export',
      'Deadline color coding',
      'Organization hierarchy'
    ],
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      users: '/api/users',
      invites: '/api/invites',
      export: '/api/export'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 TaskMan Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Demo info: http://localhost:${PORT}/api/demo`);
  console.log(`🌐 Frontend should run on: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
