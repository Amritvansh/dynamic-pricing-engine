import React from 'react';

const getConfig = (coverageDays) => {
  if (coverageDays == null) return { color: 'var(--text-muted)', label: 'UNKNOWN', percent: 0 };
  if (coverageDays === 0) return { color: 'var(--accent-red)', label: 'ZERO', percent: 2 };
  if (coverageDays < 3) return { color: 'var(--accent-red)', label: 'CRITICAL', percent: Math.min(15, (coverageDays / 3) * 15) };
  if (coverageDays < 7) return { color: 'var(--accent-orange)', label: 'LOW', percent: 15 + ((coverageDays - 3) / 4) * 35 };
  if (coverageDays < 15) return { color: 'var(--accent-green)', label: 'NORMAL', percent: 50 + ((coverageDays - 7) / 8) * 40 };
  return { color: 'var(--accent-blue)', label: 'HIGH', percent: 100 };
};

export default function CoverageMeter({ coverageDays }) {
  const config = getConfig(coverageDays);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 180 }}>
      {/* Bar */}
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: 'var(--bg-input)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${config.percent}%`,
            height: '100%',
            borderRadius: 4,
            background: config.color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {/* Label */}
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: config.color, whiteSpace: 'nowrap' }}>
        {coverageDays != null ? `${coverageDays}d` : '—'} · {config.label}
      </span>
    </div>
  );
}
