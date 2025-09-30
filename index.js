const express = require('express');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Validate required environment variables
// JWT secret can be AUTH_KEY, JWT_SECRET, or JWT_SECRET_KEY
const jwtSecret = process.env.AUTH_KEY || process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
const requiredEnvVars = ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

// Check for JWT secret (at least one must be present)
if (!jwtSecret) {
  console.error('ERROR: JWT secret not found!');
  console.error('Please set one of: AUTH_KEY, JWT_SECRET, or JWT_SECRET_KEY in your .env file');
  process.exit(1);
}

// Log which JWT secret is being used (without exposing the actual key)
const keyName = process.env.AUTH_KEY ? 'AUTH_KEY' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'JWT_SECRET_KEY');
console.log(`JWT secret configured: ${keyName} (length: ${jwtSecret.length})`);

const app = express();
require('./connection/db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
const routes = require('./routes/routes');

app.use('/api', routes);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});
  
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
