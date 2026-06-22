import React from 'react';
import { Package } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">System overview and key metrics</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Package size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Dashboard will display KPI stats, inventory coverage, and recent recommendations.</p>
      </div>
    </div>
  );
}
