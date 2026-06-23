import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { getEvents, getActiveEvents, getUpcomingEvents, createEvent, updateEvent, deleteEvent, activateEvent, deactivateEvent } from '../api/eventApi';
import EventTable from '../components/events/EventTable';
import EventForm from '../components/events/EventForm';
import EventCalendar from '../components/events/EventCalendar';
import EventPerformanceCard from '../components/analytics/EventPerformanceCard';
import ErrorAlert from '../components/common/ErrorAlert';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [expandedPastId, setExpandedPastId] = useState(null);

  const fetchTabData = useCallback(async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (tab === 'active') res = await getActiveEvents();
      else if (tab === 'upcoming') res = await getUpcomingEvents();
      else res = await getEvents({ status: 'EXPIRED' });
      setEvents(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllEvents = useCallback(async () => {
    try {
      const res = await getEvents();
      setAllEvents(res.data || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchTabData(activeTab);
    fetchAllEvents();
  }, [activeTab, fetchTabData, fetchAllEvents]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedPastId(null);
  };

  const handleCreate = async (data) => {
    await createEvent(data);
    fetchTabData(activeTab);
    fetchAllEvents();
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setFormOpen(true);
  };

  const handleUpdate = async (data) => {
    if (editEvent) {
      await updateEvent(editEvent._id, data);
      setEditEvent(null);
      fetchTabData(activeTab);
      fetchAllEvents();
    }
  };

  const handleDelete = async (event) => {
    if (window.confirm(`Delete "${event.eventName}"?`)) {
      await deleteEvent(event._id);
      fetchTabData(activeTab);
      fetchAllEvents();
    }
  };

  const handleActivate = async (id) => {
    await activateEvent(id);
    fetchTabData(activeTab);
    fetchAllEvents();
  };

  const handleDeactivate = async (id) => {
    await deactivateEvent(id);
    fetchTabData(activeTab);
    fetchAllEvents();
  };

  const openCreateForm = () => {
    setEditEvent(null);
    setFormOpen(true);
  };

  const togglePastExpand = (eventId) => {
    setExpandedPastId(expandedPastId === eventId ? null : eventId);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Promotional events lifecycle and performance</p>
        </div>
        {activeTab === 'upcoming' && (
          <button className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* ─── Tab Bar ─── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.25rem' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              background: activeTab === tab.key ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            {!loading && (
              <span style={{
                marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700,
                background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)',
                padding: '0.1rem 0.4rem', borderRadius: 6,
              }}>
                {events.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading events...</p>
        </div>
      )}

      {/* ─── Active & Upcoming tabs — standard EventTable ─── */}
      {!loading && activeTab !== 'past' && (
        <EventTable
          events={events}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
      )}

      {/* ─── Past tab — EventTable with expandable performance rows ─── */}
      {!loading && activeTab === 'past' && (
        <>
          {events.length === 0 ? (
            <div className="empty-state"><p>No expired events found.</p></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Discount</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <React.Fragment key={event._id}>
                      <tr>
                        <td style={{ fontWeight: 500 }}>{event.eventName}</td>
                        <td><span className="badge badge-gray">{event.eventType?.replace(/_/g, ' ')}</span></td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {event.discountType === 'percentage' && `${event.discountValue}%`}
                          {event.discountType === 'flat_amount' && `₹${event.discountValue}`}
                          {event.discountType === 'fixed_price' && `→ ₹${event.discountValue}`}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(event.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(event.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td><span className="badge badge-red">EXPIRED</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => togglePastExpand(event._id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {expandedPastId === event._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Performance
                          </button>
                        </td>
                      </tr>
                      {/* Expandable performance row */}
                      {expandedPastId === event._id && (
                        <tr>
                          <td colSpan={7} style={{ padding: '1rem', background: 'var(--bg-secondary)' }}>
                            <EventPerformanceCard eventId={event._id} compact />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── Event Calendar ─── */}
      <div style={{ marginTop: '1.5rem' }}>
        <EventCalendar events={allEvents} />
      </div>

      {/* ─── Event Form Modal ─── */}
      <EventForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditEvent(null); }}
        onSubmit={editEvent ? handleUpdate : handleCreate}
        editEvent={editEvent}
      />
    </div>
  );
}
