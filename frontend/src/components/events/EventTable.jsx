import React from 'react';
import EventStatusBadge from './EventStatusBadge';
import { Pencil, Trash2, Play, Pause } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EventTable({ events, onEdit, onDelete, onActivate, onDeactivate }) {
  if (!events || events.length === 0) {
    return (
      <div className="empty-state">
        <p>No events found. Create your first promotional event.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Type</th>
            <th>Discount</th>
            <th>Start</th>
            <th>End</th>
            <th>Priority</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id}>
              <td style={{ fontWeight: 500 }}>{event.eventName}</td>
              <td>
                <span className="badge badge-gray">{event.eventType?.replace(/_/g, ' ')}</span>
              </td>
              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {event.discountType === 'percentage' && `${event.discountValue}%`}
                {event.discountType === 'flat_amount' && `₹${event.discountValue}`}
                {event.discountType === 'fixed_price' && `→ ₹${event.discountValue}`}
              </td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(event.startDate)}</td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(event.endDate)}</td>
              <td>
                <span style={{
                  display: 'inline-block',
                  width: 24, height: 24,
                  borderRadius: '50%',
                  background: 'var(--bg-input)',
                  textAlign: 'center',
                  lineHeight: '24px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                }}>
                  {event.priority}
                </span>
              </td>
              <td><EventStatusBadge status={event.status} /></td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  {(event.status === 'DRAFT' || event.status === 'SCHEDULED') && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => onEdit(event)} title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button className="btn btn-success btn-sm" onClick={() => onActivate(event._id)} title="Activate">
                        <Play size={13} />
                      </button>
                    </>
                  )}
                  {event.status === 'ACTIVE' && (
                    <button className="btn btn-danger btn-sm" onClick={() => onDeactivate(event._id)} title="Deactivate">
                      <Pause size={13} />
                    </button>
                  )}
                  {(event.status === 'DRAFT' || event.status === 'INACTIVE') && (
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(event)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
