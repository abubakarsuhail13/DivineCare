
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

export default async function handler(req: Request, res: Response) {
  const { method } = req;

  // Ensure table exists
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE
      )
    `);
  } catch {
    // Table might already exist or other DB error
  }

  try {
    switch (method) {
      case 'GET': {
        const [rows] = await db.execute('SELECT * FROM categories');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        return res.status(200).json(rows);
      }

      case 'POST': {
        const c = req.body;
        await db.execute(
          'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug)',
          [c.id, c.name, c.slug]
        );
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });
        await db.execute('DELETE FROM categories WHERE id = ?', [id as string]);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    const err = error as Error;
    console.error('[CATEGORIES API ERROR]', err);
    
    let errorMessage = err.message;
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({ success: false, error: errorMessage });
  }
}
