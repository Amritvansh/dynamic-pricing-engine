import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { getEvents, getEventAnalytics } from '../../api/eventApi';

/**
 * EventPerformanceCard — Shows event performance KPIs.
 * Dropdown to select an expired event, then 4 KPI stat boxes.
 *
 * Props:
 *   eventId  — optional pre-selected event ID (for inline expansion mode)
 *   compact  — boolean, if true skips the dropdown and just shows stats
 */
export default function EventPerformanceCard({ eventId: propEventId, compact = false }) {
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(propEventId || '');
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch expired events for dropdown (if not in compact mode)
  useEffect(() => {
    if (compact) return;
    (async () => {
      try {
        const res = await getEvents({ status: 'EXPIRED' });
        setExpiredEvents(res.data || []);
      } catch {
        // non-critical
      }
    })();
  }, [compact]);

  // Use prop eventId if provided
  useEffect(() => {
    if (propEventId) setSelectedId(propEventId);
  }, [propEventId]);

  // Fetch analytics for selected event
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getEventAnalytics(selectedId);
        setAnalytics(res.data || []);
      } catch {
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]);

  // Aggregate metrics across all products
  const totals = analytics.reduce(
    (acc, a) => ({
      totalSales: acc.totalSales + (a.totalSalesDuringEvent || 0),
      totalRevenue: acc.totalRevenue + (a.totalRevenueDuringEvent || 0),
      organicSales: acc.organicSales + (a.organicSales || 0),
      promoSales: acc.promoSales + (a.promotionalSales || 0),
    }),
    { totalSales: 0, totalRevenue: 0, organicSales: 0, promoSales: 0 }
  );

  const organicPct = totals.totalSales > 0 ? ((totals.organicSales / totals.totalSales) * 100).toFixed(1) : '0';
  const promoPct = totals.totalSales > 0 ? ((totals.promoSales / totals.totalSales) * 100).toFixed(1) : '0';

  return (
    <div className={compact ? '' : 'card'} style={compact ? {} : { padding: '1.25rem' }}>
      {!compact && (
        <>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Event Performance
          </p>
          <select
            className="select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="">— Select an event —</option>
            {expiredEvents.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.eventName}</option>
            ))}
          </select>
        </>
      )}

      {!selectedId && !compact && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <TrendingUp size={24} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
          <p>Select an event to see performance metrics.</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      )}

      {selectedId && !loading && analytics.length === 0 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No sales recorded during this event.
        </div>
      )}

      {selectedId && !loading && analytics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Total Sales</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>{totals.totalSales}</p>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Revenue</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-green)' }}>₹{totals.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Organic %</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{organicPct}%</p>
          </div>
          <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Promotional %</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-orange)' }}>{promoPct}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
