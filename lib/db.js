
import mysql from 'mysql2/promise';

/**
 * Database connection pool for Divine Beauty MySQL.
 * Configured specifically for Vercel Serverless (ESM) and Hostinger MySQL.
 */
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 2, // Low limit to prevent connection exhaustion in serverless
  queueLimit: 0,
  connectTimeout: 10000, // 10s timeout
  enableKeepAlive: true,
  ssl: {
    rejectUnauthorized: false // Required for many remote MySQL providers
  }
});

export default db;
