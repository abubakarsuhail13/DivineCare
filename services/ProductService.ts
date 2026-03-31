
import { Product, Category, DeliveryCharge, Order, OrderStatus } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Facial Kit', slug: 'facial-kit' },
  { id: '2', name: 'Serum', slug: 'serum' },
  { id: '3', name: 'Cream', slug: 'cream' },
  { id: '4', name: 'Cleanser', slug: 'cleanser' },
  { id: '5', name: 'AI Services', slug: 'ai-services' },
  { id: '6', name: 'Websites', slug: 'websites' },
  { id: '7', name: 'Digital Products', slug: 'digital-products' }
];

const INITIAL_DELIVERY: DeliveryCharge[] = [
  { id: '1', city: 'Lahore', charge: 200 },
  { id: '2', city: 'Karachi', charge: 350 },
  { id: '3', city: 'Islamabad', charge: 250 },
  { id: '4', city: 'Other Cities', charge: 500 }
];

export const transformDriveUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return url;
};

export const ProductService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
    return INITIAL_CATEGORIES;
  },

  saveCategory: async (category: Category): Promise<boolean> => {
    const id = category.id || Date.now().toString();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, id })
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to save category", e);
      return false;
    }
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error("Failed to delete category", e);
      return false;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((p: Product) => ({
          ...p,
          image: transformDriveUrl(p.image),
          images: (p.images || []).map(transformDriveUrl)
        }));
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
    return INITIAL_PRODUCTS.map(p => ({
      ...p,
      image: transformDriveUrl(p.image),
      images: (p.images || []).map(transformDriveUrl)
    }));
  },

  saveProduct: async (product: Product): Promise<boolean> => {
    const id = product.id || Date.now().toString();
    const newProduct = {
      ...product,
      id,
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 0,
      reviews: product.reviews || [],
      benefits: product.benefits || [],
      images: product.images || []
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to save product", e);
      return false;
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error("Failed to delete product", e);
      return false;
    }
  },

  getDeliveryCharges: async (): Promise<DeliveryCharge[]> => {
    try {
      const res = await fetch('/api/delivery-charges', { cache: 'no-store' });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (data && data.length > 0) return data;
      return INITIAL_DELIVERY;
    } catch (e) {
      console.warn("Failed to fetch delivery charges, using initial data", e);
      return INITIAL_DELIVERY;
    }
  },

  saveDeliveryCharges: async (charges: DeliveryCharge[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/delivery-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charges)
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to save delivery charges", e);
      return false;
    }
  }
};

export const OrderService = {
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch orders:", e);
      return [];
    }
  },

  saveOrder: async (order: Order): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        console.log(`[DB SYNC] Order ${order.id} persisted to MySQL.`);
      }
      return res.ok;
    } catch (err) {
      console.error('[DB SYNC ERROR] Failed to save order to MySQL.', err);
      return false;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status })
      });
      return res.ok;
    } catch (err) {
      console.error('[DB UPDATE ERROR] MySQL status update failed.', err);
      return false;
    }
  },

  getOrderByTracking: async (id: string, email: string): Promise<Order | null> => {
    try {
      const orders = await OrderService.getOrders();
      return orders.find(o => o.id === id && o.customerEmail.toLowerCase() === email.toLowerCase()) || null;
    } catch (e) {
      console.error("Failed to find order by tracking", e);
      return null;
    }
  }
};
