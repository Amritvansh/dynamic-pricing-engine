import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, CartesianGrid,
} from 'recharts';

/**
 * SignalBreakdown — Waterfall chart showing how each signal
 * transforms the price from current → recommended.
 */
export default function SignalBreakdown({ currentPrice, signals, recommendation, eventOverlay }) {
  const data = useMemo(() => {
    if (!currentPrice || !signals) return [];

    const items = [];
    let running = currentPrice;

    // Starting bar — Current Price
    items.push({
      name: 'Current',
      start: 0,
      end: currentPrice,
      delta: currentPrice,
      fill: '#60a5fa', // blue
      label: `₹${currentPrice.toLocaleString('en-IN')}`,
    });

    // Demand delta
    const demandNext = running * signals.demand.multiplier;
    const demandDelta = demandNext - running;
    items.push({
      name: 'Demand',
      start: running,
      end: demandNext,
      delta: demandDelta,
      fill: demandDelta > 0 ? '#34d399' : demandDelta < 0 ? '#f87171' : '#94a3b8',
      label: `${demandDelta >= 0 ? '+' : ''}₹${Math.round(demandDelta).toLocaleString('en-IN')}`,
    });
    running = demandNext;

    // Inventory delta
    const invNext = running * signals.inventory.multiplier;
    const invDelta = invNext - running;
    items.push({
      name: 'Inventory',
      start: running,
      end: invNext,
      delta: invDelta,
      fill: invDelta > 0 ? '#34d399' : invDelta < 0 ? '#f87171' : '#94a3b8',
      label: `${invDelta >= 0 ? '+' : ''}₹${Math.round(invDelta).toLocaleString('en-IN')}`,
    });
    running = invNext;

    // Competitor delta
    const compNext = running * signals.competitor.multiplier;
    const compDelta = compNext - running;
    items.push({
      name: 'Competitor',
      start: running,
      end: compNext,
      delta: compDelta,
      fill: compDelta > 0 ? '#34d399' : compDelta < 0 ? '#f87171' : '#94a3b8',
      label: `${compDelta >= 0 ? '+' : ''}₹${Math.round(compDelta).toLocaleString('en-IN')}`,
    });
    running = compNext;

    // Seasonal delta
    const seasNext = running * signals.seasonal.multiplier;
    const seasDelta = seasNext - running;
    items.push({
      name: 'Seasonal',
      start: running,
      end: seasNext,
      delta: seasDelta,
      fill: seasDelta > 0 ? '#34d399' : seasDelta < 0 ? '#f87171' : '#94a3b8',
      label: `${seasDelta >= 0 ? '+' : ''}₹${Math.round(seasDelta).toLocaleString('en-IN')}`,
    });
    running = seasNext;

    // Final recommended price (after clamp)
    const recPrice = recommendation?.recommendedPrice ?? running;
    const clampDelta = recPrice - running;
    if (Math.abs(clampDelta) > 0.5) {
      items.push({
        name: 'Clamp',
        start: running,
        end: recPrice,
        delta: clampDelta,
        fill: '#94a3b8', // grey
        label: `${clampDelta >= 0 ? '+' : ''}₹${Math.round(clampDelta).toLocaleString('en-IN')}`,
      });
    }

    // Final Price bar
    items.push({
      name: 'Final',
      start: 0,
      end: recPrice,
      delta: recPrice,
      fill: '#818cf8', // indigo
      label: `₹${recPrice.toLocaleString('en-IN')}`,
    });

    // Event overlay bar (if applicable)
    if (eventOverlay?.eventApplied) {
      const discountDelta = (eventOverlay.finalCustomerPrice ?? 0) - (eventOverlay.priceBeforeDiscount ?? recPrice);
      items.push({
        name: 'Event',
        start: recPrice,
        end: eventOverlay.finalCustomerPrice ?? recPrice,
        delta: discountDelta,
        fill: '#fbbf24', // amber
        label: `${discountDelta >= 0 ? '+' : ''}₹${Math.round(discountDelta).toLocaleString('en-IN')}`,
      });
    }

    return items;
  }, [currentPrice, signals, recommendation, eventOverlay]);

  if (data.length === 0) return null;

  const minVal = Math.min(...data.map((d) => Math.min(d.start, d.end)));
  const maxVal = Math.max(...data.map((d) => Math.max(d.start, d.end)));
  const yPad = (maxVal - minVal) * 0.15;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{d.name}</p>
        <p style={{ color: 'var(--text-secondary)' }}>{d.label}</p>
      </div>
    );
  };

  const CustomLabel = ({ x, y, width, value, index }) => {
    const d = data[index];
    if (!d) return null;
    return (
      <text x={x + width / 2} y={y - 6} fill="var(--text-secondary)" textAnchor="middle" fontSize={11} fontWeight={600}>
        {d.label}
      </text>
    );
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Signal Breakdown — Price Waterfall
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[Math.max(0, minVal - yPad), maxVal + yPad]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={currentPrice} stroke="var(--border-color)" strokeDasharray="3 3" />
          {/* Invisible base bar */}
          <Bar dataKey="start" stackId="waterfall" fill="transparent" radius={0} />
          {/* Visible delta bar */}
          <Bar dataKey={(d) => Math.abs(d.end - d.start)} stackId="waterfall" radius={[4, 4, 0, 0]} label={<CustomLabel />}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
