import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => setIsAdmin(!!localStorage.getItem('admin_session'));
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  // Determine dynamic styling based on route, scroll, and menu state
  const isHome = location.pathname === '/';
  const isSolid = scrolled || isOpen;
  const isTransparentDark = isHome && !isSolid;
  
  const navBgClass = isSolid
    ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' 
    : (isHome ? 'bg-gradient-to-b from-black/70 via-black/20 to-transparent py-6' : 'bg-transparent py-6');
    
  const textColorClass = isTransparentDark ? 'text-white' : 'text-brand-charcoal';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBgClass} ${textColorClass}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Left Navigation */}
        <div className="hidden lg:flex gap-8 text-[11px] font-medium uppercase tracking-widest items-center">
          <Link to="/" className={`hover:text-brand-gold transition-colors ${location.pathname === '/' ? 'text-brand-gold' : ''}`}>Home</Link>
          <Link to="/collection" className={`hover:text-brand-gold transition-colors ${location.pathname === '/collection' ? 'text-brand-gold' : ''}`}>Shop All</Link>
          <Link to="/collection?cat=facial-kit" className="hover:text-brand-gold transition-colors">Kits</Link>
          <Link to="/philosophy" className={`hover:text-brand-gold transition-colors ${location.pathname === '/philosophy' ? 'text-brand-gold' : ''}`}>Our Philosophy</Link>
        </div>

        {/* Centered Logo */}
        <Link to="/" className="text-2xl md:text-3xl font-serif tracking-tighter lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          DIVINE BEAUTY
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="hidden sm:block text-[10px] uppercase tracking-widest font-bold hover:text-brand-gold transition-colors">Search</button>
          
          <button onClick={onCartClick} className="relative group p-1">
            <ShoppingBag className="group-hover:text-brand-gold transition-colors" size={22} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <div className={`h-4 w-[1px] mx-1 hidden sm:block ${isTransparentDark ? 'bg-white/30' : 'bg-brand-pink'}`}></div>

          <Link 
            to={isAdmin ? "/admin/dashboard" : "/admin/login"} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all border ${isAdmin ? 'bg-brand-gold/10 border-brand-gold text-brand-gold' : 'border-transparent hover:text-brand-gold'}`}
          >
            <Lock size={14} />
            <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold">
              Admin Portal
            </span>
            {isAdmin && <span className="md:hidden text-[10px] uppercase font-bold tracking-widest">Portal</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white text-brand-charcoal border-t border-brand-pink overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-8 gap-6 text-center" onClick={() => setIsOpen(false)}>
              <Link to="/" className="text-lg font-serif hover:text-brand-gold transition-colors">Home Ritual</Link>
              <Link to="/collection" className="text-lg font-serif hover:text-brand-gold transition-colors">The Collection</Link>
              <Link to="/collection?cat=facial-kit" className="text-lg font-serif hover:text-brand-gold transition-colors">Facial Kits</Link>
              <Link to="/collection?cat=serum" className="text-lg font-serif hover:text-brand-gold transition-colors">Serums</Link>
              <Link to="/philosophy" className="text-lg font-serif hover:text-brand-gold transition-colors">Our Philosophy</Link>
              
              <div className="w-full h-px bg-brand-pink mx-auto my-2"></div>
              
              <Link 
                to={isAdmin ? "/admin/dashboard" : "/admin/login"} 
                className="flex items-center justify-center gap-2 text-brand-gold font-bold uppercase tracking-[0.2em] text-[11px] py-4 border border-brand-gold/20 bg-brand-gold/5 rounded-sm"
              >
                <Lock size={16} />
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
