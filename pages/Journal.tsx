
import React from 'react';
import { motion } from 'framer-motion';

const ARTICLES = [
  {
    id: 1,
    title: 'The Art of Layering Skincare',
    date: 'March 15, 2024',
    category: 'Rituals',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Unlock the full potential of your products by mastering the divine sequence of application...'
  },
  {
    id: 2,
    title: 'Why Botanical Alchemy Matters',
    date: 'March 02, 2024',
    category: 'Ingredients',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Explore how natural, ethically sourced ingredients blend with modern science to rejuvenate your skin.'
  },
  {
    id: 3,
    title: 'A Nighttime Routine for Radiant Mornings',
    date: 'February 18, 2024',
    category: 'Guides',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Your skin repairs itself while you sleep. Here is how to create a nighttime ritual for ultimate hydration.'
  }
];

const Journal: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">The Divine Journal</h1>
          <p className="text-sm text-brand-charcoal/60 italic uppercase tracking-widest">Musings on beauty, purity, and mindful rituals.</p>
        </header>

        <div className="space-y-16">
          {ARTICLES.map((article, idx) => (
            <motion.article 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col md:flex-row gap-8 items-center group cursor-pointer"
            >
              <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden bg-brand-pink rounded-sm">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex gap-4 items-center text-[10px] uppercase tracking-widest font-bold text-brand-gold">
                  <span>{article.category}</span>
                  <span className="w-1 h-1 bg-brand-pink rounded-full"></span>
                  <span className="text-brand-charcoal/40">{article.date}</span>
                </div>
                <h2 className="text-2xl font-serif group-hover:text-brand-gold transition-colors">{article.title}</h2>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">{article.excerpt}</p>
                <div className="pt-4">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-charcoal pb-1 group-hover:border-brand-gold transition-colors">Read More</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;
