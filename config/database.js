const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get database configuration from environment variables
// In Docker Compose, DB_HOST should be the service name "db"
const config = {
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'db', // Default to 'db' for Docker Compose
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || 'postgres',
};

// Log database configuration (without password)
console.log('Database Config:', {
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
  dialect: config.dialect
});

// Initialize Sequelize with configuration
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

module.exports = sequelize;
