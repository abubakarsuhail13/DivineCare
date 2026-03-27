
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, Heart, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Review } from '../types';
import { ProductService, transformDriveUrl } from '../services/ProductService';

interface ProductDetailProps {
  addToCart: (p: Product, q: number, v?: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [activeImg, setActiveImg] = useState(0);

  // Zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Review states
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      const products = await ProductService.getProducts();
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setSelectedVariant(found.variants?.[0]);
        setLocalReviews(found.reviews || []);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) return (
    <div className="h-screen flex items-center justify-center">
      <p className="font-serif text-2xl italic">Divine secret not found...</p>
    </div>
  );

  const displayImage = transformDriveUrl(product.image);
  const galleryImages = product.images?.length ? product.images.map(transformDriveUrl) : [displayImage, displayImage, displayImage, displayImage];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const review: Review = {
      id: Math.random().toString(36).substr(2, 9),
      name: newReview.name,
      email: newReview.email,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [review, ...localReviews];
    setLocalReviews(updatedReviews);

    // Persist the new review back to the product via ProductService
    if (product) {
      const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
      const updatedProduct = {
        ...product,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: newRating
      };
      await ProductService.saveProduct(updatedProduct);
      setProduct(updatedProduct);
    }

    setNewReview({ name: '', email: '', rating: 5, comment: '' });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-12 flex gap-2 text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-bold">
          <Link to="/" className="hover:text-brand-gold">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-brand-gold">Collection</Link>
          <span>/</span>
          <span className="text-brand-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/5] bg-brand-pink overflow-hidden rounded-sm relative cursor-zoom-in"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZooming(!isZooming)}
            >
              <img 
                src={galleryImages[activeImg] || displayImage} 
                alt={product.name} 
                className="w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out"
                style={{
                  transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`aspect-square overflow-hidden border-2 rounded-sm transition-all group ${activeImg === idx ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "#C5A059" : "none"} color="#C5A059" />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-charcoal/50">({product.reviewsCount} Reviews)</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{product.name}</h1>
            <p className="text-2xl font-serif text-brand-gold mb-8">Rs. {product.price.toLocaleString()}</p>
            
            <p className="text-sm leading-relaxed text-brand-charcoal/70 mb-8 border-l-2 border-brand-pink pl-6">
              {product.description}
            </p>

            <div className="space-y-8 mb-10">
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">Select Option</h4>
                  <div className="flex gap-4">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-6 py-2 text-xs uppercase tracking-widest font-bold border rounded-sm transition-all
                          ${selectedVariant === variant ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'border-brand-pink text-brand-charcoal hover:border-brand-gold'}`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">Quantity</h4>
                <div className="flex items-center border border-brand-pink w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-brand-pink"><Minus size={14} /></button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-brand-pink"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => addToCart(product, quantity, selectedVariant)}
                className="flex-grow bg-brand-charcoal text-white py-5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all shadow-lg"
              >
                Add to Cart
              </button>
              <button className="flex items-center justify-center gap-2 border border-brand-pink px-8 py-5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-pink transition-all">
                <Heart size={18} />
                <span className="sm:hidden lg:inline">Wishlist</span>
              </button>
            </div>

            <div className="space-y-4 pt-10 border-t border-brand-pink">
              <div className="flex items-center gap-4 text-sm">
                <ShieldCheck size={20} className="text-brand-rosegold" />
                <span className="uppercase tracking-widest text-[10px] font-bold">100% Purity Guaranteed</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Truck size={20} className="text-brand-rosegold" />
                <span className="uppercase tracking-widest text-[10px] font-bold">Complimentary Express Shipping above Rs. 15,000</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <RefreshCw size={20} className="text-brand-rosegold" />
                <span className="uppercase tracking-widest text-[10px] font-bold">30-Day Ritual Returns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-sm uppercase tracking-[0.4em] text-brand-gold font-bold mb-4">Efficacy</h2>
            <h3 className="text-4xl font-serif">Why it's Divine</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {product.benefits && product.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-brand-pink/30 p-10 rounded-sm text-center">
                <div className="text-brand-gold mb-4 font-serif text-4xl">0{idx + 1}</div>
                <p className="text-sm uppercase tracking-widest font-bold text-brand-charcoal">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-32 pt-32 border-t border-brand-pink">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <div className="mb-12">
                <h2 className="text-sm uppercase tracking-[0.4em] text-brand-gold font-bold mb-4">Patron Appraisals</h2>
                <h3 className="text-4xl font-serif">Whispers of Beauty</h3>
              </div>

              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {localReviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-brand-pink pb-8"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{review.name}</h4>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < review.rating ? "#C5A059" : "none"} color="#C5A059" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-bold">{review.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-brand-charcoal/70 italic">
                        "{review.comment}"
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {localReviews.length === 0 && (
                  <p className="text-sm text-brand-charcoal/40 italic">Be the first to share your experience...</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-pink/20 p-8 md:p-12 rounded-sm border border-brand-pink sticky top-32">
                <h4 className="text-xl font-serif mb-2">Share Your Experience</h4>
                <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mb-8">Join the Divine Circle</p>

                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            fill={star <= newReview.rating ? "#C5A059" : "none"}
                            color="#C5A059"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-brand-pink py-3 px-4 text-xs focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={newReview.email}
                      onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full bg-white border border-brand-pink py-3 px-4 text-xs focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Describe your experience with this divine formulation..."
                      className="w-full bg-white border border-brand-pink py-3 px-4 text-xs focus:outline-none focus:border-brand-gold transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Publish Review
                        <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[10px] uppercase tracking-widest text-green-600 font-bold"
                      >
                        Your review has been published, thank you!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
