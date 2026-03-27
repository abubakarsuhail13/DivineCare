
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Lock } from 'lucide-react';
import { subscribeToNewsletter } from '../emailService';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const result = await subscribeToNewsletter(email);
    
    if (result.success) {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <footer className="bg-brand-pink pt-20 pb-10 px-6 border-t border-brand-rosegold/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif tracking-tighter">DIVINE BEAUTY</h2>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            Elevating your skincare ritual with ethically sourced ingredients and divine formulations that honor your natural beauty.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/divinebeautyofficialpage/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-brand-rosegold flex items-center justify-center hover:bg-brand-rosegold hover:text-white transition-all"><Instagram size={18} /></a>
            <a href="https://www.facebook.com/divinebeautyofficialpage" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-brand-rosegold flex items-center justify-center hover:bg-brand-rosegold hover:text-white transition-all"><Facebook size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full border border-brand-rosegold flex items-center justify-center hover:bg-brand-rosegold hover:text-white transition-all"><Twitter size={18} /></a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold uppercase tracking-widest text-xs mb-6">Explore</h3>
          <ul className="space-y-4 text-sm text-brand-charcoal/70">
            <li><Link to="/collection" className="hover:text-brand-gold">Shop All</Link></li>
            <li><Link to="/#best-sellers" className="hover:text-brand-gold">Best Sellers</Link></li>
            <li><Link to="/philosophy" className="hover:text-brand-gold">Our Philosophy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold uppercase tracking-widest text-xs mb-6">Concierge</h3>
          <ul className="space-y-4 text-sm text-brand-charcoal/70">
            <li><Link to="/track-order" className="hover:text-brand-gold">Track Order</Link></li>
            <li><Link to="/shipping" className="hover:text-brand-gold">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-brand-gold">Returns & Exchanges</Link></li>
            <li><Link to="/admin/login" className="flex items-center gap-2 hover:text-brand-gold"><Lock size={12} /> Admin Portal</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="font-semibold uppercase tracking-widest text-xs mb-6">Newsletter</h3>
          <p className="text-sm text-brand-charcoal/70">Join the Divine Circle for exclusive early access and skincare tips.</p>
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              placeholder="Email address"
              className="w-full bg-transparent border-b border-brand-charcoal/30 py-2 focus:outline-none focus:border-brand-gold text-sm disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="absolute right-0 top-1/2 -translate-y-1/2 uppercase tracking-widest text-[10px] font-bold text-brand-gold disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining...' : 'Join'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-[10px] text-brand-gold mt-2 font-bold uppercase tracking-widest">
              Welcome to the Divine Circle.
            </p>
          )}
          {status === 'error' && (
            <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest">
              Failed to join. Please try again later.
            </p>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-brand-charcoal/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/50">
        <p>© 2026 Divine Beauty. All rights reserved.</p>
        <p>
          Powered by{' '}
          <a 
            href="https://www.nexaforgetech.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-brand-gold hover:text-brand-rosegold transition-colors font-bold"
          >
            Nexaforge Technologies
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
