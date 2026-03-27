
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { transformDriveUrl } from '../services/ProductService';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const displayImage = transformDriveUrl(product.image);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-brand-pink aspect-[4/5] relative rounded-sm shadow-sm">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x600?text=Invalid+Image+URL';
          }}
        />
        <div className="absolute inset-0 bg-brand-charcoal/0 group-hover:bg-brand-charcoal/5 transition-colors duration-500" />
        
        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="w-full bg-white/90 backdrop-blur-md py-3.5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-charcoal hover:text-white transition-all shadow-xl"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>
      </Link>

      <div className="mt-5 flex flex-col items-center text-center px-2 flex-grow">
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "#C5A059" : "none"} color="#C5A059" />
          ))}
        </div>
        <Link to={`/product/${product.id}`} className="text-xs font-bold hover:text-brand-gold transition-colors mb-2 uppercase tracking-[0.15em] line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </Link>
        <div className="mt-auto">
          <span className="text-sm font-serif font-bold text-brand-gold">Rs. {product.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
