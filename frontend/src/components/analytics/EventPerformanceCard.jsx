import React, { useState, useEffect } from 'react';
import { getEvents } from '../../api/eventApi';
import { getEventPerformance } from '../../api/analyticsApi';
import ErrorAlert from '../common/ErrorAlert';

/**
 * EventPerformanceCard — Displays 4 KPI boxes for a selected past event.
 * If eventId is provided as a prop, it skips the dropdown and just shows the metrics (for the EventsPage Past tab expandable row).
 * If no eventId is provided, it shows a dropdown of past events to select from (for AnalyticsPage).
 */
export default function EventPerformanceCard({ eventId: propEventId }) {
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(propEventId || '');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch past events if no eventId prop is provided
  useEffect(() => {
    if (propEventId) return;
    const fetchPastEvents = async () => {
      try {
        const res = await getEvents({ status: 'EXPIRED' });
        setPastEvents(res.data || []);
      } catch (err) {
        console.error('Failed to load past events for performance card', err);
      }
    };
    fetchPastEvents();
  }, [propEventId]);

  // Sync state if prop changes
  useEffect(() => {
    if (propEventId) setSelectedEventId(propEventId);
  }, [propEventId]);

  // Fetch performance metrics when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) {
      setMetrics(null);
      return;
    }
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEventPerformance(selectedEventId);
        setMetrics(res.data);
      } catch (err) {
        setError('Failed to load event performance metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedEventId]);

  return (
    <div className="card" style={{ padding: '1.25rem', height: propEventId ? 'auto' : 380, display: 'flex', flexDirection: 'column' }}>
      {!propEventId && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Event Performance
          </p>
          <select 
            className="select" 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ maxWidth: 200, padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="">Select an event...</option>
            {pastEvents.map(e => (
              <option key={e._id} value={e._id}>{e.eventName}</option>
            ))}
          </select>
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !selectedEventId ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select an event to see performance metrics.
        </div>
      ) : !metrics || (metrics.totalSales === 0 && metrics.revenueGenerated === 0) ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No sales recorded during this event.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, alignContent: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Sales</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {metrics.totalSales}
            </p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue Generated</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              ₹{metrics.revenueGenerated?.toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Organic Sales</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
              {Math.round(metrics.organicPercentage)}%
            </p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Promotional Sales</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-orange)', marginTop: '0.25rem' }}>
              {Math.round(metrics.promotionalPercentage)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
