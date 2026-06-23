import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList, ReferenceLine
} from 'recharts';

/**
 * SignalBreakdown — Waterfall chart showing how each signal transforms the price.
 *
 * Props:
 *   currentPrice  — number
 *   signals       — { demand, inventory, competitor, seasonal }
 *   recommendation — { recommendedPrice, constraintApplied }
 *   eventOverlay  — { eventApplied, priceBeforeDiscount, finalCustomerPrice, eventName }
 */
export default function SignalBreakdown({ currentPrice, signals, recommendation, eventOverlay }) {
  const data = useMemo(() => {
    if (!currentPrice || !signals) return [];

    // Build multiplicative waterfall
    let running = currentPrice;
    const steps = [];

    // Starting bar
    steps.push({ name: 'Current', value: running, base: 0, delta: running, type: 'start' });

    // Each signal delta is multiplicative
    const signalList = [
      { name: 'Demand', multiplier: signals.demand?.multiplier ?? 1 },
      { name: 'Inventory', multiplier: signals.inventory?.multiplier ?? 1 },
      { name: 'Competitor', multiplier: signals.competitor?.multiplier ?? 1 },
      { name: 'Seasonal', multiplier: signals.seasonal?.multiplier ?? 1 },
    ];

    for (const sig of signalList) {
      const newPrice = running * sig.multiplier;
      const delta = newPrice - running;
      steps.push({
        name: sig.name,
        base: delta >= 0 ? running : newPrice,
        delta: Math.abs(delta),
        rawDelta: delta,
        type: delta > 0.5 ? 'positive' : delta < -0.5 ? 'negative' : 'neutral',
      });
      running = newPrice;
    }

    // Final bar (after constraints)
    const finalPrice = recommendation?.recommendedPrice ?? running;
    steps.push({ name: 'Final', value: finalPrice, base: 0, delta: finalPrice, type: 'end' });

    // Event overlay bar (if active)
    if (eventOverlay?.eventApplied && eventOverlay.finalCustomerPrice) {
      const eventDelta = eventOverlay.finalCustomerPrice - finalPrice;
      steps.push({
        name: 'Event',
        base: eventOverlay.finalCustomerPrice,
        delta: Math.abs(eventDelta),
        rawDelta: eventDelta,
        type: 'event',
      });
    }

    return steps;
  }, [currentPrice, signals, recommendation, eventOverlay]);

  if (data.length === 0) return null;

  const colorMap = {
    start: '#3b82f6',
    end: '#3b82f6',
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#64748b',
    event: '#f97316',
  };

  const formatDelta = (entry) => {
    if (entry.type === 'start') return `₹${Math.round(entry.delta).toLocaleString('en-IN')}`;
    if (entry.type === 'end') return `₹${Math.round(entry.delta).toLocaleString('en-IN')}`;
    if (entry.type === 'event') return `−₹${Math.round(entry.delta).toLocaleString('en-IN')}`;
    if (!entry.rawDelta) return '';
    const sign = entry.rawDelta > 0 ? '+' : '';
    return `${sign}₹${Math.round(entry.rawDelta).toLocaleString('en-IN')}`;
  };

  const CustomLabel = (props) => {
    const { x, y, width, index } = props;
    const entry = data[index];
    if (!entry) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill={colorMap[entry.type] || '#94a3b8'}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fontFamily="monospace"
      >
        {formatDelta(entry)}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const entry = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.name}</p>
        <p style={{ color: colorMap[entry.type], fontFamily: 'monospace' }}>
          {formatDelta(entry)}
        </p>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '1rem 0.75rem 0.5rem' }}>
      <p style={{
        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: 'var(--text-muted)',
        marginBottom: '0.75rem', paddingLeft: '0.5rem',
      }}>
        Signal Breakdown
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          {/* Invisible base bar for stacking */}
          <Bar dataKey="base" stackId="waterfall" fill="transparent" />
          {/* Visible delta bar */}
          <Bar dataKey="delta" stackId="waterfall" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colorMap[entry.type] || '#64748b'} />
            ))}
            <LabelList content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
