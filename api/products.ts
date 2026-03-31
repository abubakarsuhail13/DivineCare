
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Glow-Radiance Facial Kit',
    category: 'facial-kit',
    price: 40600,
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800'],
    description: 'A complete 5-step treatment designed to revive dull skin and impart a divine luminance.',
    benefits: ['Deep hydration', 'Instantly brightens', 'Smoothes texture'],
    rating: 4.9,
    reviewsCount: 128,
    reviews: [],
    variants: ['Luxury Set', 'Travel Size'],
    skinType: ['Normal', 'Dry', 'Combination']
  },
  {
    id: '2',
    name: 'Eternal Youth Serum',
    category: 'serum',
    price: 23800,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'],
    description: 'Concentrated peptide formula that targets fine lines and boosts collagen production.',
    benefits: ['Firms skin', 'Reduces wrinkles', 'Antioxidant protection'],
    rating: 4.8,
    reviewsCount: 342,
    reviews: [],
    variants: ['30ml', '50ml'],
    skinType: ['Aging', 'Sensitive']
  },
  {
    id: '3',
    name: 'Rose Gold Hydrating Cream',
    category: 'cream',
    price: 20160,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800'],
    description: 'Infused with real rose extracts and hyaluronic acid for 24-hour deep moisture.',
    benefits: ['Ultra-rich moisture', 'Soothing scent', 'Non-greasy finish'],
    rating: 5.0,
    reviewsCount: 89,
    reviews: [],
    variants: ['50g', '100g'],
    skinType: ['Dry', 'Very Dry']
  },
  {
    id: '4',
    name: 'Divine Silk Cleanser',
    category: 'cleanser',
    price: 12600,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800'],
    description: 'A creamy, milk-based cleanser that removes impurities without stripping moisture.',
    benefits: ['Ph balanced', 'Soap-free', 'Deeply cleansing'],
    rating: 4.7,
    reviewsCount: 215,
    reviews: [],
    variants: ['150ml'],
    skinType: ['All Skin Types']
  },
  {
    id: '5',
    name: 'Celestial Night Elixir',
    category: 'serum',
    price: 30800,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800'],
    description: 'A potent overnight treatment to repair and regenerate skin cells while you sleep.',
    benefits: ['Intense repair', 'Calming botanical blend', 'Wake up glowing'],
    rating: 4.9,
    reviewsCount: 156,
    reviews: [],
    variants: ['30ml'],
    skinType: ['All Skin Types']
  },
  {
    id: '6',
    name: 'Velvet Soft Eye Cream',
    category: 'cream',
    price: 18200,
    image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800'],
    description: 'Targets dark circles and puffiness with a lightweight, velvet-smooth texture.',
    benefits: ['Depuffs', 'Brightens eyes', 'Hydrating'],
    rating: 4.6,
    reviewsCount: 94,
    reviews: [],
    variants: ['15ml'],
    skinType: ['Normal', 'Dry']
  }
];

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

    // Seed if empty
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM products');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (rows as any)[0]?.count || 0;
    if (count === 0) {
      console.log('[SEED] Seeding initial products...');
      for (const p of INITIAL_PRODUCTS) {
        await db.execute(
          `INSERT IGNORE INTO products (id, name, category, price, image, images, description, benefits, rating, reviewsCount, reviews, variants, skinType) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      }
    }
  } catch (e) {
    const err = e as Error;
    console.error("Table creation/seeding error:", err);
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
