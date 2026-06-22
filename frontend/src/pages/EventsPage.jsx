import React from 'react';
import { CalendarRange } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Promotional events lifecycle and performance</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <CalendarRange size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ color: 'var(--text-muted)' }}>Events page — owned by Member 4.</p>
      </div>
    </div>
  );
}
