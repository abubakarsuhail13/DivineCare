
import React from 'react';
import { motion } from 'framer-motion';

const Philosophy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-16">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Our Philosophy</h1>
          <p className="text-sm text-brand-charcoal/60 leading-relaxed">
            We believe that true beauty stems from purity, harmony, and a deep reverence for nature. Every product we create is an ode to your authentic self.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-serif text-brand-gold">Ethical Alchemy</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            Our formulations are crafted with ethically sourced botanicals, completely cruelty-free, and formulated without harsh chemicals. We work closely with sustainable farms to ensure every drop is as kind to the earth as it is to your skin.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-serif text-brand-gold">The Power of Ritual</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            Skincare is more than a routine; it is a sacred moment of self-connection. Our textures, scents, and experiences are intentionally designed to ground you, providing a moment of calm amidst the chaos of modern life.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-pink p-8 text-center rounded-sm"
        >
          <h3 className="text-xl font-serif mb-4 italic">"Nature is the greatest artisan. We simply bottle her masterpieces."</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold">— The Divine Beauty Team</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Philosophy;
