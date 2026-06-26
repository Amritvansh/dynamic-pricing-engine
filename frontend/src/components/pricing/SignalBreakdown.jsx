import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, CartesianGrid, LabelList
} from 'recharts';

/**
 * SignalBreakdown — Simple bar chart showing the % impact of each signal.
 *
 * Props:
 *   currentPrice  — number
 *   signals       — { demand, inventory, competitor, seasonal }
 *   recommendation — { recommendedPrice, constraintApplied }
 *   eventOverlay  — { eventApplied, priceBeforeDiscount, finalCustomerPrice, eventName }
 */
export default function SignalBreakdown({ signals }) {
  const data = useMemo(() => {
    if (!signals) return [];

    const items = [];

    const getImpact = (multiplier) => {
      const mult = multiplier ?? 1;
      return parseFloat(((mult - 1) * 100).toFixed(1));
    };

    items.push({
      name: 'Demand',
      impact: getImpact(signals.demand?.multiplier),
    });

    items.push({
      name: 'Inventory',
      impact: getImpact(signals.inventory?.multiplier),
    });

    items.push({
      name: 'Competitor',
      impact: getImpact(signals.competitor?.multiplier),
    });

    items.push({
      name: 'Seasonal',
      impact: getImpact(signals.seasonal?.multiplier),
    });

    return items;
  }, [signals]);

  if (data.length === 0) return null;

  const maxAbs = Math.max(5, ...data.map((d) => Math.abs(d.impact)));
  const yLimit = Math.ceil(maxAbs * 1.3);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    const isPositive = d.impact > 0;
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{d.name} Signal</p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Impact: <strong style={{ color: isPositive ? 'var(--accent-green)' : d.impact < 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
            {isPositive ? '+' : ''}{d.impact}%
          </strong>
        </p>
      </div>
    );
  };

  const CustomBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    // Don't show label for zero-impact signals to reduce clutter
    const label = value === 0 ? '0%' : `${value > 0 ? '+' : ''}${value}%`;
    
    return (
      <text 
        x={x + width / 2} 
        y={isPositive ? y - 8 : y + height + 8} 
        fill="var(--text-secondary)" 
        textAnchor="middle" 
        dominantBaseline={isPositive ? 'auto' : 'hanging'}
        fontSize={11} 
        fontWeight={600}
      >
        {label}
      </text>
    );
  };

  // Custom bar shape to round corners in the correct direction
  const RoundedBar = (props) => {
    const { x, y, width, height, fill, payload } = props;
    const r = 4;
    if (!height || Math.abs(height) < 1) return null;
    const isPositive = payload.impact >= 0;
    // Positive bars: round top corners; Negative bars: round bottom corners
    if (isPositive) {
      return (
        <path
          d={`M${x + r},${y} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h${-width} v${-(height - r)} a${r},${r} 0 0 1 ${r},${-r}z`}
          fill={fill}
        />
      );
    } else {
      const absH = Math.abs(height);
      return (
        <path
          d={`M${x},${y} h${width} v${absH - r} a${r},${r} 0 0 1 ${-r},${r} h${-(width - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(absH - r)}z`}
          fill={fill}
        />
      );
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Signal Impact Breakdown (%)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 24, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <YAxis domain={[-yLimit, yLimit]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={50} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine y={0} stroke="var(--border-color)" strokeWidth={2} />
          <Bar dataKey="impact" barSize={50} shape={<RoundedBar />}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.impact > 0 ? 'var(--accent-green)' : d.impact < 0 ? 'var(--accent-red)' : 'var(--border-color)'} />
            ))}
            <LabelList dataKey="impact" content={<CustomBarLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
