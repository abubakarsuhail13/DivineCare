import { Request, Response } from 'express';
import { db } from '../lib/db';

export default async function handler(req: Request, res: Response) {
  try {
    // Lazy table creation
    await db.query(`
      CREATE TABLE IF NOT EXISTS delivery_charges (
        id VARCHAR(255) PRIMARY KEY,
        city VARCHAR(255),
        charge DECIMAL(10, 2)
      )
    `);

    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT * FROM delivery_charges');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const charges = req.body; // Expecting an array
      if (!Array.isArray(charges)) {
        return res.status(400).json({ error: 'Expected an array of delivery charges' });
      }

      // Simple sync: clear and insert
      await db.query('DELETE FROM delivery_charges');
      for (const charge of charges) {
        await db.query(
          'INSERT INTO delivery_charges (id, city, charge) VALUES (?, ?, ?)',
          [charge.id, charge.city, charge.charge]
        );
      }
      return res.json({ success: true });
    }

    return res.status(405).end();
  } catch (error) {
    const err = error as Error;
    console.error('Delivery Charges API Error:', err);
    
    let errorMessage = err.message;
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
