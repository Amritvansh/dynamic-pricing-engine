import React from 'react';
import { Tag } from 'lucide-react';

/**
 * EventOverlayCard — Shows the active promotional event discount overlay.
 * Returns null if no event is applied.
 *
 * Props:
 *   eventOverlay — the eventOverlay object from POST /pricing/calculate
 */
export default function EventOverlayCard({ eventOverlay }) {
  if (!eventOverlay || !eventOverlay.eventApplied) return null;

  const discountLabel =
    eventOverlay.discountType === 'percentage'
      ? `${eventOverlay.discountValue}% off applied`
      : eventOverlay.discountType === 'flat_amount'
      ? `₹${eventOverlay.discountValue} flat discount applied`
      : `Fixed price set to ₹${eventOverlay.discountValue}`;

  return (
    <div className="card animate-fade-in" style={{ borderLeft: '3px solid var(--accent-orange)', padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Tag size={18} color="var(--accent-orange)" />
        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-orange)' }}>
          Active Promotion
        </p>
      </div>

      {/* Event Name */}
      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {eventOverlay.eventName}
      </p>

      {/* Discount Description */}
      <p style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: 500, marginBottom: '0.75rem' }}>
        {discountLabel}
      </p>

      {/* Price Transition */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{
          fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 600,
          color: 'var(--text-muted)', textDecoration: 'line-through',
        }}>
          ₹{eventOverlay.priceBeforeDiscount?.toLocaleString('en-IN')}
        </span>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>→</span>
        <span style={{
          fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 800,
          color: 'var(--accent-orange)',
        }}>
          ₹{eventOverlay.finalCustomerPrice?.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Constraint warning */}
      {eventOverlay.constraintApplied && eventOverlay.constraintApplied !== 'NONE' && (
        <p style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)', marginBottom: '0.5rem' }}>
          ⚠ {eventOverlay.constraintApplied} — discount was capped to protect margins
        </p>
      )}

      {/* Footer */}
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
        Discount applied after market-optimal price calculation.
      </p>
    </div>
  );
}
