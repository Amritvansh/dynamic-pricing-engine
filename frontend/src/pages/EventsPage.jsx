import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useEvents from '../hooks/useEvents';
import EventTable from '../components/events/EventTable';
import EventForm from '../components/events/EventForm';
import EventCalendar from '../components/events/EventCalendar';
import ErrorAlert from '../components/common/ErrorAlert';
import Modal from '../components/common/Modal';
import { getActiveEvents, getUpcomingEvents, getEvents } from '../api/eventApi';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('active'); // active, upcoming, past
  
  // Hook for the table data based on active tab
  const { events, loading, error, setError, fetchEvents, addEvent, editEvent, removeEvent, activate, deactivate } = useEvents();

  // State for all events (for the calendar)
  const [calendarData, setCalendarData] = useState({ active: [], upcoming: [], past: [] });

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Fetch table data when tab changes
  useEffect(() => {
    if (activeTab === 'active') {
      fetchEvents({ status: 'ACTIVE' });
    } else if (activeTab === 'upcoming') {
      // DRAFT and SCHEDULED
      fetchEvents({ status: 'SCHEDULED,DRAFT' }); 
    } else if (activeTab === 'past') {
      fetchEvents({ status: 'EXPIRED,INACTIVE' });
    }
  }, [activeTab, fetchEvents]);

  // Fetch calendar data
  const fetchCalendarData = async () => {
    try {
      const [activeRes, upcomingRes, pastRes] = await Promise.all([
        getActiveEvents(),
        getUpcomingEvents(),
        getEvents({ status: 'EXPIRED' })
      ]);
      setCalendarData({
        active: activeRes.data || [],
        upcoming: upcomingRes.data || [],
        past: pastRes.data || []
      });
    } catch (err) {
      console.error('Failed to load calendar data', err);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handleCreate = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      setActionError(null);
      if (editingEvent) {
        await editEvent(editingEvent._id, data);
      } else {
        await addEvent(data);
      }
      setFormOpen(false);
      fetchCalendarData();
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionError(null);
      await removeEvent(deleteTarget._id);
      setDeleteTarget(null);
      fetchCalendarData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      setActionError(null);
      await activate(id);
      fetchCalendarData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      setActionError(null);
      await deactivate(id);
      fetchCalendarData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Promotional events lifecycle and performance</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} /> Create Event
        </button>
      </div>

      {(error || actionError) && (
        <ErrorAlert message={error || actionError} onDismiss={() => { setError(null); setActionError(null); }}>
          {error && (
            <button className="btn btn-secondary btn-sm" onClick={() => fetchEvents()} style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          )}
        </ErrorAlert>
      )}

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {['active', 'upcoming', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0.25rem',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab ? 600 : 500,
              color: activeTab === tab ? 'var(--accent-indigo)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-indigo)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Table ─── */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading events...</div>
      ) : (
        <EventTable
          events={events}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
      )}

      {/* ─── Calendar ─── */}
      <EventCalendar
        activeEvents={calendarData.active}
        upcomingEvents={calendarData.upcoming}
        pastEvents={calendarData.past}
      />

      {/* ─── Modals ─── */}
      <EventForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editEvent={editingEvent}
      />

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.eventName}</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>

    </div>
  );
}
