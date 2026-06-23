import React, { useState } from 'react';
import { Calendar, Clock, Gauge } from 'lucide-react';

export default function SettingsPanel({
  eventsEnabled,
  maxGlobalDiscount,
  schedulerEnabled,
  schedulerInterval,
  autoApplyThreshold,
  seasonalEnabled,
  onUpdateScheduler,
}) {
  const [interval, setInterval_] = useState(schedulerInterval);
  const [threshold, setThreshold] = useState(autoApplyThreshold);

  const handleToggleEvents = () => {
    onUpdateScheduler('eventsEnabled', !eventsEnabled);
  };

  const handleToggleScheduler = () => {
    onUpdateScheduler('schedulerEnabled', !schedulerEnabled);
  };

  const handleIntervalBlur = () => {
    const val = Math.max(1, Math.min(1440, Number(interval)));
    onUpdateScheduler('schedulerIntervalMinutes', val);
  };

  const handleThresholdBlur = () => {
    const val = Math.max(0, Math.min(1, Number(threshold)));
    onUpdateScheduler('autoApplyThreshold', val);
  };

  // Shared toggle renderer
  const Toggle = ({ checked, onChange, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: checked ? 'var(--accent-green)' : 'var(--bg-input)',
          border: `1px solid ${checked ? 'var(--accent-green)' : 'var(--border-color)'}`,
          transition: 'all 0.2s ease',
        }}>
          <span style={{
            position: 'absolute', top: 3, left: checked ? 21 : 3,
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }} />
        </span>
      </label>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Card 1 — Events System */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Calendar size={16} color="var(--accent-purple)" />
          <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Events System
          </p>
        </div>
        <Toggle checked={eventsEnabled} onChange={handleToggleEvents} label="Events System Enabled" />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 6 }}>
          Max discount allowed: <strong>{Math.round(maxGlobalDiscount * 100)}%</strong>
        </div>
      </div>

      {/* Card 2 — Scheduler */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={16} color="var(--accent-blue)" />
          <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Scheduler
          </p>
        </div>
        <Toggle checked={schedulerEnabled} onChange={handleToggleScheduler} label="Auto-Scheduler Enabled" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div>
            <label className="label">Interval (minutes)</label>
            <input
              className="input"
              type="number"
              min="1"
              max="1440"
              value={interval}
              onChange={(e) => setInterval_(e.target.value)}
              onBlur={handleIntervalBlur}
            />
          </div>
          <div>
            <label className="label">Auto-apply threshold</label>
            <input
              className="input"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              onBlur={handleThresholdBlur}
            />
          </div>
        </div>
      </div>

      {/* Card 3 — Summary */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Gauge size={16} color="var(--accent-orange)" />
          <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Summary
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <p>
            Seasonal pricing is{' '}
            <strong style={{ color: seasonalEnabled ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {seasonalEnabled ? 'ON' : 'OFF'}
            </strong>
          </p>
          <p>
            Scheduler runs every <strong>{schedulerInterval}</strong> minutes
          </p>
          <p>
            Auto-applies when confidence ≥ <strong>{autoApplyThreshold}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
