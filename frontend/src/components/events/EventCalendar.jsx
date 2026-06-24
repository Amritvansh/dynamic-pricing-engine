import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * EventCalendar — A simple month-view calendar showing dots for events.
 * 
 * Props:
 *   activeEvents: []   (green dots)
 *   upcomingEvents: [] (blue dots)
 *   pastEvents: []     (red dots)
 */
export default function EventCalendar({ activeEvents = [], upcomingEvents = [], pastEvents = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = useMemo(() => {
    const arr = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOffset; i++) {
      arr.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      
      const dayActive = activeEvents.filter(e => {
        if (!e.startDate || !e.endDate) return false;
        return dateStr >= e.startDate.split('T')[0] && dateStr <= e.endDate.split('T')[0];
      });
      const dayUpcoming = upcomingEvents.filter(e => {
        if (!e.startDate || !e.endDate) return false;
        return dateStr >= e.startDate.split('T')[0] && dateStr <= e.endDate.split('T')[0];
      });
      const dayPast = pastEvents.filter(e => {
        if (!e.startDate || !e.endDate) return false;
        return dateStr >= e.startDate.split('T')[0] && dateStr <= e.endDate.split('T')[0];
      });

      arr.push({
        day: i,
        dateStr,
        active: dayActive,
        upcoming: dayUpcoming,
        past: dayPast,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    return arr;
  }, [year, month, daysInMonth, firstDayOffset, activeEvents, upcomingEvents, pastEvents]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Promotion Calendar</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '0.25rem' }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 120, textAlign: 'center' }}>{monthName}</span>
          <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '0.25rem' }}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {weekdays.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {d}
          </div>
        ))}

        {days.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} style={{ height: 60, background: 'var(--bg-input)', opacity: 0.2, borderRadius: 6 }} />;
          
          return (
            <div key={d.day} style={{ 
              height: 60, 
              background: 'var(--bg-input)', 
              borderRadius: 6, 
              padding: '0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: d.isToday ? '1px solid var(--accent-indigo)' : '1px solid transparent',
              position: 'relative'
            }}>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: d.isToday ? 700 : 500, 
                color: d.isToday ? 'var(--accent-indigo)' : 'var(--text-secondary)' 
              }}>
                {d.day}
              </span>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem', justifyContent: 'center', marginTop: 'auto', marginBottom: '0.15rem' }}>
                {d.active.map((e, idx) => (
                  <div key={`a-${idx}`} title={e.eventName} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
                ))}
                {d.upcoming.map((e, idx) => (
                  <div key={`u-${idx}`} title={e.eventName} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                ))}
                {d.past.map((e, idx) => (
                  <div key={`p-${idx}`} title={e.eventName} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-red)' }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }}/> Active</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }}/> Upcoming</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-red)' }}/> Past</span>
      </div>
    </div>
  );
}
