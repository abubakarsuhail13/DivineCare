
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Check, Layers, Package, LogOut, MessageSquare, ShieldCheck, Key, Upload, Eye, EyeOff, Truck, ClipboardList, Wallet, TrendingUp, Download, FileText, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category, DeliveryCharge, Order, OrderStatus } from '../types';
import { ProductService, OrderService, transformDriveUrl } from '../services/ProductService';
import { sendPasswordChangeEmail, sendOrderStatusEmail } from '../emailService';

// Utility function to resize and compress uploaded images to prevent LocalStorage quota errors
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress as JPEG at 80% quality
        } else {
          resolve(e.target?.result as string); // fallback if canvas fails
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'delivery' | 'security'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);

  // Delivery State
  const [newCity, setNewCity] = useState('');
  const [newCharge, setNewCharge] = useState<number | ''>('');

  // Password Security State
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passStatus, setPassStatus] = useState({ type: '', message: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });

  useEffect(() => {
    if (!localStorage.getItem('admin_session')) {
      navigate('/admin/login');
    }
    refreshData();
  }, [navigate]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const refreshData = async () => {
    const [pData, cData, dData, oData] = await Promise.all([
      ProductService.getProducts(),
      ProductService.getCategories(),
      ProductService.getDeliveryCharges(),
      OrderService.getOrders()
    ]);
    setProducts(pData);
    setCategories(cData);
    setDeliveryCharges(dData);
    setOrders(oData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin/login');
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    OrderService.updateOrderStatus(id, newStatus as OrderStatus);
    refreshData();

    // Automated Email Notifications
    if (newStatus === 'Preparing' || newStatus === 'Delivered') {
      const emailResult = await sendOrderStatusEmail(order, newStatus as OrderStatus);
      if (emailResult.success) {
        showToast('success', `Customer notified: Order is now ${newStatus === 'Preparing' ? 'Preparing Ritual' : 'Delivered'}.`);
      } else {
        showToast('error', `Status updated locally, but email notification failed.`);
      }
    }
  };

  // --- Export Functions ---
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Shipping Address", "Total (PKR)", "Status", "Payment Method", "Items"];
    const csvRows = [headers.join(",")];
    
    orders.forEach(o => {
      const itemsList = o.items.map(i => `${i.quantity}x ${i.name} (${i.selectedVariant || 'Standard'})`).join("; ");
      const row = [
        o.id,
        new Date(o.date).toLocaleDateString(),
        `"${o.customerName}"`,
        `"${o.customerEmail}"`,
        `"${o.shippingAddress}"`,
        o.total,
        o.status,
        `"${o.paymentMethod}"`,
        `"${itemsList}"`
      ];
      csvRows.push(row.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `divine_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert("Please allow pop-ups to export as PDF.");
      return;
    }
    
    let html = `
      <html>
      <head>
        <title>Divine Beauty - Orders Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; }
          h1 { color: #C5A059; text-align: center; font-family: Georgia, serif; letter-spacing: 2px; text-transform: uppercase; }
          p.date { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #E5B8A8; padding: 10px; text-align: left; }
          th { background-color: #FDF2F0; color: #C5A059; text-transform: uppercase; letter-spacing: 1px; }
          tr:nth-child(even) { background-color: #FFFDF9; }
        </style>
      </head>
      <body>
        <h1>Divine Beauty - Orders Report</h1>
        <p class="date">Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Total (PKR)</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    orders.forEach(o => {
      html += `
        <tr>
          <td>${o.id}</td>
          <td>${new Date(o.date).toLocaleDateString()}</td>
          <td>${o.customerName}</td>
          <td>${o.customerEmail}</td>
          <td><strong>Rs. ${o.total.toLocaleString()}</strong></td>
          <td>${o.status}</td>
          <td>${o.paymentMethod}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: right; font-size: 14px; font-weight: bold; color: #333;">
          Total Revenue: Rs. ${totalRevenue.toLocaleString()}<br>
          Total Orders: ${totalOrdersCount}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // --- Product Form State ---
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    image: '',
    images: []
  });

  // --- Category Form State ---
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    slug: ''
  });

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: categories[0]?.slug || 'facial-kit',
        price: 0,
        image: '',
        images: []
      });
    }
    setIsProductModalOpen(true);
  };

  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm(cat);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleOpenReviewModal = (product: Product) => {
    setReviewProduct(product);
    setIsReviewModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    await ProductService.saveProduct({
      ...(productForm as Product),
      id: editingProduct?.id || ''
    });
    await refreshData();
    setIsProductModalOpen(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = categoryForm.slug || categoryForm.name?.toLowerCase().replace(/\s+/g, '-');
    await ProductService.saveCategory({
      ...(categoryForm as Category),
      slug: slug || '',
      id: editingCategory?.id || ''
    });
    await refreshData();
    setIsCategoryModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Remove this product permanently?')) {
      await ProductService.deleteProduct(id);
      await refreshData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category? Products in this category may become unlisted.')) {
      await ProductService.deleteCategory(id);
      await refreshData();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!reviewProduct) return;
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      const updatedReviews = (reviewProduct.reviews || []).filter(r => r.id !== reviewId);
      const newRating = updatedReviews.length > 0 
        ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length 
        : 5; 
        
      const updatedProduct = {
        ...reviewProduct,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: newRating
      };
      
      await ProductService.saveProduct(updatedProduct);
      setReviewProduct(updatedProduct);
      await refreshData();
    }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || newCharge === '') return;
    
    const newLocation: DeliveryCharge = {
      id: Date.now().toString(),
      city: newCity.trim(),
      charge: Number(newCharge)
    };
    
    const updated = [...deliveryCharges, newLocation];
    await ProductService.saveDeliveryCharges(updated);
    setDeliveryCharges(updated);
    setNewCity('');
    setNewCharge('');
  };

  const handleDeleteDelivery = async (id: string) => {
    if (window.confirm('Delete this delivery location?')) {
      const updated = deliveryCharges.filter(d => d.id !== id);
      await ProductService.saveDeliveryCharges(updated);
      setDeliveryCharges(updated);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus({ type: '', message: '' });
    
    const actualCurrent = localStorage.getItem('admin_password') || 'adminMail#2026!';
    if (passwordForm.current !== actualCurrent) {
      setPassStatus({ type: 'error', message: 'Current password is incorrect.' });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPassStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPassStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPass(true);
    
    const emailResult = await sendPasswordChangeEmail('admin@divinebeauty.site');
    
    if (emailResult.success) {
      localStorage.setItem('admin_password', passwordForm.newPass);
      setPassStatus({ type: 'success', message: 'Password updated & security notification sent!' });
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } else {
      setPassStatus({ type: 'error', message: 'Failed to send security alert. Password was not changed.' });
    }
    
    setIsChangingPass(false);
  };

  // Image Upload Handlers
  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const base64 = await resizeImage(e.target.files[0]);
        setProductForm({ ...productForm, image: base64 });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to process image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const base64s = await Promise.all(files.map(resizeImage));
        setProductForm({ ...productForm, images: [...(productForm.images || []), ...base64s] });
      } catch (error) {
        console.error("Error uploading images:", error);
        alert("Failed to process images.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...(productForm.images || [])];
    newImages.splice(index, 1);
    setProductForm({ ...productForm, images: newImages });
  };

  const toggleShowPassword = (field: 'current' | 'newPass' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Calculated Order Stats
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalOrdersCount = validOrders.length;
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const itemsRevenue = validOrders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0);
  const deliveryExpenses = totalRevenue - itemsRevenue;
  const profit = itemsRevenue;

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 right-10 z-[200] p-6 rounded-sm shadow-2xl border flex items-center gap-4 ${notification.type === 'success' ? 'bg-white border-brand-gold text-brand-charcoal' : 'bg-red-50 border-red-200 text-red-700'}`}
          >
            {notification.type === 'success' ? <Mail size={20} className="text-brand-gold" /> : <X size={20} />}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold">{notification.type === 'success' ? 'Portal Notification' : 'Ritual Error'}</p>
              <p className="text-xs mt-1">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Divine Portal</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">Admin Dashboard</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {activeTab === 'products' || activeTab === 'categories' ? (
              <button 
                onClick={() => activeTab === 'products' ? handleOpenProductModal() : handleOpenCategoryModal()}
                className="flex-grow md:flex-none bg-brand-gold text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add {activeTab === 'products' ? 'Product' : 'Category'}
              </button>
            ) : null}
            <button 
              onClick={handleLogout}
              className="bg-white border border-brand-pink p-3 text-brand-charcoal hover:bg-brand-pink transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-pink mb-8 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'orders' ? 'border-brand-gold text-brand-gold bg-white' : 'border-transparent text-brand-charcoal/40'}`}
          >
            <ClipboardList size={14} /> Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-brand-gold text-brand-gold bg-white' : 'border-transparent text-brand-charcoal/40'}`}
          >
            <Package size={14} /> Products ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'border-brand-gold text-brand-gold bg-white' : 'border-transparent text-brand-charcoal/40'}`}
          >
            <Layers size={14} /> Categories ({categories.length})
          </button>
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'delivery' ? 'border-brand-gold text-brand-gold bg-white' : 'border-transparent text-brand-charcoal/40'}`}
          >
            <Truck size={14} /> Delivery
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-brand-gold text-brand-gold bg-white' : 'border-transparent text-brand-charcoal/40'}`}
          >
            <ShieldCheck size={14} /> Security
          </button>
        </div>

        {/* --- ORDERS VIEW --- */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-brand-pink rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60">Total Revenue</p>
                  <h3 className="text-xl md:text-2xl font-serif mt-2 text-brand-charcoal">Rs. {totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-brand-pink/30 text-brand-gold rounded-full">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="bg-white p-6 border border-brand-pink rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60">Delivery Expenses</p>
                  <h3 className="text-xl md:text-2xl font-serif mt-2 text-brand-charcoal">Rs. {deliveryExpenses.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-brand-pink/30 text-brand-gold rounded-full">
                  <Truck size={24} />
                </div>
              </div>
              <div className="bg-white p-6 border border-brand-pink rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60">Total Orders</p>
                  <h3 className="text-xl md:text-2xl font-serif mt-2 text-brand-charcoal">{totalOrdersCount}</h3>
                </div>
                <div className="p-3 bg-brand-pink/30 text-brand-gold rounded-full">
                  <ClipboardList size={24} />
                </div>
              </div>
              <div className="bg-white p-6 border border-brand-pink rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60">Estimated Profit</p>
                  <h3 className="text-xl md:text-2xl font-serif mt-2 text-brand-gold font-bold">Rs. {profit.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Orders Table Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-serif">Order Records</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-pink text-[10px] uppercase tracking-widest font-bold hover:border-brand-gold hover:text-brand-gold transition-colors rounded-sm shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-white border border-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:border-brand-gold transition-colors rounded-sm shadow-sm"
                >
                  <FileText size={14} /> Export PDF
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-brand-pink shadow-sm overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-brand-pink/10 border-b border-brand-pink">
                    <tr>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Order ID & Date</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Customer</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Total (PKR)</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-pink">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-cream/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold font-mono tracking-widest text-brand-charcoal">{o.id}</p>
                          <p className="text-[10px] text-brand-charcoal/50 mt-1 uppercase tracking-widest">{new Date(o.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold uppercase tracking-widest">{o.customerName}</p>
                          <p className="text-[10px] text-brand-charcoal/50 mt-1">{o.customerEmail}</p>
                          <p className="text-[9px] text-brand-gold mt-1 uppercase tracking-widest">{o.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4 font-serif text-brand-gold font-bold text-sm">
                          Rs. {o.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className={`text-[10px] uppercase tracking-widest font-bold px-3 py-2 border rounded-sm outline-none cursor-pointer appearance-none 
                              ${o.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : 
                                o.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 
                                'bg-brand-pink/30 border-brand-pink text-brand-charcoal'}`}
                          >
                            <option value="Proceed">Proceed</option>
                            <option value="Preparing">Preparing Ritual</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm font-serif italic text-brand-charcoal/50">
                          No divine orders have been placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS VIEW --- */}
        {activeTab === 'products' && (
          <div className="bg-white border border-brand-pink shadow-sm overflow-hidden rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-brand-pink/10 border-b border-brand-pink">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Product Details</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Category</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Pricing (PKR)</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-brand-cream/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.image} className="w-12 h-16 object-cover bg-brand-pink rounded-sm shadow-sm" alt="" 
                               onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x600?text=Broken+Link')} />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest">{p.name}</p>
                            <p className="text-[9px] text-brand-charcoal/40 truncate max-w-[200px] mt-1 italic">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/60">
                        {p.category.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 font-serif text-brand-gold font-bold text-sm">
                        Rs. {p.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenReviewModal(p)} className="relative p-2 text-brand-rosegold hover:bg-brand-pink rounded-full transition-all" title="Manage Reviews">
                            <MessageSquare size={16} />
                            {p.reviewsCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                {p.reviewsCount}
                              </span>
                            )}
                          </button>
                          <button onClick={() => handleOpenProductModal(p)} className="p-2 text-brand-gold hover:bg-brand-pink rounded-full transition-all" title="Edit Product">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-all" title="Delete Product">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm font-serif italic text-brand-charcoal/50">
                        No products available in the divine collection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CATEGORIES VIEW --- */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-6 border border-brand-pink rounded-sm shadow-sm flex justify-between items-center group hover:border-brand-gold transition-all">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest">{cat.name}</h4>
                  <p className="text-[10px] text-brand-charcoal/40 font-mono mt-1">/{cat.slug}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenCategoryModal(cat)} className="p-2 text-brand-gold hover:bg-brand-pink rounded-full">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- DELIVERY VIEW --- */}
        {activeTab === 'delivery' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 border border-brand-pink rounded-sm shadow-sm">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2"><Truck size={20} className="text-brand-gold" /> Add New Location</h3>
              <form onSubmit={handleAddDelivery} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow w-full md:w-auto">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">City / Location Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCity} 
                    onChange={e => setNewCity(e.target.value)} 
                    className="w-full bg-brand-pink/20 border-transparent border py-3 px-4 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                    placeholder="e.g. Lahore" 
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Delivery Charge (PKR)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newCharge} 
                    onChange={e => setNewCharge(e.target.value ? Number(e.target.value) : '')} 
                    className="w-full bg-brand-pink/20 border-transparent border py-3 px-4 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                    placeholder="e.g. 200" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-brand-charcoal text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold transition-all"
                >
                  Add Charge
                </button>
              </form>
            </div>

            <div className="bg-white border border-brand-pink shadow-sm overflow-hidden rounded-sm">
              <table className="w-full text-left">
                <thead className="bg-brand-pink/10 border-b border-brand-pink">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Location</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">Delivery Charge (PKR)</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink">
                  {deliveryCharges.map((d) => (
                    <tr key={d.id} className="hover:bg-brand-cream/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-brand-charcoal">{d.city}</td>
                      <td className="px-6 py-4 font-serif text-brand-gold font-bold">Rs. {d.charge}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleDeleteDelivery(d.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-all" title="Delete Location">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deliveryCharges.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-brand-charcoal/50 italic font-serif">
                        No delivery charges added. Add your first location above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SECURITY VIEW --- */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto bg-white p-10 border border-brand-pink shadow-sm rounded-sm">
            <div className="text-center mb-8">
              <Key size={32} className="text-brand-gold mx-auto mb-4" />
              <h2 className="text-2xl font-serif">Change Password</h2>
              <p className="text-[10px] text-brand-charcoal/60 uppercase tracking-widest mt-2">Update your divine portal credentials</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Current Password</label>
                <input 
                  type={showPasswords.current ? "text" : "password"}
                  required 
                  className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 pr-12 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                  value={passwordForm.current} 
                  onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} 
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  className="absolute right-4 top-9 text-brand-charcoal/40 hover:text-brand-gold transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">New Password</label>
                <input 
                  type={showPasswords.newPass ? "text" : "password"}
                  required 
                  className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 pr-12 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                  value={passwordForm.newPass} 
                  onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} 
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('newPass')}
                  className="absolute right-4 top-9 text-brand-charcoal/40 hover:text-brand-gold transition-colors"
                >
                  {showPasswords.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Confirm New Password</label>
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  required 
                  className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 pr-12 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" 
                  value={passwordForm.confirm} 
                  onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} 
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute right-4 top-9 text-brand-charcoal/40 hover:text-brand-gold transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passStatus.message && (
                <p className={`text-[10px] uppercase tracking-widest font-bold text-center ${passStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {passStatus.message}
                </p>
              )}

              <button 
                type="submit" 
                disabled={isChangingPass} 
                className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isChangingPass ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- REVIEW MODAL --- */}
      <AnimatePresence>
        {isReviewModalOpen && reviewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl p-10 shadow-2xl rounded-sm border border-brand-pink max-h-[85vh] flex flex-col"
            >
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-pink rounded-full transition-colors"><X size={20} /></button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-serif mb-2">Manage Reviews</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-gold">Product: {reviewProduct.name}</p>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow space-y-4">
                {!reviewProduct.reviews || reviewProduct.reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare size={32} className="text-brand-pink mx-auto mb-4" />
                    <p className="text-sm italic text-brand-charcoal/50">No reviews have been submitted for this product yet.</p>
                  </div>
                ) : (
                  reviewProduct.reviews.map(review => (
                    <div key={review.id} className="border border-brand-pink p-5 rounded-sm flex justify-between items-start gap-4 hover:border-brand-gold transition-colors bg-white shadow-sm">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-sm font-bold uppercase tracking-widest">{review.name}</h4>
                          <span className="text-[10px] text-brand-charcoal/40">{review.date}</span>
                          <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-sm font-bold">{review.rating} Stars</span>
                        </div>
                        <p className="text-xs text-brand-charcoal/70 italic leading-relaxed">"{review.comment}"</p>
                        <p className="text-[9px] text-brand-charcoal/40 mt-3 font-mono">{review.email}</p>
                      </div>
                      <button onClick={() => handleDeleteReview(review.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full flex-shrink-0 transition-colors" title="Delete Review">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PRODUCT MODAL --- */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-3xl my-auto p-10 shadow-2xl rounded-sm border border-brand-pink max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsProductModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-pink rounded-full transition-colors"><X size={20} /></button>
              <h2 className="text-3xl font-serif mb-8">{editingProduct ? 'Refine Product' : 'Add New Treasure'}</h2>

              <form onSubmit={handleSaveProduct} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Product Name</label>
                    <input type="text" required className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none transition-all" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Collection Category</label>
                    <select className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none appearance-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Price (PKR)</label>
                    <input type="number" required min="0" className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value) || 0})} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Description</label>
                    <textarea rows={3} required className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                  </div>

                  {/* Image Upload Section */}
                  <div className="md:col-span-2 space-y-6">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Product Images (Upload)</label>

                    {/* Featured Image Upload */}
                    <div className="space-y-3">
                      <label className="block text-[8px] uppercase text-brand-charcoal/60 font-bold">Featured Image</label>
                      {productForm.image ? (
                        <div className="relative w-32 h-40 bg-brand-pink rounded-sm overflow-hidden border border-brand-pink shadow-sm group">
                          <img src={transformDriveUrl(productForm.image)} className="w-full h-full object-cover" alt="Featured" />
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full md:w-1/2 h-32 border-2 border-dashed border-brand-pink bg-brand-pink/10 hover:bg-brand-pink/30 transition-colors cursor-pointer rounded-sm">
                          <Upload size={24} className="text-brand-gold mb-2" />
                          <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/60">Upload Featured Image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedUpload} />
                        </label>
                      )}
                    </div>

                    {/* Gallery Images Upload */}
                    <div className="space-y-3 pt-4 border-t border-brand-pink/50">
                      <label className="block text-[8px] uppercase text-brand-charcoal/60 font-bold">Gallery Images (Optional)</label>
                      <div className="flex flex-wrap gap-4">
                        {(productForm.images || []).map((img, idx) => (
                          <div key={idx} className="relative w-24 h-24 bg-brand-pink rounded-sm overflow-hidden border border-brand-pink shadow-sm group">
                            <img src={transformDriveUrl(img)} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-white/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}

                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-brand-pink bg-brand-pink/10 hover:bg-brand-pink/30 transition-colors cursor-pointer rounded-sm">
                          <Plus size={20} className="text-brand-gold mb-1" />
                          <span className="text-[8px] uppercase tracking-widest text-brand-charcoal/60">Add Image</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                        </label>
                      </div>
                    </div>
                    {isUploading && (
                      <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold animate-pulse">
                        Processing image(s)... Please wait.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-6 pt-8 border-t border-brand-pink">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-[10px] uppercase tracking-widest font-bold hover:text-brand-gold transition-colors">Discard</button>
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="bg-brand-charcoal text-white px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check size={16} /> {editingProduct ? 'Save Ritual' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CATEGORY MODAL --- */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md p-10 shadow-2xl rounded-sm border border-brand-pink"
            >
              <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-pink rounded-full transition-colors"><X size={20} /></button>
              <h2 className="text-2xl font-serif mb-8">{editingCategory ? 'Update Collection' : 'New Collection'}</h2>

              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Collection Name</label>
                  <input type="text" required placeholder="e.g. Premium Serums" className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Slug (Auto-generated if empty)</label>
                  <input type="text" placeholder="e.g. premium-serums" className="w-full bg-brand-pink/20 border-transparent border py-4 px-6 text-sm focus:bg-white focus:border-brand-gold outline-none" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} />
                </div>

                <div className="flex justify-end gap-6 pt-6 border-t border-brand-pink">
                  <button type="submit" className="w-full bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all shadow-xl">
                    <Check size={16} className="inline mr-2" /> {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
