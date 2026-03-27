
import mysql from 'mysql2/promise';

/**
 * Database connection pool for Divine Beauty MySQL.
 * Optimized for Vercel/Cloud Run Serverless environment.
 */
const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2, // Optimized for serverless to prevent exhaustion
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

// Check if configuration is missing
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.warn('[DATABASE WARNING] Missing DB_HOST, DB_USER, or DB_NAME. Connection will default to localhost and likely fail with ECONNREFUSED.');
}

export const db = mysql.createPool(poolConfig);

export default db;
