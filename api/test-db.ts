
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

/**
 * Vercel Serverless Function to test MySQL database connectivity.
 * Returns { success: true } on connection success.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Acquire a connection from the pool and run a simple query
    const [rows] = await db.execute('SELECT 1 as connection_ok');

    return res.status(200).json({ 
      success: true, 
      message: 'Database connection verified successfully',
      data: rows
    });

  } catch (error) {
    console.error('[DATABASE TEST ERROR]', error);

    let errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: errorMessage,
      code: (error as Record<string, unknown>).code || 'UNKNOWN_ERROR',
      hint: "1. Ensure Remote MySQL IPs are whitelisted (%) in your Hostinger Panel. 2. Verify DB_HOST is NOT 'localhost' (it should be a Hostinger server address). 3. Check if your database user has all permissions."
    });
  }
}
