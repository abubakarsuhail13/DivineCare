
import React from 'react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="mb-12">
          <h1 className="text-4xl font-serif mb-4">Shipping Policy</h1>
          <p className="text-sm text-brand-charcoal/60 italic">Last updated: March 2024</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">Order Processing</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">Domestic Shipping Rates</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            Shipping charges for your order will be calculated and displayed at checkout based on your city.
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-brand-charcoal/80 space-y-2 mt-4">
            <li><strong>Lahore:</strong> Standard rate applied automatically.</li>
            <li><strong>Karachi & Islamabad:</strong> Premium out-of-city delivery applies.</li>
            <li><strong>Complimentary Shipping:</strong> Enjoy free express delivery on all orders over Rs. 15,000.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">How do I check the status of my order?</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become available.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
