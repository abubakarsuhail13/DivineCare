
export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  benefits: string[];
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  variants?: string[];
  skinType?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

export interface DeliveryCharge {
  id: string;
  city: string;
  charge: number;
}

export type OrderStatus = 'Proceed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: CartItem[];
  paymentMethod: string;
}
