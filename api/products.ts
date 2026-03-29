
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

export default async function handler(req: Request, res: Response) {
  const { method } = req;

  // Ensure table exists (Lazy initialization)
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        price INT,
        image TEXT,
        images JSON,
        description TEXT,
        benefits JSON,
        rating DECIMAL(3,2),
        reviewsCount INT,
        reviews JSON,
        variants JSON,
        skinType JSON
      )
    `);
  } catch (e) {
    const err = e as Error;
    console.error("Table creation error:", err);
    // If it's a connection error, throw it so it's caught by the main catch block
    if (err.message.includes('connection refused') || err.message.includes('ECONNREFUSED')) {
      throw err;
    }
  }

  try {
    switch (method) {
      case 'GET': {
        const [rows] = await db.execute('SELECT * FROM products');
        const parsedRows = (rows as Record<string, unknown>[]).map((r) => ({
          ...r,
          images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
          benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : (r.benefits || []),
          reviews: typeof r.reviews === 'string' ? JSON.parse(r.reviews) : (r.reviews || []),
          variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : (r.variants || []),
          skinType: typeof r.skinType === 'string' ? JSON.parse(r.skinType) : (r.skinType || [])
        }));
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        return res.status(200).json(parsedRows);
      }

      case 'POST': {
        const p = req.body;
        await db.execute(
          `INSERT INTO products (id, name, category, price, image, images, description, benefits, rating, reviewsCount, reviews, variants, skinType) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           name=VALUES(name), category=VALUES(category), price=VALUES(price), image=VALUES(image), 
           images=VALUES(images), description=VALUES(description), benefits=VALUES(benefits), 
           rating=VALUES(rating), reviewsCount=VALUES(reviewsCount), reviews=VALUES(reviews), 
           variants=VALUES(variants), skinType=VALUES(skinType)`,
          [
            p.id, p.name, p.category, p.price, p.image, 
            JSON.stringify(p.images || []), 
            p.description, 
            JSON.stringify(p.benefits || []), 
            p.rating || 5.0, 
            p.reviewsCount || 0, 
            JSON.stringify(p.reviews || []), 
            JSON.stringify(p.variants || []), 
            JSON.stringify(p.skinType || [])
          ]
        );
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });
        await db.execute('DELETE FROM products WHERE id = ?', [id as string]);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    const err = error as Error;
    console.error('[PRODUCTS API ERROR]', err);
    
    // Provide a more helpful error message for connection issues
    let errorMessage = err.message;
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({ success: false, error: errorMessage });
  }
}
