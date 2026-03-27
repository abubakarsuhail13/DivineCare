import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Leaf, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductService, transformDriveUrl } from '../services/ProductService';

interface HomeProps {
  addToCart: (p: Product) => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    type: 'image',
    media: "https://drive.google.com/file/d/17yqWNVhnR6eDPcwr30COHjsxZ5pjQj6R/view?usp=drive_link",
    subtitle: "Pure Essence. Divine Glow.",
    titleMain: "Reveal Your",
    titleItalic: "Inner Radiance",
    cta: "Shop Divine Kits",
    link: "/collection?cat=facial-kit"
  },
  {
    id: 2,
    type: 'image',
    media: "https://drive.google.com/file/d/17M37y8IBs_UBG1z7-f7AIYn_8XKcU8l2/view?usp=drive_link",
    subtitle: "Botanical Alchemy.",
    titleMain: "Awaken Your",
    titleItalic: "Natural Youth",
    cta: "Discover Serums",
    link: "/collection?cat=serum"
  },
  {
    id: 3,
    type: 'image',
    media: "https://drive.google.com/file/d/13eCfCFZdYrwoapUXsurfh4D4iJflHLva/view?usp=drive_link",
    subtitle: "The Divine Ritual.",
    titleMain: "Elevate Your",
    titleItalic: "Daily Skincare",
    cta: "Explore Essentials",
    link: "/collection"
  }
];

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider Refs
  const categoriesRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);

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

  // Derive dynamic categories using the image of the first product in each category (or a fallback)
  const dynamicCategories = categories.map(cat => {
    const firstProduct = products.find(p => p.category === cat.slug);
    return {
      id: cat.id,
      title: cat.name,
      link: `/collection?cat=${cat.slug}`,
      img: firstProduct?.image ? transformDriveUrl(firstProduct.image) : 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800'
    };
  });

  // Derive best sellers by sorting products by rating and review count
  const bestSellers = [...products]
    .sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount))
    .slice(0, 8);

  // Auto-play slider effect for hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  // Horizontal Scroll Handler for Sections
  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = window.innerWidth > 768 ? ref.current.offsetWidth / 2 : ref.current.offsetWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Animation Variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const fadeInScale: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Slider Section */}
      <section className="relative h-screen bg-brand-charcoal overflow-hidden">
        <AnimatePresence initial={false}>
          {HERO_SLIDES.map((slide, idx) => (
            idx === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center pt-20"
              >
                {/* Background Media & Overlay */}
                {slide.type === 'video' ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    src={transformDriveUrl(slide.media)}
                  />
                ) : (
                  <img
                    src={transformDriveUrl(slide.media)}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={`Divine Skincare Slide ${idx + 1}`}
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Content */}
                <div className="relative z-10 text-center text-white px-6 w-full max-w-5xl mx-auto">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                    className="uppercase tracking-[0.4em] text-xs mb-4 font-bold drop-shadow-md"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
                    className="text-5xl md:text-8xl font-serif mb-8 max-w-4xl mx-auto leading-tight drop-shadow-lg"
                  >
                    {slide.titleMain} <br /> <span className="italic">{slide.titleItalic}</span>
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  >
                    <Link
                      to={slide.link}
                      className="bg-brand-gold px-12 py-5 text-sm uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-brand-gold transition-all duration-300 inline-block shadow-xl"
                    >
                      {slide.cta}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Slider Controls - Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Previous slide"
        >
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors p-2"
          aria-label="Next slide"
        >
          <ChevronRight size={48} strokeWidth={1} />
        </button>

        {/* Slider Controls - Dot Indicators */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                currentSlide === idx ? 'bg-brand-gold scale-150' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-brand-pink py-16 px-6">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: <CheckCircle className="text-brand-gold" size={24} />, text: 'Dermatologist Approved' },
            { icon: <Leaf className="text-brand-gold" size={24} />, text: 'Cruelty Free & Vegan' },
            { icon: <Sparkles className="text-brand-gold" size={24} />, text: 'Natural Ingredients' },
            { icon: <Heart className="text-brand-gold" size={24} />, text: 'Ethically Sourced' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="bg-white/50 p-4 rounded-full shadow-sm">{item.icon}</div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-charcoal/70">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Collections Slider */}
      <section className="py-24 px-6 bg-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="max-w-xl">
              <h2 className="text-sm uppercase tracking-[0.4em] text-brand-gold font-bold mb-4">Categories</h2>
              <h3 className="text-4xl md:text-5xl font-serif">Curated for Your Needs</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <button onClick={() => scrollContainer(categoriesRef, 'left')} className="p-3 border border-brand-pink rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors shadow-sm bg-white">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollContainer(categoriesRef, 'right')} className="p-3 border border-brand-pink rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors shadow-sm bg-white">
                  <ChevronRight size={20} />
                </button>
              </div>
              <Link to="/collection" className="group hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-bold border-b border-brand-charcoal py-2">
                See All <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            ref={categoriesRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8 -mx-6 px-6 md:mx-0 md:px-0"
          >
            {dynamicCategories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={fadeInScale}
                className="shrink-0 w-[85vw] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-start group relative h-[500px] overflow-hidden bg-brand-pink rounded-sm"
              >
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
                  <h4 className="text-3xl font-serif text-white mb-4">{cat.title}</h4>
                  <Link to={cat.link} className="w-fit px-6 py-2 glass text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-all">
                    Explore
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/collection" className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold border-b border-brand-charcoal py-2">
              See All Categories <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Slider */}
      <section id="best-sellers" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="max-w-xl md:text-left">
              <h2 className="text-sm uppercase tracking-[0.4em] text-brand-gold font-bold mb-4">Highly Coveted</h2>
              <h3 className="text-4xl md:text-5xl font-serif">Our Best Sellers</h3>
            </div>
            <div className="flex gap-2 self-start md:self-auto">
              <button onClick={() => scrollContainer(bestSellersRef, 'left')} className="p-3 border border-brand-pink rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors shadow-sm bg-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollContainer(bestSellersRef, 'right')} className="p-3 border border-brand-pink rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors shadow-sm bg-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            ref={bestSellersRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-12 -mx-6 px-6 md:mx-0 md:px-0"
          >
            {bestSellers.map((product) => (
              <motion.div 
                key={product.id} 
                variants={fadeInUp}
                className="shrink-0 w-[75vw] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] snap-start"
              >
                <ProductCard product={product} onAddToCart={addToCart} />
              </motion.div>
            ))}
            {bestSellers.length === 0 && (
               <div className="w-full text-center py-12">
                 <p className="font-serif italic text-brand-charcoal/50">Our treasures are currently being restocked...</p>
               </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section 
        className="relative py-40 px-6 bg-fixed bg-center bg-cover flex items-center justify-center min-h-[60vh]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=2000")' }}
      >
        <div className="absolute inset-0 bg-brand-charcoal/40" />
        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <Sparkles className="mx-auto mb-8 text-brand-gold opacity-80" size={32} />
            <h3 className="text-4xl md:text-6xl font-serif leading-tight italic drop-shadow-lg px-4">
              "Beauty begins the moment you decide to be yourself, nurtured by the divine."
            </h3>
            <p className="mt-8 text-sm uppercase tracking-[0.4em] text-brand-gold font-bold drop-shadow-md">
              Divine Beauty Manifesto
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
