
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck, ChevronLeft } from 'lucide-react';

const AdminResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [error, setError] = useState(() => {
    const savedToken = localStorage.getItem('admin_reset_token');
    if (!token || !savedToken || token !== savedToken) {
      return 'Invalid or expired reset token. Please request a new one from the login page.';
    }
    return '';
  });
  const [showPassword, setShowPassword] = useState({ pass: false, conf: false });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (error && error.includes('Invalid')) return;

    if (formData.password !== formData.confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Update password in local app config (localStorage) in lieu of a database.
    localStorage.setItem('admin_password', formData.password);
    localStorage.removeItem('admin_reset_token');
    
    setError('');
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/admin/login');
    }, 3000);
  };

  const toggleShow = (field: 'pass' | 'conf') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (error && error.includes('Invalid')) {
    return (
      <div className="pt-40 pb-24 px-6 min-h-screen bg-brand-cream flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white p-10 shadow-2xl border border-brand-pink rounded-sm text-center">
          <ShieldCheck size={32} className="text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-serif mb-4">Link Expired</h2>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed mb-8">{error}</p>
          <Link to="/admin/login" className="w-full inline-flex items-center justify-center gap-2 bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-brand-gold transition-all">
            <ChevronLeft size={14} /> Back to Portal
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 px-6 min-h-screen bg-brand-cream flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 shadow-2xl border border-brand-pink rounded-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif mb-2">Divine Portal</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">Secure Password Reset</p>
        </div>

        {isSuccess ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-pink text-brand-gold rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-serif">Credentials Updated</h3>
            <p className="text-xs text-brand-charcoal/60 leading-relaxed uppercase tracking-widest">
              Your new password has been applied. Returning to the portal...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
              <input
                type={showPassword.pass ? "text" : "password"}
                required
                placeholder="New Password"
                className="w-full bg-brand-pink/20 border border-transparent py-4 pl-12 pr-12 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button" onClick={() => toggleShow('pass')} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-gold transition-colors">
                {showPassword.pass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
              <input
                type={showPassword.conf ? "text" : "password"}
                required
                placeholder="Confirm New Password"
                className="w-full bg-brand-pink/20 border border-transparent py-4 pl-12 pr-12 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-all"
                value={formData.confirm}
                onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
              />
              <button type="button" onClick={() => toggleShow('conf')} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-gold transition-colors">
                {showPassword.conf ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-xs font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-3 group"
            >
              Update Credentials
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-center pt-4 border-t border-brand-pink">
              <Link to="/admin/login" className="text-[10px] text-brand-charcoal/60 hover:text-brand-gold uppercase tracking-widest font-bold transition-colors inline-flex items-center gap-1">
                Cancel Reset
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
