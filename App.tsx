
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Product, CartItem } from './types';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminResetPassword from './pages/AdminResetPassword';
import Journal from './pages/Journal';
import Philosophy from './pages/Philosophy';
import TrackOrder from './pages/TrackOrder';
import ShippingPolicy from './pages/ShippingPolicy';
import Returns from './pages/Returns';
import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdvisorWidget from './components/AdvisorWidget';
import ScrollToTop from './components/ScrollToTop';
import { ProductService } from './services/ProductService';

const RouteScrollRestoration = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize dynamic products
  useEffect(() => {
    const loadProducts = async () => {
      await ProductService.getProducts();
    };
    loadProducts();
  }, []);

  const addToCart = (product: Product, quantity: number = 1, variant?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedVariant === variant);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedVariant === variant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedVariant === variant)));
  };

  const updateQuantity = (productId: string, delta: number, variant?: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedVariant === variant) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <Router>
      <RouteScrollRestoration />
      <div className="min-h-screen flex flex-col font-sans text-brand-charcoal bg-brand-cream selection:bg-brand-rosegold selection:text-white">
        <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/collection" element={<Collection addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route path="/checkout" element={<Checkout cart={cart} total={cartTotal} clearCart={clearCart} />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/philosophy" element={<Philosophy />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/returns" element={<Returns />} />
          </Routes>
        </main>

        <Footer />

        <AnimatePresence>
          {isCartOpen && (
            <CartDrawer
              cart={cart}
              total={cartTotal}
              onClose={() => setIsCartOpen(false)}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          )}
        </AnimatePresence>

        <ScrollToTop />
        <AdvisorWidget />
      </div>
    </Router>
  );
};

export default App;
