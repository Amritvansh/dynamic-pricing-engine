import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * DemandAttributionChart — Stacked bar chart showing organic vs promotional demand.
 * GET /analytics/demand-trends/:productId (uses same data but stacked view)
 *
 * Props:
 *   data               — array of { _id, organicQuantity, promoQuantity }
 *   organicPercentage  — number (e.g. 84.4)
 *   promotionalPercentage — number (e.g. 15.6)
 *   loading            — boolean
 */
export default function DemandAttributionChart({ data = [], organicPercentage, promotionalPercentage, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ width: 160, height: 12, borderRadius: 4, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: '1rem' }} />
        <div style={{ width: '100%', height: 250, borderRadius: 8, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d._id,
    organic: d.organicQuantity || 0,
    promotional: d.promoQuantity || 0,
  }));

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Demand Attribution
      </p>

      {/* KPI pills */}
      {(organicPercentage != null || promotionalPercentage != null) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
            {organicPercentage?.toFixed(1) ?? '—'}% Organic
          </span>
          <span className="badge badge-orange" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
            {promotionalPercentage?.toFixed(1) ?? '—'}% Promotional
          </span>
        </div>
      )}

      {chartData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No sales data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
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
            <Bar dataKey="organic" stackId="demand" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Organic" />
            <Bar dataKey="promotional" stackId="demand" fill="#f97316" radius={[4, 4, 0, 0]} name="Promotional" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
