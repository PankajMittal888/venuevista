import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/');
      setEvents(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}/`);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Manage Events</h2>
          <p className="text-muted">Create, edit, and configure ticket tiers and seating</p>
        </div>
        <Link to="/producer/events/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Create New Event
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : events.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm">
          <h4>No Events Found</h4>
          <p className="text-muted">Start by creating your first event.</p>
          <Link to="/producer/events/create" className="btn btn-primary align-self-center mt-2">Create Event</Link>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm p-3">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date & Venue</th>
                <th>Capacity</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="fw-bold">{e.title}</td>
                  <td><span className="badge bg-light text-dark">{e.category}</span></td>
                  <td>
                    <div>{e.venue}</div>
                    <small className="text-muted">{new Date(e.start_time).toLocaleDateString()}</small>
                  </td>
                  <td>{e.capacity}</td>
                  <td>
                    <span className={`badge ${e.status === 'PUBLISHED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <Link to={`/producer/events/${e.id}/tickets`} className="btn btn-outline-secondary btn-sm" title="Tickets & Seating">
                        <i className="bi bi-ticket-perforated"></i> Tickets & Seats
                      </Link>
                      <button onClick={() => handleDelete(e.id)} className="btn btn-outline-danger btn-sm" title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
