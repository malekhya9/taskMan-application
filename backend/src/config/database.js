require('dotenv').config();

// Use SQLite for demo, MySQL for production
if (process.env.DB_TYPE === 'sqlite') {
  module.exports = require('./database-demo');
} else {
  // MySQL configuration for production
  const mysql = require('mysql2/promise');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskman',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  const pool = mysql.createPool(dbConfig);

  // Test database connection
  const testConnection = async () => {
    try {
      const connection = await pool.getConnection();
      console.log('MySQL database connected successfully');
      connection.release();
    } catch (error) {
      console.error('MySQL database connection failed:', error.message);
    }
  };

  testConnection();

  module.exports = pool;
}
