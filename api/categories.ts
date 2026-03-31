
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

const INITIAL_CATEGORIES = [
  { id: '1', name: 'Facial Kit', slug: 'facial-kit' },
  { id: '2', name: 'Serum', slug: 'serum' },
  { id: '3', name: 'Cream', slug: 'cream' },
  { id: '4', name: 'Cleanser', slug: 'cleanser' },
  { id: '5', name: 'AI Services', slug: 'ai-services' },
  { id: '6', name: 'Websites', slug: 'websites' },
  { id: '7', name: 'Digital Products', slug: 'digital-products' }
];

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

    // Seed if empty
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM categories');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (rows as any)[0]?.count || 0;
    if (count === 0) {
      console.log('[SEED] Seeding initial categories...');
      for (const cat of INITIAL_CATEGORIES) {
        await db.execute(
          'INSERT IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)',
          [cat.id, cat.name, cat.slug]
        );
      }
    }
  } catch (e) {
    const err = e as Error;
    console.error("Table creation/seeding error:", err);
    if (err.message.includes('connection refused') || err.message.includes('ECONNREFUSED')) {
      throw err;
    }
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
