
import React from 'react';

const Returns: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="mb-12">
          <h1 className="text-4xl font-serif mb-4">Returns & Exchanges</h1>
          <p className="text-sm text-brand-charcoal/60 italic">Ensuring your divine satisfaction.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">30-Day Ritual Guarantee</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            We stand behind the efficacy of our formulations. If you are not entirely satisfied with your purchase, we offer a 30-day return policy from the date of delivery. Items must be returned in their original packaging, gently used or unopened.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">How to Initiate a Return</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            To start a return or exchange, please reach out to our concierge team at <strong>admin@divinebeauty.site</strong> or call us at <strong>+92 316 4204771</strong>. Include your order number and the reason for return. Our team will provide you with a return shipping label and instructions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">Refund Processing</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-widest">Damaged Items</h2>
          <p className="text-sm leading-relaxed text-brand-charcoal/80">
            In the rare event that your order arrives damaged or defective, please contact us immediately with photos of the damaged item. We will arrange a replacement at no additional cost.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Returns;
