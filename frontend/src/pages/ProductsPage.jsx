import React from 'react';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog and pricing tiers</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Package size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Product table and CRUD will be built on Day 2.</p>
      </div>
    </div>
  );
}
