
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatText = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block mb-2 last:mb-0">
      {line.split('**').map((part, j) => 
        j % 2 === 1 ? <strong key={j} className="font-bold text-inherit opacity-90">{part}</strong> : part
      )}
    </span>
  ));
};

const AdvisorWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Welcome to the Divine Circle. I am your Skincare Guide. How may I assist your beauty ritual today?\n\nYou can ask me about:\n- **Shipping & Delivery**\n- **Returns & Exchanges**\n- **Payment Methods**\n- **Contact Information**' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    // Simulate network delay for a more natural feel
    setTimeout(() => {
      const lowerInput = userMsg.toLowerCase();
      let botReply = "";

      if (lowerInput.includes('shipping') || lowerInput.includes('delivery') || lowerInput.includes('track') || lowerInput.includes('time')) {
        botReply = "We offer complimentary express shipping on orders over **Rs. 15,000**. For other orders, standard city-based rates apply (calculated at checkout). You can track your order status on our 'Track Order' page.";
      } else if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('whatsapp') || lowerInput.includes('support') || lowerInput.includes('help')) {
        botReply = "Our divine concierge team is always here to assist you. \n\n**Email:** admin@divinebeauty.site \n**Phone / WhatsApp:** +92 316 4204771";
      } else if (lowerInput.includes('return') || lowerInput.includes('exchange') || lowerInput.includes('refund')) {
        botReply = "We offer a **30-Day Ritual Guarantee**. You can return gently used or unopened items within 30 days of delivery. Please contact us at **+92 316 4204771** to initiate a return.";
      } else if (lowerInput.includes('payment') || lowerInput.includes('pay') || lowerInput.includes('cod') || lowerInput.includes('jazzcash') || lowerInput.includes('easypaisa') || lowerInput.includes('bank')) {
        botReply = "We accept the following payment methods:\n- **Cash on Delivery (COD)**\n- **Bank Transfer**\n- **EasyPaisa**\n- **JazzCash**\n\nYou can select your preferred method during our secure checkout process.";
      } else if (lowerInput.includes('product') || lowerInput.includes('recommend') || lowerInput.includes('buy') || lowerInput.includes('shop') || lowerInput.includes('kit') || lowerInput.includes('serum')) {
        botReply = "Please explore our **The Collection** page to view all our divine skincare treasures. Our **Glow-Radiance Facial Kit** and **Eternal Youth Serum** are among our most coveted items. Click 'Add to Cart' to begin your ritual.";
      } else {
        botReply = "Thank you for reaching out. For personalized guidance or complex inquiries, please contact our concierge team at **+92 316 4204771**.\n\nYou can also ask me about **shipping**, **returns**, **payments**, or how to **contact us**.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[550px] max-h-[80vh] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-brand-pink"
          >
            {/* Header */}
            <div className="bg-brand-pink p-4 flex justify-between items-center border-b border-brand-rosegold/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold">Divine Guide</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50">Online • +92 316 4204771</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/50 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-cream/30 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-brand-gold text-white rounded-tr-none' 
                    : 'bg-white text-brand-charcoal border border-brand-pink rounded-tl-none'
                  }`}>
                    {formatText(m.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-pink p-3.5 rounded-2xl rounded-tl-none flex gap-1.5 items-center h-[42px]">
                    <div className="w-1.5 h-1.5 bg-brand-rosegold rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-brand-rosegold rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-brand-rosegold rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-brand-pink">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  placeholder="Ask about shipping, returns, etc..."
                  className="w-full bg-brand-pink/30 border border-transparent focus:border-brand-gold focus:bg-white transition-colors focus:outline-none rounded-full py-3 px-5 pr-12 text-xs disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 text-brand-gold hover:text-brand-charcoal transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-charcoal text-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group border-2 border-brand-gold/20"
      >
        <div className="absolute inset-0 bg-brand-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative z-10 flex items-center justify-center">
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </div>
      </motion.button>
    </div>
  );
};

export default AdvisorWidget;
