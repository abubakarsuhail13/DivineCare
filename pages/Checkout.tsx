
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronLeft, Lock, ArrowRight, UploadCloud } from 'lucide-react';
import { CartItem, DeliveryCharge, Order } from '../types';
import { sendOrderEmails } from '../emailService';
import { ProductService, OrderService } from '../services/ProductService';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  clearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, clearCart }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'cod' // Default selected
  });

  // Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string>('');

  useEffect(() => {
    const loadCharges = async () => {
      const charges = await ProductService.getDeliveryCharges();
      setDeliveryCharges(charges);
      if (charges.length > 0 && !formData.city) {
        setFormData(f => ({ ...f, city: charges[0].city }));
      }
    };
    loadCharges();
  }, [formData.city]);

  const selectedCharge = deliveryCharges.find(d => d.city === formData.city)?.charge || 0;
  // Apply complimentary shipping if total is high enough, else use dynamic charge
  const shipping = total > 15000 ? 0 : selectedCharge;
  const grandTotal = total + shipping;

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setReceiptError('Invalid format. Please upload a JPG, PNG, or PDF.');
        setReceiptFile(null);
        setReceiptBase64(null);
        return;
      }

      // Validate file size (limit to 2MB to ensure email delivery success)
      if (file.size > 2 * 1024 * 1024) {
        setReceiptError('File is too large. Maximum size is 2MB.');
        setReceiptFile(null);
        setReceiptBase64(null);
        return;
      }

      setReceiptFile(file);
      try {
        const base64 = await toBase64(file);
        setReceiptBase64(base64);
      } catch {
        setReceiptError('Error reading file. Please try again.');
        setReceiptFile(null);
        setReceiptBase64(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce receipt upload for non-COD methods
    if (formData.paymentMethod !== 'cod' && !receiptBase64) {
      setReceiptError('Please upload payment receipt to continue.');
      return;
    }

    setIsProcessing(true);
    
    const orderNumber = `DB-${(Math.random() * 1000000).toFixed(0)}`;
    
    // Format payment method name for order details
    const paymentNames: Record<string, string> = {
      cod: 'Cash on Delivery',
      bank: 'Bank Transfer',
      easypaisa: 'EasyPaisa',
      jazzcash: 'JazzCash'
    };

    const orderDetails = {
      items: [...cart],
      total: grandTotal,
      orderNumber: orderNumber,
      shippingAddress: `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.zip}`,
      customerEmail: formData.email,
      customerName: `${formData.firstName} ${formData.lastName}`,
      paymentMethod: paymentNames[formData.paymentMethod] || formData.paymentMethod,
    };

    // Save order locally for tracking system
    const newOrder: Order = {
      id: orderNumber,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      shippingAddress: orderDetails.shippingAddress,
      total: orderDetails.total,
      status: 'Proceed', // Changed to Proceed
      date: new Date().toISOString(),
      items: [...cart],
      paymentMethod: orderDetails.paymentMethod
    };
    
    const saveAndSend = async () => {
      await OrderService.saveOrder(newOrder);

      const emailResult = await sendOrderEmails({
        orderNumber: orderDetails.orderNumber,
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        items: orderDetails.items,
        total: orderDetails.total,
        receiptBase64: formData.paymentMethod !== 'cod' ? receiptBase64 : null,
        receiptName: formData.paymentMethod !== 'cod' && receiptFile ? receiptFile.name : null,
      });

      setIsProcessing(false);
      clearCart();
      navigate('/order-success', { 
        state: { 
          orderDetails, 
          emailStatus: emailResult?.success ? 'sent' : 'failed' 
        } 
      });
    };

    saveAndSend();
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-2xl font-serif mb-6">Your bag is empty</h2>
        <Link to="/collection" className="bg-brand-charcoal text-white px-8 py-3 uppercase tracking-widest text-xs font-bold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link to="/collection" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60 hover:text-brand-gold transition-colors mb-12">
          <ChevronLeft size={14} />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <h1 className="text-3xl font-serif mb-10">Divine Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-12">
              <section>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-6">01. Contact Details</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </section>

              <section>
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold mb-6">02. Shipping Ritual</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Address Line"
                      className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm appearance-none cursor-pointer"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    >
                      <option value="" disabled>Select City</option>
                      {deliveryCharges.map(d => (
                        <option key={d.id} value={d.city}>{d.city}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-charcoal/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Zip / Postal Code"
                    className="w-full bg-white border border-brand-pink py-4 px-6 text-sm focus:outline-none focus:border-brand-gold transition-colors rounded-sm"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">03. Payment Method</h2>
                  <div className="flex gap-2 text-brand-charcoal/40">
                    <Lock size={12} />
                    <span className="text-[8px] uppercase tracking-widest font-bold">Secure Checkout</span>
                  </div>
                </div>
                
                <div className="bg-white border border-brand-pink rounded-sm overflow-hidden flex flex-col">
                  
                  {/* Cash on Delivery */}
                  <label className={`flex items-start p-5 cursor-pointer border-b border-brand-pink transition-colors ${formData.paymentMethod === 'cod' ? 'bg-brand-pink/20' : 'hover:bg-brand-cream'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      required
                      checked={formData.paymentMethod === 'cod'} 
                      onChange={(e) => {
                        setFormData({...formData, paymentMethod: e.target.value});
                        setReceiptError(''); // Clear errors when switching to COD
                      }} 
                      className="mt-1 accent-brand-gold w-4 h-4" 
                    />
                    <div className="ml-4 w-full">
                      <span className="block text-sm font-bold uppercase tracking-widest text-brand-charcoal">Cash on Delivery</span>
                      <AnimatePresence>
                        {formData.paymentMethod === 'cod' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <p className="mt-2 text-xs text-brand-charcoal/60 italic leading-relaxed">Pay with cash upon delivery of your divine order.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-start p-5 cursor-pointer border-b border-brand-pink transition-colors ${formData.paymentMethod === 'bank' ? 'bg-brand-pink/20' : 'hover:bg-brand-cream'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bank" 
                      checked={formData.paymentMethod === 'bank'} 
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
                      className="mt-1 accent-brand-gold w-4 h-4" 
                    />
                    <div className="ml-4 w-full">
                      <span className="block text-sm font-bold uppercase tracking-widest text-brand-charcoal">Bank Transfer</span>
                      <AnimatePresence>
                        {formData.paymentMethod === 'bank' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="mt-4 bg-white p-5 border border-brand-pink rounded-sm text-xs text-brand-charcoal/70 space-y-2 shadow-sm">
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Bank:</strong> Meezan Bank Limited</p>
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Account Title:</strong> Divine Beauty</p>
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Account Number:</strong> 0123 4567 8910</p>
                              <p className="mt-4 pt-4 border-t border-brand-pink italic text-[10px] text-brand-gold">Please transfer the total amount and upload your payment receipt below.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </label>

                  {/* EasyPaisa */}
                  <label className={`flex items-start p-5 cursor-pointer border-b border-brand-pink transition-colors ${formData.paymentMethod === 'easypaisa' ? 'bg-brand-pink/20' : 'hover:bg-brand-cream'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="easypaisa" 
                      checked={formData.paymentMethod === 'easypaisa'} 
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
                      className="mt-1 accent-brand-gold w-4 h-4" 
                    />
                    <div className="ml-4 w-full">
                      <span className="block text-sm font-bold uppercase tracking-widest text-brand-charcoal">EasyPaisa</span>
                      <AnimatePresence>
                        {formData.paymentMethod === 'easypaisa' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="mt-4 bg-white p-5 border border-brand-pink rounded-sm text-xs text-brand-charcoal/70 space-y-2 shadow-sm">
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Account Title:</strong> Divine Beauty</p>
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Wallet Number:</strong> 0333 1234567</p>
                              <p className="mt-4 pt-4 border-t border-brand-pink italic text-[10px] text-brand-gold">Please transfer the total amount and upload your payment receipt below.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </label>

                  {/* JazzCash */}
                  <label className={`flex items-start p-5 cursor-pointer transition-colors ${formData.paymentMethod === 'jazzcash' ? 'bg-brand-pink/20' : 'hover:bg-brand-cream'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="jazzcash" 
                      checked={formData.paymentMethod === 'jazzcash'} 
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
                      className="mt-1 accent-brand-gold w-4 h-4" 
                    />
                    <div className="ml-4 w-full">
                      <span className="block text-sm font-bold uppercase tracking-widest text-brand-charcoal">JazzCash</span>
                      <AnimatePresence>
                        {formData.paymentMethod === 'jazzcash' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="mt-4 bg-white p-5 border border-brand-pink rounded-sm text-xs text-brand-charcoal/70 space-y-2 shadow-sm">
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Account Title:</strong> Divine Beauty</p>
                              <p><strong className="uppercase tracking-widest text-[9px] text-brand-charcoal mr-2">Wallet Number:</strong> 0300 1234567</p>
                              <p className="mt-4 pt-4 border-t border-brand-pink italic text-[10px] text-brand-gold">Please transfer the total amount and upload your payment receipt below.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </label>

                  {/* Upload Receipt Section (Only for non-COD) */}
                  <AnimatePresence>
                    {formData.paymentMethod !== 'cod' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-brand-pink bg-brand-pink/10 p-5 overflow-hidden"
                      >
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-3 text-brand-charcoal">
                          Upload Payment Receipt (Required)
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <label className="cursor-pointer bg-white border border-brand-pink px-4 py-3 text-[10px] uppercase tracking-widest font-bold hover:border-brand-gold hover:text-brand-gold transition-all text-center flex items-center gap-2">
                            <UploadCloud size={14} />
                            Choose File
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          <span className="text-[10px] text-brand-charcoal/60 truncate max-w-[200px] md:max-w-xs">
                            {receiptFile ? receiptFile.name : 'No file chosen (JPG, PNG, PDF max 2MB)'}
                          </span>
                        </div>
                        {receiptError && (
                          <p className="text-red-500 text-[10px] mt-3 font-bold uppercase tracking-widest">{receiptError}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </section>

              <button
                type="submit"
                disabled={isProcessing || (formData.paymentMethod !== 'cod' && !receiptBase64)}
                className="w-full bg-brand-charcoal text-white py-6 uppercase tracking-[0.4em] text-xs font-bold hover:bg-brand-gold transition-all shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Order Ritual
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-3 text-brand-charcoal/40">
                <ShieldCheck size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Purity and Privacy Guaranteed</span>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 glass border border-brand-pink p-8 rounded-sm">
              <h3 className="font-serif text-xl mb-8 border-b border-brand-pink pb-4">Order Essence</h3>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-4">
                    <div className="w-16 h-20 flex-shrink-0 bg-brand-pink rounded-sm overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] text-brand-charcoal/40 uppercase tracking-widest mt-1">
                            {item.quantity} × {item.selectedVariant || 'Standard'}
                          </p>
                        </div>
                        <span className="text-xs font-bold font-serif text-brand-gold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-brand-pink">
                <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-brand-charcoal/60">
                  <span>Subtotal</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-brand-charcoal/60">
                  <span>Shipping</span>
                  <span>{shipping === 0 && total > 15000 ? 'Complimentary' : `Rs. ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-lg font-serif pt-4 border-t border-brand-pink/50">
                  <span className="font-bold">Total</span>
                  <span className="text-brand-gold font-bold">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
