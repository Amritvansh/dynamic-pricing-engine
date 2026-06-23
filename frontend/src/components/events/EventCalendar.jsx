import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * EventCalendar — Month-view calendar showing event coverage.
 * No external library — vanilla JS Date.
 *
 * Props:
 *   events — array of all events (any status)
 */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EventCalendar({ events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) cells.push(null);
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return cells;
  }, [year, month]);

  // Pre-compute which days have which event statuses
  const dayEventMap = useMemo(() => {
    const map = {};
    if (!events.length) return map;

    for (const event of events) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, month, d);
        if (cellDate >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
            cellDate <= new Date(end.getFullYear(), end.getMonth(), end.getDate())) {
          if (!map[d]) map[d] = new Set();
          map[d].add(event.status);
        }
      }
    }
    return map;
  }, [events, year, month]);

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const dotColors = { ACTIVE: '#22c55e', SCHEDULED: '#3b82f6', EXPIRED: '#ef4444', DRAFT: '#64748b', INACTIVE: '#64748b' };

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{monthName}</p>
        <button className="btn btn-secondary btn-sm" onClick={nextMonth}><ChevronRight size={16} /></button>
      </div>

      {/* Day names header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.25rem' }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {calendarData.map((day, i) => (
          <div
            key={i}
            style={{
              minHeight: 44, padding: '0.25rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
              background: isToday(day) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: isToday(day) ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            }}
          >
            {day && (
              <>
                <span style={{
                  fontSize: '0.8rem', fontWeight: isToday(day) ? 700 : 400,
                  color: isToday(day) ? 'var(--accent-indigo)' : day ? 'var(--text-primary)' : 'transparent',
                }}>
                  {day}
                </span>
                {/* Event dots */}
                {dayEventMap[day] && (
                  <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                    {[...dayEventMap[day]].map((status) => (
                      <div
                        key={status}
                        style={{
                          width: status === 'EXPIRED' ? 5 : 6,
                          height: status === 'EXPIRED' ? 5 : 6,
                          borderRadius: '50%',
                          background: dotColors[status] || '#64748b',
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', justifyContent: 'center' }}>
        {[['Active', '#22c55e'], ['Upcoming', '#3b82f6'], ['Past', '#ef4444']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
