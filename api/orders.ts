
import { Request, Response } from 'express';
import { db } from '../lib/db.js';

/**
 * API for Divine Beauty Orders.
 * GET: Fetch all orders (Admin) or single order (Tracking).
 * POST: Create a new order.
 */
export default async function handler(req: Request, res: Response) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id, email } = req.query;
        if (id && email) {
          // Tracking query
          const [rows] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND customerEmail = ?',
            [id as string, email as string]
          );
          return res.status(200).json((rows as Record<string, unknown>[])[0] || null);
        } else {
          // Admin list query
          const [rows] = await db.execute('SELECT * FROM orders ORDER BY date DESC');
          // Parse items JSON if stored as string
          const parsedRows = (rows as Record<string, unknown>[]).map((r) => ({
            ...r,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
          }));
          return res.status(200).json(parsedRows);
        }
      }

      case 'POST': {
        const order = req.body;
        // Expected columns: id, customerName, customerEmail, shippingAddress, total, status, date, items (JSON), paymentMethod
        await db.execute(
          'INSERT INTO orders (id, customerName, customerEmail, shippingAddress, total, status, date, items, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            order.id,
            order.customerName,
            order.customerEmail,
            order.shippingAddress,
            order.total,
            order.status,
            order.date,
            JSON.stringify(order.items),
            order.paymentMethod
          ]
        );
        return res.status(201).json({ success: true, orderId: order.id });
      }

      case 'PATCH': {
        // Update Status
        const { orderId, status } = req.body;
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    const err = error as Error;
    console.error('[ORDERS API ERROR]', err);
    
    let errorMessage = err.message;
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({ success: false, error: errorMessage });
  }
}
