
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle, Truck, Clock, XCircle, Home } from 'lucide-react';
import { OrderService } from '../services/ProductService';
import { Order, OrderStatus } from '../types';

const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    
    setStatus('loading');
    try {
      const foundOrder = await OrderService.getOrderByTracking(orderId, email);
      if (foundOrder) {
        setOrder(foundOrder);
        setStatus('found');
      } else {
        setStatus('not-found');
      }
    } catch (error) {
      console.error("Tracking error", error);
      setStatus('not-found');
    }
  };

  const getStatusIndex = (currentStatus: OrderStatus) => {
    switch(currentStatus) {
      case 'Proceed': return 1;
      case 'Preparing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-brand-cream">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Track Your Ritual</h1>
          <p className="text-sm text-brand-charcoal/60">Enter your order details below to see the status of your treasures.</p>
        </header>

        <div className="bg-white p-8 md:p-10 border border-brand-pink shadow-sm rounded-sm">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Order Number</label>
              <input 
                type="text" 
                required
                placeholder="e.g. DB-123456"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full bg-brand-pink/20 border border-transparent py-4 px-6 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="Email used during checkout"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-brand-pink/20 border border-transparent py-4 px-6 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-colors"
              />
            </div>
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-xs font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {status === 'loading' ? 'Searching...' : 'Track Order'}
              {!status && <Search size={16} />}
            </button>
            
            {status === 'not-found' && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center mt-4">
                No active order found with these details. Please verify your ID and email.
              </p>
            )}
          </form>

          {status === 'found' && order && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-10 pt-10 border-t border-brand-pink"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Package size={24} className="text-brand-gold" />
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-sm">Order {order.id}</h3>
                    <p className="text-[10px] text-brand-charcoal/60 uppercase tracking-widest mt-1">Status: {order.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-serif font-bold text-brand-gold">Rs. {order.total.toLocaleString()}</p>
                  <p className="text-[9px] text-brand-charcoal/40 uppercase tracking-widest mt-1">{new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>

              {order.status === 'Cancelled' ? (
                <div className="bg-red-50 border border-red-100 p-6 rounded-sm flex items-center gap-4">
                  <XCircle size={24} className="text-red-400" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-red-700">Order Cancelled</h4>
                    <p className="text-[10px] text-red-500/80 mt-1">This ritual has been discontinued. Please contact support for details.</p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-brand-pink space-y-8">
                  {/* Step 1: Proceed (was Processing) */}
                  <div className={`relative transition-opacity duration-300 ${getStatusIndex(order.status) >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[31px] rounded-full p-1 ${getStatusIndex(order.status) >= 1 ? 'bg-brand-gold text-white' : 'bg-brand-pink text-brand-charcoal'}`}>
                      <CheckCircle size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">Order Confirmed</h4>
                    <p className="text-[10px] text-brand-charcoal/50 mt-1">We have received your order request.</p>
                  </div>
                  
                  {/* Step 2: Preparing */}
                  <div className={`relative transition-opacity duration-300 ${getStatusIndex(order.status) >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[31px] rounded-full p-1 ${getStatusIndex(order.status) >= 2 ? 'bg-brand-gold text-white' : 'bg-brand-pink text-brand-charcoal'}`}>
                      <Clock size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">Preparing Ritual</h4>
                    <p className="text-[10px] text-brand-charcoal/50 mt-1">Our artisans are carefully packing your items.</p>
                  </div>
                  
                  {/* Step 3: Shipped */}
                  <div className={`relative transition-opacity duration-300 ${getStatusIndex(order.status) >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[31px] rounded-full p-1 ${getStatusIndex(order.status) >= 3 ? 'bg-brand-gold text-white' : 'bg-brand-pink text-brand-charcoal'}`}>
                      <Truck size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">Out for Delivery</h4>
                    <p className="text-[10px] text-brand-charcoal/50 mt-1">Your treasures are on the way to you.</p>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`relative transition-opacity duration-300 ${getStatusIndex(order.status) >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[31px] rounded-full p-1 ${getStatusIndex(order.status) >= 4 ? 'bg-brand-gold text-white' : 'bg-brand-pink text-brand-charcoal'}`}>
                      <Home size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest">Delivered</h4>
                    <p className="text-[10px] text-brand-charcoal/50 mt-1">Your package has successfully arrived.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
