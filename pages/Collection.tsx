
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductService } from '../services/ProductService';

interface CollectionProps {
  addToCart: (p: Product) => void;
}

const Collection: React.FC<CollectionProps> = ({ addToCart }) => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState(initialCat);
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const loadData = async () => {
      const [pData, cData] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getCategories()
      ]);
      setProducts(pData);
      setCategories(cData);
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);
    
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    
    return result;
  }, [filterCat, sort, products]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-serif mb-4 uppercase tracking-tighter">The Collection</h1>
          <p className="text-brand-charcoal/60 max-w-2xl text-sm leading-relaxed tracking-wide italic">
            Artisanal creations tailored for the divine spirit. Explore our curated selection of essentials and digital mastery.
          </p>
        </header>

        {/* Dynamic Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-y border-brand-pink mb-12 gap-6 bg-white/30 backdrop-blur-sm px-4 rounded-sm">
          <div className="flex gap-3 items-center overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar no-scrollbar">
            <button
              onClick={() => setFilterCat('all')}
              className={`text-[9px] uppercase tracking-[0.2em] font-bold px-5 py-2.5 border rounded-full transition-all whitespace-nowrap
                ${filterCat === 'all' ? 'bg-brand-gold text-white border-brand-gold' : 'border-brand-pink text-brand-charcoal/60 hover:border-brand-gold'}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.slug)}
                className={`text-[9px] uppercase tracking-[0.2em] font-bold px-5 py-2.5 border rounded-full transition-all whitespace-nowrap
                  ${filterCat === cat.slug ? 'bg-brand-gold text-white border-brand-gold' : 'border-brand-pink text-brand-charcoal/60 hover:border-brand-gold'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-brand-pink pt-4 md:pt-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/40">Sort By</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-[10px] uppercase tracking-widest font-bold focus:outline-none cursor-pointer pr-4 border-b border-brand-gold pb-1"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} onAddToCart={addToCart} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={24} className="text-brand-gold opacity-40" />
            </div>
            <p className="text-xl font-serif italic text-brand-charcoal/40">Our artisans are crafting new treasures for this collection...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
