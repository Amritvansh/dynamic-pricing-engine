import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * PriceHistoryChart — Line chart showing price changes over time.
 * GET /analytics/price-history/:productId
 *
 * Props:
 *   data    — array of { date, previousPrice, newPrice }
 *   loading — boolean
 */
export default function PriceHistoryChart({ data = [], loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ width: 120, height: 12, borderRadius: 4, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '1rem' }} />
        <div style={{ width: '100%', height: 250, borderRadius: 8, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    recommended: d.newPrice,
    previous: d.previousPrice,
  }));

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Price History
      </p>
      {chartData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No pricing history available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
              formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, undefined]}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Line type="monotone" dataKey="recommended" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Recommended Price" />
            <Line type="monotone" dataKey="previous" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Previous Price" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
