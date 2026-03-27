
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Package, MapPin, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';

interface OrderDetails {
  items: CartItem[];
  total: number;
  orderNumber: string;
  shippingAddress: string;
  customerEmail: string;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails as OrderDetails;
  const emailStatus = location.state?.emailStatus as string;
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (emailStatus) {
      const timer = setTimeout(() => setShowNotification(true), 1500);
      const hideTimer = setTimeout(() => setShowNotification(false), 8500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [emailStatus]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-brand-cream overflow-hidden relative">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 z-[100] max-w-sm w-full"
          >
            <div className="bg-white border border-brand-gold shadow-2xl p-5 flex gap-4 items-start rounded-sm">
              <div className={`p-2 rounded-full ${emailStatus === 'sent' ? 'bg-brand-pink text-brand-gold' : 'bg-red-50 text-red-600'}`}>
                {emailStatus === 'sent' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-1">
                  {emailStatus === 'sent' ? 'Ritual Dispatched' : 'Ritual Delayed'}
                </h4>
                <p className="text-[10px] text-brand-charcoal/60 leading-relaxed uppercase tracking-widest">
                  {emailStatus === 'sent' 
                    ? `A divine confirmation has been sent to ${orderDetails?.customerEmail}.` 
                    : "We encountered a ripple in the digital essence. Our artisans are manually verifying your order."
                  }
                </p>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-brand-charcoal/40 hover:text-brand-charcoal">
                <Mail size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-pink/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-lavender/30 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold text-white rounded-full mb-8 shadow-2xl relative">
            <Sparkles size={32} className="animate-pulse" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-brand-gold rounded-full"
            />
          </div>

          <h1 className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold mb-4">Ceremony Complete</h1>
          <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight italic">
            Your Radiance Awaits
          </h2>
          
          <p className="text-brand-charcoal/60 text-sm leading-relaxed tracking-wide mb-8 max-w-lg mx-auto italic">
            "The ritual of self-care is a tribute to your divine presence. We are carefully preparing your treasures with love and intention."
          </p>
        </motion.div>

        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <div className="bg-white border border-brand-pink p-8 rounded-sm shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-brand-gold">
                <Package size={18} />
                <h3 className="text-[10px] uppercase tracking-widest font-bold">Your Selection</h3>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center border-b border-brand-pink/50 pb-4 last:border-0">
                    <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-sm bg-brand-pink" />
                    <div className="flex-grow">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold truncate max-w-[150px]">{item.name}</h4>
                      <p className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-serif font-bold text-brand-gold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-brand-pink flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold">Divine Total</span>
                <span className="text-xl font-serif font-bold text-brand-gold">Rs. {orderDetails.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-brand-pink p-8 rounded-sm shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-brand-gold">
                <MapPin size={18} />
                <h3 className="text-[10px] uppercase tracking-widest font-bold">Arrival Ritual</h3>
              </div>
              <div className="flex-grow">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/40 mb-2">Order Reference</p>
                <p className="text-lg font-serif tracking-widest uppercase mb-8">{orderDetails.orderNumber}</p>
                
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/40 mb-2">Shipping To</p>
                <p className="text-sm leading-relaxed text-brand-charcoal/70 mb-8 italic">
                  {orderDetails.shippingAddress}
                </p>
                
                <div className="mt-auto bg-brand-pink/30 p-4 rounded-sm">
                  <p className="text-[9px] uppercase tracking-widest text-center text-brand-rosegold font-bold">
                    {emailStatus === 'sent' 
                      ? "A confirmation email has been sent to your spiritual inbox."
                      : "We are processing your confirmation manually."
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/collection"
            className="bg-brand-charcoal text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            Continue Journey
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/"
            className="border border-brand-pink px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-pink transition-all flex items-center justify-center gap-2"
          >
            <Heart size={14} className="text-brand-gold" />
            Home Ritual
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
