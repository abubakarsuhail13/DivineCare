
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CartItem } from '../types';

interface CartDrawerProps {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onRemove: (id: string, variant?: string) => void;
  onUpdateQuantity: (id: string, delta: number, variant?: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ cart, total, onClose, onRemove, onUpdateQuantity }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-brand-pink flex justify-between items-center bg-brand-cream">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-gold" />
            <h2 className="text-xl font-serif font-bold">Your Bag ({cart.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-pink rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8 scroll-smooth">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-brand-rosegold" />
              </div>
              <p className="font-serif text-xl italic text-brand-charcoal/50">Your bag is as empty as a morning dew...</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-brand-gold text-white text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all"
              >
                Shop the Collection
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-4 group">
                <div className="w-24 h-32 flex-shrink-0 bg-brand-pink overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wider">{item.name}</h3>
                      {item.selectedVariant && <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest mt-1">{item.selectedVariant}</p>}
                    </div>
                    <button
                      onClick={() => onRemove(item.id, item.selectedVariant)}
                      className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex items-center border border-brand-pink">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1, item.selectedVariant)}
                        className="p-2 hover:bg-brand-pink"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1, item.selectedVariant)}
                        className="p-2 hover:bg-brand-pink"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-serif font-bold text-brand-gold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-brand-pink/50 border-t border-brand-pink space-y-6">
            <div className="flex justify-between items-center text-sm font-medium uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-xl font-serif font-bold text-brand-gold">Rs. {total.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-brand-charcoal/50 text-center uppercase tracking-widest italic">
              Complimentary shipping on orders over Rs. 15,000
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-brand-charcoal text-white py-4 flex items-center justify-center gap-2 group hover:gap-4 transition-all"
              >
                <span className="text-xs uppercase tracking-[0.2em] font-bold">Secure Checkout</span>
                <ArrowRight size={16} />
              </button>
              <button onClick={onClose} className="w-full text-[10px] uppercase tracking-widest font-bold py-2 hover:text-brand-gold transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CartDrawer;
