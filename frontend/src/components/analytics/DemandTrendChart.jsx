import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * DemandTrendChart — Line chart showing demand velocity over time.
 * GET /analytics/demand-trends/:productId
 *
 * Props:
 *   data    — array of { _id: "2026-06-20", totalQuantity, organicQuantity, promoQuantity, totalRevenue }
 *   loading — boolean
 */
export default function DemandTrendChart({ data = [], loading }) {
  const [showPromo, setShowPromo] = useState(true);

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ width: 120, height: 12, borderRadius: 4, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '1rem' }} />
        <div style={{ width: '100%', height: 250, borderRadius: 8, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d._id,
    organic: d.organicQuantity || 0,
    promotional: d.promoQuantity || 0,
    total: d.totalQuantity || 0,
  }));

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Demand Trends (30 days)
        </p>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: 6, padding: '0.15rem' }}>
          <button
            onClick={() => setShowPromo(true)}
            style={{
              padding: '0.3rem 0.6rem', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', fontWeight: 600,
              background: showPromo ? 'var(--accent-indigo)' : 'transparent',
              color: showPromo ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            All Demand
          </button>
          <button
            onClick={() => setShowPromo(false)}
            style={{
              padding: '0.3rem 0.6rem', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', fontWeight: 600,
              background: !showPromo ? 'var(--accent-indigo)' : 'transparent',
              color: !showPromo ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Organic Only
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No demand data available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const parts = v.split('-');
                return `${parts[2]}/${parts[1]}`;
              }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Line type="monotone" dataKey="organic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Organic" />
            {showPromo && (
              <Line type="monotone" dataKey="promotional" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Promotional" />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
