import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/');
      setBookings(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel/`);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Bookings</h2>
          <p className="text-muted">Manage your tickets and reservations</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm">
          <i className="bi bi-ticket-perforated fs-1 text-muted mb-3"></i>
          <h4>No Bookings Yet</h4>
          <p className="text-muted">You haven't reserved tickets for any events yet.</p>
          <Link to="/events" className="btn btn-primary align-self-center mt-2">Discover Events</Link>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((b) => (
            <div key={b.id} className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <span className="badge bg-light text-dark font-monospace mb-1">{b.booking_reference}</span>
                    <h5 className="fw-bold mb-1">{b.event_title}</h5>
                    <div className="text-muted small">
                      Tier: <strong>{b.ticket_type_name}</strong> | Qty: <strong>{b.quantity}</strong>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="small text-muted">Seats:</div>
                    <div className="small fw-semibold">
                      {b.booking_seats && b.booking_seats.length > 0
                        ? b.booking_seats.map((s) => `${s.section_name} R${s.row}-${s.seat_number}`).join(', ')
                        : 'General Admission'}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="fs-5 fw-bold text-primary">${b.total_amount}</div>
                    <span className={`badge ${b.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="col-md-2 text-md-end mt-3 mt-md-0">
                    {b.status !== 'CANCELLED' && (
                      <button onClick={() => handleCancel(b.id)} className="btn btn-outline-danger btn-sm">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
