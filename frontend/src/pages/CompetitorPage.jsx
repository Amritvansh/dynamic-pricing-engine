import React from 'react';
import { Users } from 'lucide-react';

export default function CompetitorPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Competitors</h1>
          <p className="page-subtitle">Track competitor pricing and gap analysis</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Users size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Competitor management — owned by Member 4.</p>
      </div>
    </div>
  );
}
