import React from 'react';
import { Warehouse } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Stock levels, coverage days, and sale recording</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Warehouse size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Inventory table and modals will be built on Day 3.</p>
      </div>
    </div>
  );
}
