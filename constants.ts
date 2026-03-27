
import { Product, Review } from './types';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Eleanor V.',
    email: 'eleanor@example.com',
    rating: 5,
    comment: 'The texture is divine. My skin has never felt so luminous and hydrated.',
    date: '2024-03-15'
  },
  {
    id: 'r2',
    name: 'Julian S.',
    email: 'julian@example.com',
    rating: 4,
    comment: 'Exquisite packaging and even better results. Highly recommend for sensitive skin.',
    date: '2024-03-10'
  }
];

export const PRODUCTS: Product[] = [
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
    reviews: [...MOCK_REVIEWS],
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
    reviews: [...MOCK_REVIEWS],
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
    reviews: [...MOCK_REVIEWS],
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
    reviews: [...MOCK_REVIEWS],
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
    reviews: [...MOCK_REVIEWS],
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
    reviews: [...MOCK_REVIEWS],
    variants: ['15ml'],
    skinType: ['Normal', 'Dry']
  }
];
