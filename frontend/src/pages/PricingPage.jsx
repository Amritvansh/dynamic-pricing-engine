import React from 'react';
import { DollarSign } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pricing Engine</h1>
          <p className="page-subtitle">Calculate and manage pricing recommendations</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <DollarSign size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Pricing engine UI — owned by Member 4.</p>
      </div>
    </div>
  );
}
