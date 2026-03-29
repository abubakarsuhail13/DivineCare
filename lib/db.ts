
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
  const missingVars = [];
  if (!process.env.DB_HOST) missingVars.push('DB_HOST');
  if (!process.env.DB_USER) missingVars.push('DB_USER');
  if (!process.env.DB_NAME) missingVars.push('DB_NAME');
  
  console.error(`[DATABASE ERROR] Missing environment variables: ${missingVars.join(', ')}. Connection will likely fail with ECONNREFUSED 127.0.0.1:3306.`);
}

export const db = mysql.createPool(poolConfig);

// Wrap pool methods to provide better error messages for connection issues
const originalExecute = db.execute.bind(db);
const originalQuery = db.query.bind(db);

db.execute = async (sql: string, params?: any) => {
  try {
    return await originalExecute(sql, params);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('ECONNREFUSED')) {
      throw new Error('Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu of AI Studio.');
    }
    throw error;
  }
} as any;

db.query = async (sql: string, params?: any) => {
  try {
    return await originalQuery(sql, params);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('ECONNREFUSED')) {
      throw new Error('Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu of AI Studio.');
    }
    throw error;
  }
} as any;

export default db;
