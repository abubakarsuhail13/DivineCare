
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { sendPasswordResetEmail } from '../emailService';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  
  // Login State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = localStorage.getItem('admin_password') || 'adminMail#2026!';
    
    if (formData.email === 'admin@divinebeauty.site' && formData.password === currentPassword) {
      localStorage.setItem('admin_session', 'active-' + Date.now());
      window.dispatchEvent(new Event('auth-change'));
      navigate('/admin/dashboard');
    } else {
      setError('Invalid divine credentials. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetStatus('');
    setError('');

    // Generate token and configure reset link
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('admin_reset_token', token);
    
    const baseUrl = window.location.href.split('#')[0];
    const resetLink = `${baseUrl}#/admin/reset-password?token=${token}`;

    if (resetEmail === 'admin@divinebeauty.site') {
      await sendPasswordResetEmail(resetEmail, resetLink);
    } else {
      // Simulate delay to prevent email enumeration
      await new Promise(r => setTimeout(r, 1500));
    }

    setIsResetting(false);
    setResetStatus('If this email is registered, a reset link has been dispatched to your inbox.');
    setResetEmail('');
  };

  return (
    <div className="pt-40 pb-24 px-6 min-h-screen bg-brand-cream flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 shadow-2xl border border-brand-pink rounded-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif mb-2">Divine Portal</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">
            {view === 'login' ? 'Administrator Login' : 'Password Recovery'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Admin Email"
                  className="w-full bg-brand-pink/20 border border-transparent py-4 pl-12 pr-4 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full bg-brand-pink/20 border border-transparent py-4 pl-12 pr-12 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">{error}</p>}

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('forgot'); setError(''); }} 
                  className="text-[10px] text-brand-charcoal/60 hover:text-brand-gold uppercase tracking-widest font-bold transition-colors"
                >
                  Lost Key?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-xs font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-3 group"
              >
                Enter Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleForgotPassword} 
              className="space-y-6"
            >
              <p className="text-xs text-brand-charcoal/70 text-center leading-relaxed mb-6">
                Enter your administrative email. We will send a secure ritual link to reset your password.
              </p>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Admin Email"
                  className="w-full bg-brand-pink/20 border border-transparent py-4 pl-12 pr-4 text-sm focus:outline-none focus:bg-white focus:border-brand-gold transition-all"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              {resetStatus && (
                <p className="text-brand-gold text-[10px] uppercase tracking-widest font-bold text-center leading-relaxed">
                  {resetStatus}
                </p>
              )}

              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-[0.3em] text-xs font-bold hover:bg-brand-gold transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isResetting ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setResetStatus(''); }} 
                  className="text-[10px] text-brand-charcoal/60 hover:text-brand-gold uppercase tracking-widest font-bold transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft size={12} /> Return to Login
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
